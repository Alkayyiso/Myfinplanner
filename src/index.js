// ─────────────────────────────────────────────────────────────────────────────
// engine/index.js
// Pure financial logic. No React, no UI, no side effects.
// Every function: (inputs) => output. Fully testable in isolation.
// ─────────────────────────────────────────────────────────────────────────────

import {
  INFLATION, THRESHOLDS, MEDICAL, BABY_OUTLAY, BABY_RECURRING,
  SITTER_RATES, TRANSPORT, HOUSING, GOAL_CONFLICTS,
  GRANDPARENT_CARE_OFFSET, MATERNITY_LEAVE, INCOME_BRACKETS,
} from "../data/knowledge.js";

// ─── UTILITIES ────────────────────────────────────────────────────────────────
export const round = (n) => Math.round(n);
export const pct   = (a, b) => (b ? round((a / b) * 100) : 0);

export function inflationAdjust(amount, year) {
  return round(amount * (INFLATION.yearFactor[year] ?? 1));
}

export function medicalInflationProject(amount, monthsAhead) {
  const years = monthsAhead / 12;
  return round(amount * Math.pow(1 + INFLATION.sectoral.medical, years));
}

// ─── CASHFLOW ENGINE ─────────────────────────────────────────────────────────
// Core function: computes every expense and margin from scenario state.
export function computeCashflow(scenario, year = 2026) {
  const inf = INFLATION.yearFactor[year] ?? 1;

  const totalIncome = scenario.husbandNetIncome +
                      scenario.wifeNetIncome +
                      (scenario.sideIncome ?? 0);

  // Housing
  const rentCost    = scenario.rentActive
    ? round((scenario.rentAmount ?? 0) * inf)
    : 0;
  const iplCost     = round((scenario.ipl ?? 0) * inf);
  const sinkCost    = round((scenario.sinkingFund ?? 0) * inf);
  const housingCost = rentCost + iplCost + sinkCost;

  // Transport
  const carCost       = scenario.carCicilanActive
    ? round((scenario.carCicilanAmount ?? 0) * inf)
    : 0;
  const transportMode = TRANSPORT.modes[scenario.transportMode] ?? TRANSPORT.modes["krl_motor"];
  const transportOpex = round(transportMode.cost * inf);
  const vehicleCost   = carCost + transportOpex;

  // Essentials
  const groceryCost   = round((scenario.groceries ?? 0) * inf);
  const bpjsCost      = round((scenario.bpjsPremium ?? 0) * inf);
  const essentialCost = groceryCost + bpjsCost;

  // Debt
  const debtCost = round((scenario.debtMonthlyPayment ?? 0) * inf);

  // Baby overhead
  const sitterKey  = scenario.sitterType ?? "none";
  const sitterRate = SITTER_RATES[sitterKey]?.cost ?? 0;
  const grandOffset = scenario.grandparentCareOffset ?? 0;
  const effectiveSitter = Math.max(0, sitterRate - grandOffset);

  const babyCost = scenario.babyPlanned
    ? round((effectiveSitter + (scenario.diapers ?? 0) + (scenario.vaccinationPeds ?? 0) + (scenario.nutrition ?? 0)) * inf)
    : 0;

  // Lifestyle
  const lifestyleCost = round((scenario.lifestyleSpend ?? 0) * inf);

  // Investment (not inflation-adjusted — it's a savings target, not a cost)
  const investmentAmount = scenario.monthlyInvestment ?? 0;

  const totalExpenses = housingCost + vehicleCost + essentialCost +
                        debtCost + babyCost + lifestyleCost + investmentAmount;

  const monthlyMargin = totalIncome - totalExpenses;
  const marginPct     = pct(monthlyMargin, totalIncome);
  const investPct     = pct(investmentAmount, totalIncome);
  const annualSavings = round(Math.max(0, monthlyMargin + investmentAmount) * 12);

  // Allocation breakdown for pie/bar display
  const allocationBreakdown = [
    { id: "housing",    label: { id: "Housing & properti",   en: "Housing & property"  }, value: housingCost,    color: "#378ADD" },
    { id: "vehicle",    label: { id: "Kendaraan",            en: "Vehicle"              }, value: vehicleCost,    color: "#7F77DD" },
    { id: "essentials", label: { id: "Kebutuhan pokok",      en: "Essentials"           }, value: essentialCost,  color: "#1D9E75" },
    { id: "debt",       label: { id: "Cicilan / utang",      en: "Debt payments"        }, value: debtCost,       color: "#E24B4A" },
    { id: "baby",       label: { id: "Baby overhead",        en: "Baby overhead"        }, value: babyCost,       color: "#D85A30" },
    { id: "lifestyle",  label: { id: "Gaya hidup",           en: "Lifestyle"            }, value: lifestyleCost,  color: "#EF9F27" },
    { id: "investment", label: { id: "Investasi / tabungan", en: "Investment / savings" }, value: investmentAmount,color: "#639922" },
    { id: "free",       label: { id: "Kas bebas",            en: "Free cash"            }, value: Math.max(0, monthlyMargin), color: "#B4B2A9" },
  ].filter((s) => s.value > 0);

  return {
    totalIncome, rentCost, iplCost, sinkCost, housingCost,
    carCost, transportOpex, vehicleCost,
    groceryCost, bpjsCost, essentialCost,
    debtCost, babyCost, lifestyleCost,
    investmentAmount, totalExpenses,
    monthlyMargin, marginPct, investPct, annualSavings,
    allocationBreakdown,
    // sub-components for display
    sitterCost: round(effectiveSitter * inf),
    sitterRaw:  round(sitterRate * inf),
    grandOffsetApplied: grandOffset > 0,
  };
}

