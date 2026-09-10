import { NextResponse } from 'next/server';
import { getDynamicPlans } from '@/lib/payments';

export const revalidate = 300;

export async function GET() {
  try {
    const plans = await getDynamicPlans();
    return NextResponse.json(
      {
        success: true,
        plans,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
          'CDN-Cache-Control': 'max-age=300',
          'Vercel-CDN-Cache-Control': 'max-age=300',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in /api/pricing:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve pricing plans' },
      { status: 500 }
    );
  }
}
