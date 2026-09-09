import { dbConnect } from '@/lib/db';
import { PricingPlan } from '@/models/pricingPlan';
import { PLANS, type CheckoutPlanKey, type PlanPricingDetail } from './types';

/**
 * Fetch dynamic pricing plans from the database, falling back to static constants.
 */
export async function getDynamicPlans(): Promise<Record<CheckoutPlanKey, PlanPricingDetail>> {
  try {
    await dbConnect();
    const dbPlans = await PricingPlan.find({ isActive: true }).lean();

    if (!dbPlans || dbPlans.length === 0) {
      return PLANS;
    }

    const mergedPlans: Record<CheckoutPlanKey, PlanPricingDetail> = { ...PLANS };

    for (const plan of dbPlans) {
      const key = plan.planKey as CheckoutPlanKey;
      if (mergedPlans[key]) {
        mergedPlans[key] = {
          ...mergedPlans[key],
          name: plan.name || mergedPlans[key].name,
          badge: plan.badge !== undefined ? plan.badge : mergedPlans[key].badge,
          priceUsd: plan.priceUsd !== undefined ? plan.priceUsd : mergedPlans[key].priceUsd,
          period: plan.period || mergedPlans[key].period,
          mode: plan.mode || mergedPlans[key].mode,
          description: plan.description || mergedPlans[key].description,
          features: plan.features && plan.features.length > 0 ? plan.features : mergedPlans[key].features,
          aiCredits: plan.aiCredits !== undefined ? plan.aiCredits : mergedPlans[key].aiCredits,
        };
      }
    }

    return mergedPlans;
  } catch (err) {
    console.error('Failed to load dynamic pricing from DB, falling back to default:', err);
    return PLANS;
  }
}

/**
 * Seed initial pricing plan documents into the database if the collection is currently empty.
 */
export async function seedDefaultPricingPlans() {
  await dbConnect();
  const count = await PricingPlan.countDocuments();
  if (count === 0) {
    const plansToSeed = Object.values(PLANS).map((p) => ({
      planKey: p.id,
      name: p.name,
      badge: p.badge || '',
      priceUsd: p.priceUsd,
      period: p.period,
      mode: p.mode,
      description: p.description,
      features: p.features,
      aiCredits: p.aiCredits,
      isActive: true,
    }));
    await PricingPlan.insertMany(plansToSeed);
  }
}