// ─── VERDICT ENGINE ───────────────────────────────────────────────────────────
export function computeVerdict(cashflow, hasBaby = false) {
  const { totalIncome, monthlyMargin, marginPct } = cashflow;
  const T = hasBaby ? THRESHOLDS.withBaby : THRESHOLDS.withoutBaby;

  if (monthlyMargin < 0) return {
    level: "deficit", gap: Math.abs(monthlyMargin),
    color: "#791F1F", bg: "#FCEBEB", border: "#F7C1C1",
  };
  if (totalIncome < T.survival) return {
    level: "nogo", gap: T.survival - totalIncome,
    color: "#633806", bg: "#FAEEDA", border: "#FAC775",
  };
  if (totalIncome < T.comfortable || marginPct < 10) return {
    level: "conditional", gap: Math.max(0, T.comfortable - totalIncome),
    color: "#633806", bg: "#FAEEDA", border: "#FAC775",
  };
  if (totalIncome >= T.optimal && marginPct >= 20) return {
    level: "optimal", gap: 0,
    color: "#085041", bg: "#E1F5EE", border: "#9FE1CB",
  };
  return {
    level: "go", gap: 0,
    color: "#085041", bg: "#E1F5EE", border: "#9FE1CB",
  };
}

// ─── LEVER ENGINE ─────────────────────────────────────────────────────────────
// Returns top 5 levers ranked by monthly gap closure impact.
export function computeLevers(scenario, cashflow) {
  const { monthlyMargin, babyCost, lifestyleCost, vehicleCost, totalIncome } = cashflow;
  const gap = Math.abs(Math.min(0, monthlyMargin));
  // Even for GO scenarios, show levers if margin < 20%
  const effectiveGap = gap > 0 ? gap : Math.max(0, totalIncome * 0.20 - monthlyMargin);

  const levers = [];

  // ── Lever 1: Downgrade babysitter ────────────────────────────────────────
  const currentSitter = SITTER_RATES[scenario.sitterType ?? "none"]?.cost ?? 0;
  const liveoutCost   = SITTER_RATES.liveout_fullweek.cost;
  if (scenario.babyPlanned && currentSitter > liveoutCost) {
    const saving = currentSitter - liveoutCost;
    levers.push({
      id: "downgrade_sitter",
      category: "lifestyle",
      monthlySaving: saving,
      gapClosurePct: effectiveGap > 0 ? pct(saving, effectiveGap) : 0,
      timelineGainMonths: null,
      confidence: "certain",
      stateChange: { sitterType: "liveout_fullweek" },
    });
  }

  // ── Lever 2: Remove car cicilan ──────────────────────────────────────────
  if (scenario.carCicilanActive && scenario.carCicilanAmount > 0) {
    const saving = scenario.carCicilanAmount;
    levers.push({
      id: "remove_car_cicilan",
      category: "lifestyle",
      monthlySaving: saving,
      gapClosurePct: effectiveGap > 0 ? pct(saving, effectiveGap) : 0,
      timelineGainMonths: null,
      confidence: "certain",
      stateChange: { carCicilanActive: false, carCicilanAmount: 0 },
    });
  }

  // ── Lever 3: Switch to EV + KRL ──────────────────────────────────────────
  const currentTransportCost = TRANSPORT.modes[scenario.transportMode]?.cost ?? 0;
  const evKrlCost            = TRANSPORT.modes["ev_krl"].cost;
  if (currentTransportCost > evKrlCost) {
    const saving = currentTransportCost - evKrlCost;
    levers.push({
      id: "switch_transport_ev",
      category: "lifestyle",
      monthlySaving: saving,
      gapClosurePct: effectiveGap > 0 ? pct(saving, effectiveGap) : 0,
      timelineGainMonths: null,
      confidence: "certain",
      stateChange: { transportMode: "ev_krl" },
    });
  }

  // ── Lever 4: Reduce lifestyle spending 30% ───────────────────────────────
  const lifestyleReduction = round(lifestyleCost * 0.30);
  if (lifestyleReduction >= 200_000) {
    levers.push({
      id: "reduce_lifestyle",
      category: "lifestyle",
      monthlySaving: lifestyleReduction,
      gapClosurePct: effectiveGap > 0 ? pct(lifestyleReduction, effectiveGap) : 0,
      timelineGainMonths: null,
      confidence: "certain",
      stateChange: { lifestyleSpend: round(scenario.lifestyleSpend * 0.70) },
    });
  }

  // ── Lever 5: Grandparent childcare ───────────────────────────────────────
  if (scenario.babyPlanned && (scenario.grandparentCareOffset ?? 0) === 0) {
    const saving = GRANDPARENT_CARE_OFFSET;
    levers.push({
      id: "grandparent_childcare",
      category: "lifestyle",
      monthlySaving: saving,
      gapClosurePct: effectiveGap > 0 ? pct(saving, effectiveGap) : 0,
      timelineGainMonths: null,
      confidence: "likely",
      stateChange: { grandparentCareOffset: GRANDPARENT_CARE_OFFSET },
    });
  }

  // ── Lever 6: ASI exclusive (no formula) ─────────────────────────────────
  if (scenario.babyPlanned && (scenario.nutrition ?? 0) > 0) {
    const saving = scenario.nutrition;
    levers.push({
      id: "asi_exclusive",
      category: "lifestyle",
      monthlySaving: saving,
      gapClosurePct: effectiveGap > 0 ? pct(saving, effectiveGap) : 0,
      timelineGainMonths: null,
      confidence: "certain",
      stateChange: { nutrition: 0 },
    });
  }

  // ── Lever 7: Delay conception (timeline lever) ────────────────────────────
  if (scenario.babyPlanned) {
    const delayMonths    = 6;
    const monthlySurplus = Math.max(0, cashflow.monthlyMargin + scenario.monthlyInvestment);
    const extraSavings   = monthlySurplus * delayMonths;
    const currentMonths  = scenario.conceptionMonthsFromNow ?? 12;
    if (currentMonths < 24) {
      levers.push({
        id: "delay_conception",
        category: "timeline",
        monthlySaving: 0,
        gapClosurePct: 0,
        timelineGainMonths: delayMonths,
        extraSavings,
        confidence: "certain",
        vars: { months: delayMonths, amount: fmtAmount(extraSavings) },
        stateChange: { conceptionMonthsFromNow: currentMonths + delayMonths },
      });
    }
  }

  // ── Lever 8: Add side income (aspirational) ───────────────────────────────
  const sideIncomeTarget = effectiveGap > 0
    ? Math.min(effectiveGap, 3_000_000)
    : 2_000_000;
  levers.push({
    id: "add_side_income",
    category: "income",
    monthlySaving: sideIncomeTarget,
    gapClosurePct: effectiveGap > 0 ? pct(sideIncomeTarget, effectiveGap) : 0,
    timelineGainMonths: null,
    confidence: "aspirational",
    vars: { amount: fmtAmount(sideIncomeTarget) },
    stateChange: { sideIncome: (scenario.sideIncome ?? 0) + sideIncomeTarget },
  });

  // Sort: lifestyle levers by saving desc, timeline levers after, income levers last
  const order = { lifestyle: 0, timeline: 1, income: 2 };
  levers.sort((a, b) => {
    const catDiff = order[a.category] - order[b.category];
    if (catDiff !== 0) return catDiff;
    return b.monthlySaving - a.monthlySaving;
  });

  return levers.slice(0, 5).map((l) => ({ ...l, isActive: false }));
}

