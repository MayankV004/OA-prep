import { NextResponse } from 'next/server';
import { getDynamicPlans } from '@/lib/payments';

export async function GET() {
  try {
    const plans = await getDynamicPlans();
    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error: any) {
    console.error('Error in /api/pricing:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve pricing plans' },
      { status: 500 }
    );
  }
}
