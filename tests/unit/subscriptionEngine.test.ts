describe('MECHFIND Mechanic Subscription & Lead Quota Engine', () => {
  interface SubscriptionPlan {
    id: string;
    tier: 'free' | 'pro' | 'premium';
    leadQuotaMonthly: number;
    searchRankingWeight: number;
    instantBookingEligible: boolean;
  }

  interface MechanicSub {
    mechanicId: string;
    plan: SubscriptionPlan;
    leadsRemaining: number;
    isActive: boolean;
  }

  const FREE_PLAN: SubscriptionPlan = {
    id: 'free',
    tier: 'free',
    leadQuotaMonthly: 15,
    searchRankingWeight: 1.0,
    instantBookingEligible: false,
  };

  const PRO_PLAN: SubscriptionPlan = {
    id: 'pro',
    tier: 'pro',
    leadQuotaMonthly: 80,
    searchRankingWeight: 1.5,
    instantBookingEligible: true,
  };

  const PREMIUM_PLAN: SubscriptionPlan = {
    id: 'premium',
    tier: 'premium',
    leadQuotaMonthly: 250,
    searchRankingWeight: 2.0,
    instantBookingEligible: true,
  };

  it('deducts 1 lead quota when mechanic accepts assistance job', () => {
    const sub: MechanicSub = {
      mechanicId: 'mech_01',
      plan: PRO_PLAN,
      leadsRemaining: 80,
      isActive: true,
    };

    const acceptDispatch = (s: MechanicSub): boolean => {
      if (s.leadsRemaining <= 0) return false;
      s.leadsRemaining -= 1;
      return true;
    };

    const accepted = acceptDispatch(sub);
    expect(accepted).toBe(true);
    expect(sub.leadsRemaining).toBe(79);
  });

  it('blocks dispatch receipt when lead quota is exhausted', () => {
    const sub: MechanicSub = {
      mechanicId: 'mech_02',
      plan: FREE_PLAN,
      leadsRemaining: 0,
      isActive: true,
    };

    const acceptDispatch = (s: MechanicSub): boolean => {
      if (s.leadsRemaining <= 0) return false;
      s.leadsRemaining -= 1;
      return true;
    };

    const accepted = acceptDispatch(sub);
    expect(accepted).toBe(false);
    expect(sub.leadsRemaining).toBe(0);
  });

  it('boosts search ranking score according to tier multiplier', () => {
    const calculateSearchScore = (baseDistanceKm: number, rating: number, plan: SubscriptionPlan) => {
      // Lower distance is better (score inverted), higher rating is better, tier weight scales score
      const distanceScore = Math.max(1, 20 - baseDistanceKm);
      const ratingScore = rating * 4;
      return (distanceScore + ratingScore) * plan.searchRankingWeight;
    };

    const scoreFree = calculateSearchScore(2.0, 4.8, FREE_PLAN);
    const scorePro = calculateSearchScore(2.0, 4.8, PRO_PLAN);
    const scorePremium = calculateSearchScore(2.0, 4.8, PREMIUM_PLAN);

    expect(scorePro).toBeGreaterThan(scoreFree);
    expect(scorePremium).toBeGreaterThan(scorePro);
    expect(scorePremium / scoreFree).toBeCloseTo(2.0 / 1.0);
  });
});