// Apply active levers to get adjusted cashflow
export function applyLevers(levers, activeIds, scenario, year = 2026) {
  let adjustedScenario = { ...scenario };
  levers
    .filter((l) => activeIds.includes(l.id))
    .forEach((l) => {
      adjustedScenario = { ...adjustedScenario, ...l.stateChange };
    });
  const adjustedCashflow = computeCashflow(adjustedScenario, year);
  const adjustedVerdict  = computeVerdict(adjustedCashflow, adjustedScenario.babyPlanned);
  const totalLeverSaving = levers
    .filter((l) => activeIds.includes(l.id))
    .reduce((a, l) => a + (l.monthlySaving ?? 0), 0);
  return { adjustedCashflow, adjustedVerdict, totalLeverSaving, adjustedScenario };
}

// ─── TIMELINE ENGINE ──────────────────────────────────────────────────────────
export function computeTimeline(scenario, goals, cashflow, year = 2026) {
  const milestones = [];
  const monthlySurplus = Math.max(0, cashflow.monthlyMargin + cashflow.investmentAmount);

  // Wedding milestone
  if (goals.primary?.id === "wedding" || goals.supporting?.some((g) => g.id === "wedding")) {
    const weddingMonths = scenario.weddingMonthsFromNow ?? 6;
    const accumulated   = scenario.weddingFundAccumulated ?? 0;
    const target        = scenario.weddingTargetCost ?? 0;
    const projectedSave = monthlySurplus * weddingMonths;
    const totalByThen   = accumulated + projectedSave;
    milestones.push({
      id: "wedding", icon: "rings",
      label: { id: "Pernikahan", en: "Wedding" },
      monthsFromNow: weddingMonths,
      amount: target,
      projectedReadiness: totalByThen,
      readyByThen: totalByThen >= target,
      shortfall: Math.max(0, target - totalByThen),
    });
  }

  // Conception milestone
  if (scenario.babyPlanned) {
    const conceptionMonths = scenario.conceptionMonthsFromNow ?? 12;
    const birthMonths      = conceptionMonths + 9;
    const capitalNeeded    = BABY_OUTLAY.total.min;
    const capitalInflated  = medicalInflationProject(capitalNeeded, birthMonths);
    const birthCostInflated= medicalInflationProject(MEDICAL.birth.normalPrivateHospital, birthMonths);
    const totalOneTimeCost = capitalInflated + (scenario._flags?.bpjsWarning ? birthCostInflated : 0);
    const projectedSave    = monthlySurplus * birthMonths;
    const accumulated      = (scenario.emergencyFundMonths ?? 0) > 0
      ? 0 // don't double-count EF as baby savings
      : 0;
    milestones.push({
      id: "conception", icon: "baby",
      label: { id: "Mulai coba hamil", en: "Start trying to conceive" },
      monthsFromNow: conceptionMonths,
      amount: null,
      readyByThen: true,
      isEvent: true,
    });
    milestones.push({
      id: "birth", icon: "baby",
      label: { id: "Perkiraan kelahiran", en: "Estimated birth" },
      monthsFromNow: birthMonths,
      amount: totalOneTimeCost,
      projectedReadiness: projectedSave,
      readyByThen: projectedSave >= totalOneTimeCost,
      shortfall: Math.max(0, totalOneTimeCost - projectedSave),
      inflationNote: birthMonths > 12,
    });
  }

  // Emergency fund milestone
  const efTarget       = (scenario.emergencyFundTarget ?? 6);
  const efCurrent      = scenario.emergencyFundMonths ?? 0;
  const efNeededMonths = Math.max(0, efTarget - efCurrent);
  const efMoneyNeeded  = efNeededMonths * cashflow.totalExpenses;
  const monthsToEF     = cashflow.investmentAmount > 0
    ? Math.ceil(efMoneyNeeded / cashflow.investmentAmount)
    : 99;
  if (efNeededMonths > 0) {
    milestones.push({
      id: "emergency_fund", icon: "shield",
      label: { id: "Dana darurat tercapai", en: "Emergency fund target reached" },
      monthsFromNow: monthsToEF,
      amount: efMoneyNeeded,
      projectedReadiness: efMoneyNeeded,
      readyByThen: monthsToEF <= 12,
    });
  }

  milestones.sort((a, b) => (a.monthsFromNow ?? 99) - (b.monthsFromNow ?? 99));

  // Runway summary for baby goal
  const runway = scenario.babyPlanned ? {
    conceptionMonthsFromNow: scenario.conceptionMonthsFromNow ?? 12,
    birthMonthsFromNow: (scenario.conceptionMonthsFromNow ?? 12) + 9,
    monthlySurplus,
    projectedSavingsAtBirth: monthlySurplus * ((scenario.conceptionMonthsFromNow ?? 12) + 9),
    capitalOutlayMin: BABY_OUTLAY.total.min,
    capitalOutlayMax: BABY_OUTLAY.total.max,
    capitalInflatedMin: medicalInflationProject(BABY_OUTLAY.total.min, (scenario.conceptionMonthsFromNow ?? 12) + 9),
    covered: (monthlySurplus * ((scenario.conceptionMonthsFromNow ?? 12) + 9)) >= BABY_OUTLAY.total.min,
  } : null;

  return { milestones, runway };
}

