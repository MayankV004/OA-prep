import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Pattern, Topic } from '@/models';
import { withCache } from '@/lib/cache';

export async function GET() {
  try {
    await dbConnect();

    const data = await withCache('global:stats', 600, async () => {
      // Single aggregation pipeline — no full document load into Node.js memory
      const [agg] = await Pattern.aggregate([
        {
          $group: {
            _id: null,
            patternCount: { $sum: 1 },
            variationCount: {
              $sum: { $size: { $ifNull: ['$variations', []] } },
            },
            problemCount: {
              $sum: {
                $sum: {
                  $map: {
                    input: { $ifNull: ['$variations', []] },
                    as: 'v',
                    in: { $size: { $ifNull: ['$$v.problems', []] } },
                  },
                },
              },
            },
          },
        },
      ]);

      const topicCount = await Topic.countDocuments();

      return {
        patternCount: agg?.patternCount ?? 0,
        variationCount: agg?.variationCount ?? 0,
        problemCount: agg?.problemCount ?? 0,
        topicCount,
      };
    });

    return NextResponse.json(
      {
        patternCount: data.patternCount || 10,
        variationCount: data.variationCount
          ? `${Math.floor(data.variationCount / 10) * 10}+`
          : '90+',
        problemCount: data.problemCount
          ? `${Math.floor(data.problemCount / 100) * 100}+`
          : '500+',
        topicCount: data.topicCount || 7,
      },
      {
        headers: {
          // CDN-cacheable: serves from edge for 10 min, stale for 20 min
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({
      patternCount: 10,
      variationCount: '90+',
      problemCount: '500+',
      topicCount: 7,
    });
  }
}
