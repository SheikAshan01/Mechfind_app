describe('MECHFIND Mechanic Incentives & Loyalty Engine', () => {
  interface RewardEvent {
    mechanicId: string;
    ruleCode: string;
    rewardAmount: number;
    timestamp: number;
  }

  const MILESTONE_TIERS = [
    { threshold: 10, bonus: 500, code: 'MILESTONE_10' },
    { threshold: 25, bonus: 1500, code: 'MILESTONE_25' },
    { threshold: 50, bonus: 3500, code: 'MILESTONE_50' },
  ];

  it('determines correct milestone reward based on completed job count', () => {
    const getMilestoneForJobCount = (completedCount: number) => {
      const match = [...MILESTONE_TIERS]
        .reverse()
        .find((t) => completedCount >= t.threshold);
      return match || null;
    };

    expect(getMilestoneForJobCount(5)).toBeNull();
    expect(getMilestoneForJobCount(10)?.bonus).toBe(500);
    expect(getMilestoneForJobCount(24)?.bonus).toBe(500);
    expect(getMilestoneForJobCount(25)?.bonus).toBe(1500);
    expect(getMilestoneForJobCount(52)?.bonus).toBe(3500);
  });

  it('prevents fraudulent duplicate reward credit within cooldown window', () => {
    const history: RewardEvent[] = [];
    const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

    const attemptCredit = (mechanicId: string, ruleCode: string, amount: number, now: number): boolean => {
      const recent = history.find(
        (h) => h.mechanicId === mechanicId && h.ruleCode === ruleCode && now - h.timestamp < COOLDOWN_MS
      );
      if (recent) {
        return false; // duplicate blocked
      }
      history.push({ mechanicId, ruleCode, rewardAmount: amount, timestamp: now });
      return true;
    };

    const t0 = 1000000;
    const firstAttempt = attemptCredit('mech_01', 'PEAK_NIGHT_BONUS', 200, t0);
    expect(firstAttempt).toBe(true);

    // Immediate second attempt within 5 minutes (fraud/race condition)
    const duplicateAttempt = attemptCredit('mech_01', 'PEAK_NIGHT_BONUS', 200, t0 + 5 * 60 * 1000);
    expect(duplicateAttempt).toBe(false);

    // Legitimate attempt after cooldown (2 hours later)
    const afterCooldown = attemptCredit('mech_01', 'PEAK_NIGHT_BONUS', 200, t0 + 2 * 60 * 60 * 1000);
    expect(afterCooldown).toBe(true);
  });

  it('calculates platform commission discount based on loyalty tier', () => {
    const BASE_COMMISSION_PCT = 15.0; // 15% standard commission

    const LOYALTY_DISCOUNTS = {
      bronze: 0.0,
      silver: 1.0,
      gold: 3.0,
      platinum: 5.0,
    };

    const getNetCommissionPct = (tier: keyof typeof LOYALTY_DISCOUNTS) => {
      return BASE_COMMISSION_PCT - LOYALTY_DISCOUNTS[tier];
    };

    expect(getNetCommissionPct('bronze')).toBe(15.0);
    expect(getNetCommissionPct('silver')).toBe(14.0);
    expect(getNetCommissionPct('gold')).toBe(12.0);
    expect(getNetCommissionPct('platinum')).toBe(10.0);
  });
});