// ─── GOAL CONFLICT ENGINE ─────────────────────────────────────────────────────
export function detectGoalConflicts(primaryGoal, supportingGoals, cashflow) {
  const conflicts   = [];
  const allGoalIds  = [primaryGoal?.id, ...supportingGoals.map((g) => g.id)].filter(Boolean);
  const conflictMap = GOAL_CONFLICTS;

  allGoalIds.forEach((gid) => {
    const rivals = conflictMap[gid] ?? [];
    rivals.forEach((rival) => {
      if (allGoalIds.includes(rival) && !conflicts.find((c) => c.has(gid) && c.has(rival))) {
        conflicts.push(new Set([gid, rival]));
      }
    });
  });

  // Assess severity: if margin < 20%, any conflict is severe
  const severity = cashflow.marginPct < 10 ? "high" : cashflow.marginPct < 20 ? "medium" : "low";

  return conflicts.map((pair) => ({
    goals: [...pair],
    severity,
    recommendation: "sequence", // always recommend sequencing over simultaneous
  }));
}

// ─── STRESS TEST ENGINE ───────────────────────────────────────────────────────
export function computeStressTest(scenario, cashflow, leaveDurationMonths = 4, paidMonths = 3) {
  const { totalIncome, totalExpenses } = cashflow;
  const wifeIncome   = scenario.wifeNetIncome ?? 0;
  const husbandIncome= scenario.husbandNetIncome ?? 0;
  const efValue      = (scenario.emergencyFundMonths ?? 0) * totalExpenses;

  let efRemaining    = efValue;
  let cumDeficit     = 0;
  const monthByMonth = [];

  for (let m = 1; m <= Math.max(leaveDurationMonths + 6, 12); m++) {
    const onLeave    = m <= leaveDurationMonths;
    const isPaid     = m <= paidMonths;
    const wifeEarns  = onLeave ? (isPaid ? wifeIncome : 0) : wifeIncome;
    const monthIncome= husbandIncome + wifeEarns + (scenario.sideIncome ?? 0);
    const netFlow    = monthIncome - totalExpenses;
    const deficit    = Math.max(0, -netFlow);

    efRemaining = Math.max(0, efRemaining - deficit);
    cumDeficit  = Math.max(0, cumDeficit + deficit);

    const status = deficit === 0 ? "ok"
      : efRemaining > 0 ? "warning"
      : "critical";

    monthByMonth.push({
      month: m,
      onLeave,
      income: monthIncome,
      expenses: totalExpenses,
      netFlow,
      deficit,
      cumDeficit,
      efRemaining,
      status,
    });
  }

  const firstCritical = monthByMonth.findIndex((m) => m.status === "critical");
  const totalDeficit  = cumDeficit;
  const efSurvives    = efRemaining > 0;

  // Recovery: months after leave ends to return to pre-leave EF level
  const monthlySurplus = Math.max(0, cashflow.monthlyMargin);
  const recoveryMonths = monthlySurplus > 0
    ? Math.ceil((efValue - efRemaining) / monthlySurplus)
    : 99;

  return {
    leaveDurationMonths,
    paidMonths,
    efStartValue: efValue,
    efFinalValue: efRemaining,
    efSurvives,
    firstCriticalMonth: firstCritical >= 0 ? firstCritical + 1 : null,
    totalDeficit,
    recoveryMonths: Math.min(recoveryMonths, 99),
    monthByMonth,
    // Insight flags
    needsLongerEF: !efSurvives,
    safeLeaveMonths: monthByMonth.filter((m) => m.status !== "critical").length,
    debtRisk: !efSurvives && totalDeficit > 0,
  };
}

