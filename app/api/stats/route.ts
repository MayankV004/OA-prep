import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Pattern, Topic } from '@/models';

export async function GET() {
  try {
    await dbConnect();

    const patterns = await Pattern.find().select('variations').lean();
    const patternCount = patterns.length || 10;
    
    let variationCount = 0;
    let problemCount = 0;
    for (const p of patterns) {
      variationCount += p.variations?.length || 0;
      for (const v of p.variations || []) {
        problemCount += v.problems?.length || 0;
      }
    }

    const topicCount = await Topic.countDocuments();

    return NextResponse.json({
      patternCount: patternCount || 10,
      variationCount: variationCount ? `${Math.floor(variationCount / 10) * 10}+` : '90+',
      problemCount: problemCount ? `${Math.floor(problemCount / 100) * 100}+` : '500+',
      topicCount: topicCount || 7,
    });
  } catch (error) {
    return NextResponse.json({
      patternCount: 10,
      variationCount: '90+',
      problemCount: '500+',
      topicCount: 7,
    });
  }
}