// ─── PROFILE → SCENARIO MAPPER ────────────────────────────────────────────────
export function profileToScenario(profile) {
  if (!profile) return null;
  const { DEFAULT_SCENARIO, HOUSING, SITTER_RATES } = {
    DEFAULT_SCENARIO: {}, HOUSING: {}, SITTER_RATES: {},
  };

  // Import fresh to avoid circular
  const scenario = {
    id: "custom",
    name: "Rencana Saya",
    lastModified: Date.now(),

    husbandNetIncome:  0,
    wifeNetIncome:     0,
    sideIncome:        0,
    rentActive:        false,
    rentAmount:        0,
    ipl:               750_000,
    sinkingFund:       400_000,
    carCicilanActive:  false,
    carCicilanAmount:  0,
    transportMode:     "krl_motor",
    groceries:         1_800_000,
    bpjsPremium:       200_000,
    lifestyleSpend:    1_200_000,
    monthlyInvestment: 0,
    investmentStyle:   "moderate",
    emergencyFundMonths:  0,
    emergencyFundTarget:  6,
    babyPlanned:          false,
    conceptionMonthsFromNow: 12,
    sitterType:           "livein_medior",
    diapers:              900_000,
    vaccinationPeds:      1_000_000,
    nutrition:            0,
    grandparentCareOffset:0,
    weddingFundAccumulated:0,
    weddingTargetCost:    0,
    weddingMonthsFromNow: null,
    debtMonthlyPayment:   0,
    _flags: {
      bpjsWarning:       false,
      debtBurden:        false,
      incomeInstability: false,
    },
  };

  // ── Income bracket → pre-populate incomes ─────────────────────────────────
  const bracket = INCOME_BRACKETS[profile.incomeBracket];
  if (bracket) {
    const split = bracket.husbandSplit ?? 0.55;
    scenario.husbandNetIncome = round(bracket.midpoint * split);
    scenario.wifeNetIncome    = round(bracket.midpoint * (1 - split));
  }

  // Wife not working → zero income, no sitter needed initially
  if (profile.wifeEmployment === "not_working") {
    scenario.wifeNetIncome = 0;
  }

  // ── Living situation → housing ────────────────────────────────────────────
  if (profile.livingSituation === "with_parents") {
    scenario.rentActive  = false;
    scenario.ipl         = 300_000;
    scenario.sinkingFund = 0;
    scenario.groceries   = 1_200_000; // shared household costs
  } else if (profile.livingSituation === "granted_house") {
    scenario.rentActive  = false;
    scenario.ipl         = 750_000;
    scenario.sinkingFund = 400_000;
  } else if (profile.livingSituation === "renting") {
    scenario.rentActive  = true;
    scenario.rentAmount  = rentByBracket(profile.incomeBracket);
    scenario.sinkingFund = 500_000;
  } else if (profile.livingSituation === "own_property") {
    scenario.rentActive  = false;
    scenario.ipl         = 600_000;
    scenario.sinkingFund = 400_000;
  }

  // ── Parental support ───────────────────────────────────────────────────────
  const support = profile.parentalSupport ?? [];
  if (support.includes("childcare")) {
    scenario.grandparentCareOffset = GRANDPARENT_CARE_OFFSET;
  }
  if (support.includes("groceries")) {
    scenario.groceries = round(scenario.groceries * 0.60);
  }

  // ── Debt ──────────────────────────────────────────────────────────────────
  if (profile.existingDebt) {
    const debtMap = { under1: 700_000, "1to3": 2_000_000, "3to5": 4_000_000, over5: 6_000_000 };
    scenario.debtMonthlyPayment = debtMap[profile.existingDebtAmount] ?? 0;
  }

  // ── Baby / conception ─────────────────────────────────────────────────────
  const babyGoal = profile.primaryGoal === "baby" || profile.supportingGoals?.includes("baby");
  if (babyGoal) {
    scenario.babyPlanned = true;
    const tl = profile.conceptionTimeline;
    scenario.conceptionMonthsFromNow = tl === "now" ? 0 : tl === "not_sure" ? 18 : Number(tl);

    // Mother not returning → flag for income drop
    if (profile.motherReturnToWork === "no") {
      scenario._flags.futureIncomeDropWife = true;
    }

    // Grandparent childcare
    if (profile.grandparentChildcare === "yes") {
      scenario.grandparentCareOffset = GRANDPARENT_CARE_OFFSET;
    } else if (profile.grandparentChildcare === "partial") {
      scenario.grandparentCareOffset = round(GRANDPARENT_CARE_OFFSET * 0.5);
    }
  }

  // ── Wedding ───────────────────────────────────────────────────────────────
  const weddingGoal = profile.primaryGoal === "wedding" || profile.supportingGoals?.includes("wedding");
  if (weddingGoal) {
    const budgetMap = { under30: 25_000_000, "30to60": 50_000_000, "60to100": 80_000_000, over100: 130_000_000 };
    scenario.weddingTargetCost   = budgetMap[profile.weddingBudget] ?? 50_000_000;
    scenario.weddingMonthsFromNow = profile.weddingMonthsAway ?? 12;
  }

  // ── Investment ────────────────────────────────────────────────────────────
  const totalInc = scenario.husbandNetIncome + scenario.wifeNetIncome;
  const invPctByRisk = { conservative: 0.20, moderate: 0.26, growth: 0.30 };
  const invPct       = invPctByRisk[profile.riskTolerance ?? "moderate"];
  scenario.monthlyInvestment = round(totalInc * invPct);
  scenario.investmentStyle   = profile.riskTolerance ?? "moderate";

  // ── Income outlook flags ──────────────────────────────────────────────────
  scenario._flags.bpjsWarning       = profile.bpjsActive !== "both";
  scenario._flags.debtBurden        = profile.existingDebt === true;
  scenario._flags.incomeInstability = ["job_change", "one_may_stop"].includes(profile.incomeOutlook);
  scenario._flags.lifestyleOptimize = profile.lifestyleVsSpeed <= 2;

  return scenario;
}

// ─── GOAL READINESS ───────────────────────────────────────────────────────────
export function computeGoalReadiness(goal, cashflow, scenario, year = 2026) {
  if (!goal) return null;
  const monthlySurplus = Math.max(0, cashflow.monthlyMargin + cashflow.investmentAmount);

  if (goal.id === "emergency_fund") {
    const target     = (scenario.emergencyFundTarget ?? 6) * cashflow.totalExpenses;
    const current    = (scenario.emergencyFundMonths ?? 0) * cashflow.totalExpenses;
    const remaining  = Math.max(0, target - current);
    const monthsLeft = cashflow.investmentAmount > 0 ? Math.ceil(remaining / cashflow.investmentAmount) : 99;
    return {
      id: goal.id, targetAmount: target, currentAmount: current,
      monthsToReach: monthsLeft, pct: pct(current, target),
      status: monthsLeft === 0 ? "ready" : monthsLeft <= 12 ? "on_track" : "at_risk",
    };
  }

  if (goal.id === "baby") {
    const birthMonths  = (scenario.conceptionMonthsFromNow ?? 12) + 9;
    const target       = medicalInflationProject(BABY_OUTLAY.total.min, birthMonths);
    const projected    = monthlySurplus * birthMonths;
    return {
      id: goal.id, targetAmount: target, projectedAmount: projected,
      monthsToTarget: birthMonths, pct: pct(projected, target),
      status: projected >= target ? "ready" : projected >= target * 0.7 ? "on_track" : "at_risk",
    };
  }

  if (goal.id === "wedding") {
    const months       = scenario.weddingMonthsFromNow ?? 12;
    const target       = scenario.weddingTargetCost ?? 0;
    const accumulated  = scenario.weddingFundAccumulated ?? 0;
    const projected    = accumulated + monthlySurplus * months;
    return {
      id: goal.id, targetAmount: target, projectedAmount: projected,
      monthsToTarget: months, pct: pct(projected, target),
      status: projected >= target ? "ready" : projected >= target * 0.7 ? "on_track" : "at_risk",
    };
  }

  if (goal.id === "debt_payoff") {
    const monthly = cashflow.debtCost;
    return {
      id: goal.id, targetAmount: monthly, projectedAmount: monthly,
      monthsToTarget: 0, pct: 100,
      status: monthly > 0 ? "active" : "ready",
    };
  }

  return { id: goal.id, status: "on_track", pct: 50 };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function rentByBracket(bracket) {
  const map = {
    under10: 2_000_000, "10to15": 2_500_000,
    "15to22": 3_500_000, "22to30": 5_000_000, over30: 7_000_000,
  };
  return map[bracket] ?? 3_000_000;
}

export function fmtAmount(n) {
  n = Math.round(n);
  if (Math.abs(n) >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1).replace(".0", "")} jt`;
  if (Math.abs(n) >= 1_000)     return `Rp${Math.round(n / 1_000)} rb`;
  return `Rp${n.toLocaleString("id-ID")}`;
}

export function fmtPct(n) {
  return `${Math.round(n)}%`;
}
