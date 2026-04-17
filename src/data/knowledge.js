// ─────────────────────────────────────────────────────────────────────────────
// knowledge.js
// Single source of truth for all financial constants, thresholds, and
// regulatory data derived from Modul 1–5 (Jabodetabek Family Finance 2026–2028)
// Every constant is sourced. Update here; propagates everywhere.
// ─────────────────────────────────────────────────────────────────────────────

// ── INFLATION ─────────────────────────────────────────────────────────────────
// Source: Modul 1 & 3
export const INFLATION = {
  projectionYears: [2026, 2027, 2028],
  yearFactor: { 2026: 1.0, 2027: 1.05, 2028: 1.10 },
  sectoral: {
    medical:    0.125,  // 10–15%, midpoint — Modul 1
    education:  0.10,   // Modul 3
    fmcg:       0.065,  // Modul 1
    rent:       0.06,   // Modul 3
    core:       0.035,  // BI baseline — Modul 1
  },
};

// ── INCOME THRESHOLDS — Go/No-Go ──────────────────────────────────────────────
// Source: Modul 5 — Ambang Batas Finansial
export const THRESHOLDS = {
  withBaby: {
    survival:    15_000_000,  // "Survival Target" — Modul 5
    comfortable: 25_000_000,  // "Comfortable/Thrive Target" — Modul 5
    optimal:     28_000_000,  // above comfortable + 26% investment target
  },
  withoutBaby: {
    survival:    10_000_000,
    comfortable: 18_000_000,
    optimal:     22_000_000,
  },
  investmentTargetPct:  0.26,  // Ibu Fitri model — JASF 2024, Modul 1 & 3
  investmentMinPct:     0.033, // Mrs. Husna baseline — JASF 2024, Modul 3
  emergencyFundMin:     3,     // months — Modul 5
  emergencyFundTarget:  6,     // months — Modul 5
  marginHealthyPct:     0.20,  // ≥20% = healthy buffer
  marginWarnPct:        0.10,  // 10–20% = cautious
};

// ── MEDICAL & BIRTH COSTS ─────────────────────────────────────────────────────
// Source: Modul 2 & 5 — Biaya Medis Tahun Pertama Kelahiran
export const MEDICAL = {
  prenatal: {
    checkupUsgPerMonth: { min: 1_000_000, max: 3_000_000 },  // Modul 2
    vitaminsPerMonth:   { min: 500_000,   max: 1_000_000  },  // Modul 2
    durationMonths: 9,
  },
  birth: {
    normalPrivateHospital: 30_000_000,        // Modul 2 & 5
    caesarExtra:           { min: 10_000_000, max: 40_000_000 }, // Modul 2
    bpjsCoversNormal:      true,              // INA-CBG full coverage — Modul 2
    bpjsCoversCaesar:      "indication_only", // Modul 2
  },
  // Source: PMK No. 3 Tahun 2023 — Modul 2 & 4
  krisUpgrade: {
    class2ToClass1:       "nominal_diff",     // selisih tarif INA-CBG
    class1ToVipMaxPct:    0.75,               // max 75% of Kelas 1 INA-CBG tariff
    outpatientExecCap:    400_000,            // max selisih Rawat Jalan Eksekutif
    class3UpgradeAllowed: false,              // Kelas 3 → pasien umum if forced
  },
  // Illustrative INA-CBG tariff example (DBD) — Modul 1 & 4
  inaCbgExample: {
    class2: 5_000_000,
    class1: 6_000_000,
    vip:    10_000_000,
    upgradeClass2ToVip: 5_500_000, // (1,000,000) + (75% × 6,000,000)
  },
  regulation: "Perpres No. 59/2024 — KRIS",
  krisMaxBedsPerRoom: 4,
  krisCriteriaCount:  12,
};

// ── BABY CAPITAL OUTLAY — One-time costs ─────────────────────────────────────
// Source: Modul 2 & 5
export const BABY_OUTLAY = {
  clothing:   { min: 3_000_000, max: 5_000_000 },
  bath:       { min: 1_000_000, max: 3_000_000 },
  feeding:    { min: 1_000_000, max: 4_000_000 },
  nursing:    { min: 1_000_000, max: 2_000_000 },
  mobility:   { min: 5_000_000, max: 8_000_000 },
  aqiqah:     { min: 3_000_000, max: 5_000_000 },
  total:      { min: 14_000_000, max: 27_000_000 },
};

// ── BABY RECURRING OVERHEAD ───────────────────────────────────────────────────
// Source: Modul 2 — "Baby Overhead" Bulanan
export const BABY_RECURRING = {
  diapers: {
    newborn:    { pcsPerDay: 11, pcsPerMonth: 300 },  // 0–1 bulan — Modul 1 & 2
    infant:     { pcsPerDay: 9,  pcsPerMonth: 240 },  // 1–12 bulan — Modul 1 & 2
    costRange:  { min: 800_000, max: 1_200_000 },
    savingsTip: "SKU jumbo (MAKUKU SAP +6) saves ~15%/year", // Modul 1 & 2
  },
  vaccinationPeds: { min: 1_000_000, max: 2_000_000 },
  formulaFull:     { min: 500_000,   max: 800_000   },
  formulaMixed:    { min: 250_000,   max: 400_000   },
  asiOnly:         0,
  totalRange:      { min: 4_800_000, max: 8_500_000 }, // all-in — Modul 2
};

// ── BABYSITTER / CHILDCARE RATES ─────────────────────────────────────────────
// Source: CICANA 2026 data — Modul 1, 2, 4 & 5
export const SITTER_RATES = {
  none:                    { cost: 0,         label: { id: "Tanpa pengasuh",              en: "No babysitter"              } },
  liveout_weekday:         { cost: 2_250_000, label: { id: "Live-out (Sen–Jum)",          en: "Live-out (Mon–Fri)"         }, range: { min: 2_000_000, max: 2_500_000 } },
  liveout_fullweek:        { cost: 2_500_000, label: { id: "Live-out (Sen–Sab)",          en: "Live-out (Mon–Sat)"         }, range: { min: 2_300_000, max: 2_700_000 } },
  livein_medior:           { cost: 2_950_000, label: { id: "Live-in Medior",              en: "Live-in Medior"             }, range: { min: 2_700_000, max: 3_200_000 } },
  livein_medior_certified: { cost: 3_750_000, label: { id: "Live-in Medior + Certified", en: "Live-in Medior + Certified" }, range: { min: 3_500_000, max: 4_000_000 } },
  livein_senior:           { cost: 3_300_000, label: { id: "Live-in Senior",              en: "Live-in Senior"             }, range: { min: 3_200_000, max: 3_400_000 } },
  livein_senior_certified: { cost: 4_250_000, label: { id: "Live-in Senior + Certified", en: "Live-in Senior + Certified" }, range: { min: 4_000_000, max: 4_500_000 } },
  grandparent:             { cost: 0,         label: { id: "Kakek/Nenek (keluarga)",      en: "Grandparent care"           } },
  source: "CICANA Jabodetabek 2026",
};

// Grandparent care financial offset — value of free childcare
export const GRANDPARENT_CARE_OFFSET = SITTER_RATES.livein_medior.cost; // ~Rp2,95 jt/bln

// ── HOUSING & PROPERTY ───────────────────────────────────────────────────────
// Source: Modul 1, 3 & 4
export const HOUSING = {
  sinkingFund: {
    perSqmPerYear: { min: 50_000, max: 100_000 }, // Astra Land standard — Modul 1 & 4
    example60sqm:  { min: 3_000_000, max: 6_000_000 }, // annual total
  },
  // IPL baseline for a 2BR unit in Jabodetabek
  iplTypical: { min: 400_000, max: 900_000 },
  // Estimated rent ranges by income bracket
  rentByBracket: {
    under10:  2_000_000,
    "10to15": 2_500_000,
    "15to22": 3_500_000,
    "22to30": 5_000_000,
    over30:   7_000_000,
  },
};

// ── TRANSPORT ─────────────────────────────────────────────────────────────────
// Source: Modul 1, 3
export const TRANSPORT = {
  modes: {
    krl_only:      { cost: 400_000,   label: { id: "KRL only",           en: "KRL only"           }, evSaving: false },
    krl_motor:     { cost: 700_000,   label: { id: "KRL + motor BBM",    en: "KRL + motorbike"    }, evSaving: false },
    ev_motor:      { cost: 500_000,   label: { id: "Motor listrik",      en: "Electric motorcycle" }, evSaving: true  },
    ev_krl:        { cost: 600_000,   label: { id: "EV motor + KRL",     en: "EV + KRL"           }, evSaving: true  },
    car_daily:     { cost: 1_100_000, label: { id: "Mobil harian",       en: "Daily car use"      }, evSaving: false },
    car_occasional:{ cost: 800_000,   label: { id: "Mobil sesekali",     en: "Occasional car"     }, evSaving: false },
  },
  evFuelSavingPct: 0.30, // ~30% opex reduction vs BBM — Modul 3
};

// ── INVESTMENT INSTRUMENTS ────────────────────────────────────────────────────
// Source: Modul 4 — Optimalisasi Kendaraan Investasi
export const INVESTMENTS = {
  rdpu: {
    id: "rdpu",
    label: { id: "Reksa Dana Pasar Uang", en: "Money Market Fund" },
    purpose: { id: "Dana Darurat", en: "Emergency Fund" },
    liquidityDays: 1,
    riskLevel: "very_low",
    minEntry: 10_000,
    platform: "Ajaib / Bibit",
  },
  emas: {
    id: "emas",
    label: { id: "Emas (Antam / Digital)", en: "Gold (Antam / Digital)" },
    purpose: { id: "Inflation Hedge", en: "Inflation Hedge" },
    liquidityDays: 3,
    riskLevel: "low",
    minEntry: 50_000,
    hedgeTarget: "medical & education inflation",
  },
  sbn: {
    id: "sbn",
    label: { id: "SBN / ORI / Sukuk Ritel", en: "Government Bonds" },
    purpose: { id: "Tujuan 2–5 Tahun", en: "2–5 Year Goals" },
    liquidityDays: 3,
    riskLevel: "low",
    guaranteed: true,
    minEntry: 1_000_000,
  },
  reksadana_campuran: {
    id: "reksadana_campuran",
    label: { id: "Reksa Dana Campuran", en: "Balanced Mutual Fund" },
    purpose: { id: "Pertumbuhan Jangka Menengah", en: "Medium-term Growth" },
    liquidityDays: 5,
    riskLevel: "medium",
    minEntry: 10_000,
  },
  saham: {
    id: "saham",
    label: { id: "Saham (BBRI, BMRI, BBCA)", en: "Blue-chip Stocks" },
    purpose: { id: "Dividen + Pertumbuhan", en: "Dividend + Capital Growth" },
    liquidityDays: 1,
    riskLevel: "medium",
    dividendYield2026: 0.07, // ~7% — Modul 1
    minEntry: 100_000,
  },
};

// Investment mix by risk tolerance
export const INVESTMENT_MIX = {
  conservative: { rdpu: 0.50, emas: 0.30, sbn: 0.20, reksadana_campuran: 0,    saham: 0    },
  moderate:     { rdpu: 0.30, emas: 0.20, sbn: 0.30, reksadana_campuran: 0.20, saham: 0    },
  growth:       { rdpu: 0.20, emas: 0.10, sbn: 0.20, reksadana_campuran: 0.20, saham: 0.30 },
};

// ── INCOME BRACKETS ───────────────────────────────────────────────────────────
// Used in screening to pre-populate sliders
export const INCOME_BRACKETS = {
  under10:  { label: { id: "Di bawah Rp10 jt",   en: "Under Rp10M"       }, midpoint: 8_000_000,  husbandSplit: 0.55 },
  "10to15": { label: { id: "Rp10–15 jt",         en: "Rp10–15M"          }, midpoint: 12_500_000, husbandSplit: 0.55 },
  "15to22": { label: { id: "Rp15–22 jt",         en: "Rp15–22M"          }, midpoint: 18_500_000, husbandSplit: 0.55 },
  "22to30": { label: { id: "Rp22–30 jt",         en: "Rp22–30M"          }, midpoint: 26_000_000, husbandSplit: 0.55 },
  over30:   { label: { id: "Di atas Rp30 jt",    en: "Over Rp30M"        }, midpoint: 37_000_000, husbandSplit: 0.55 },
};

// ── GOAL DEFINITIONS ─────────────────────────────────────────────────────────
export const GOAL_DEFINITIONS = {
  wedding: {
    id: "wedding",
    label:     { id: "Persiapan Pernikahan",      en: "Wedding Planning"          },
    sublabel:  { id: "Biaya & logistik menikah",  en: "Wedding costs & logistics" },
    icon:      "rings",
    budgetRanges: {
      intimate:  { label: { id: "Intim (<Rp30 jt)",   en: "Intimate (<Rp30M)"   }, amount: 25_000_000  },
      moderate:  { label: { id: "Sedang (Rp30–70 jt)",en: "Moderate (Rp30–70M)" }, amount: 50_000_000  },
      grand:     { label: { id: "Besar (Rp70–120 jt)",en: "Grand (Rp70–120M)"   }, amount: 95_000_000  },
      premium:   { label: { id: "Premium (>Rp120 jt)",en: "Premium (>Rp120M)"   }, amount: 150_000_000 },
    },
  },
  baby: {
    id: "baby",
    label:    { id: "Rencana Kehamilan & Bayi",   en: "Baby Planning"             },
    sublabel: { id: "Dari konsepsi hingga tahun pertama", en: "Conception to year one" },
    icon:     "baby",
  },
  property: {
    id: "property",
    label:    { id: "Beli Properti / KPR",        en: "Property Purchase"         },
    sublabel: { id: "DP & kesiapan KPR",          en: "Down payment & KPR readiness" },
    icon:     "home",
    dpPct:    0.20,   // typical 20% DP
  },
  vehicle: {
    id: "vehicle",
    label:    { id: "Beli Kendaraan",             en: "Vehicle Purchase"          },
    sublabel: { id: "Mobil atau motor listrik",   en: "Car or electric motorcycle" },
    icon:     "car",
  },
  emergency_fund: {
    id: "emergency_fund",
    label:    { id: "Dana Darurat",               en: "Emergency Fund"            },
    sublabel: { id: "Buffer 3–6 bulan pengeluaran",en: "3–6 month expense buffer" },
    icon:     "shield",
  },
  debt_payoff: {
    id: "debt_payoff",
    label:    { id: "Lunasi Utang / Cicilan",     en: "Debt Payoff"               },
    sublabel: { id: "KTA, cicilan, atau pinjaman",en: "Personal loans & instalments" },
    icon:     "creditcard",
  },
  invest: {
    id: "invest",
    label:    { id: "Mulai Investasi Serius",     en: "Start Investing Seriously" },
    sublabel: { id: "Bangun portofolio jangka panjang", en: "Build long-term portfolio" },
    icon:     "chart",
  },
};

// Goal conflict rules — which goals compete for the same cash
export const GOAL_CONFLICTS = {
  wedding:        ["property", "vehicle"],
  baby:           ["property", "vehicle"],
  property:       ["wedding", "baby", "vehicle"],
  vehicle:        ["wedding", "baby", "property"],
  emergency_fund: [],     // compatible with everything
  debt_payoff:    [],     // compatible with everything (actually helps)
  invest:         [],     // compatible with everything
};

// ── MATERNITY LEAVE ───────────────────────────────────────────────────────────
// Source: Indonesian labor law + Modul 3
export const MATERNITY_LEAVE = {
  statutoryPaidMonths:    3,   // UU Ketenagakerjaan
  recommendedMonths:      6,
  paternityLeaveDays:     2,   // statutory (often extended by employer policy)
  partialPayOptions:      [1.0, 0.75, 0.5, 0.0], // fraction of salary during leave
};

// ── BUDGET ALLOCATION MODEL ───────────────────────────────────────────────────
// Source: JASF 2024 — Ibu Fitri "Modern-Investif" model — Modul 1 & 3
export const BUDGET_MODEL_FITRI = {
  savings_emas:     0.26,
  grocery:          0.12,
  children:         0.125,
  fixed_obligations:0.146, // cicilan, ART
  tax_social:       0.316,
  pure_savings:     0.033,
  source: "JASF 2024 — Mrs. Fitri, Modern-Investif Type",
};

// Source: JASF 2024 — Ibu Husna "Traditional-Social" model — Modul 1 & 3
export const BUDGET_MODEL_HUSNA = {
  arisan:           0.333, // social savings instrument
  pure_savings:     0.033,
  grocery:          0.059,
  children:         0.109,
  fixed_husband:    0.333,
  misc_tax:         0.133,
  source: "JASF 2024 — Mrs. Husna, Traditional-Social Type",
};

// ── WELLBEING INDICATORS ──────────────────────────────────────────────────────
// Source: JISDEP study, Modul 1 & 3
export const WELLBEING = {
  flexibleWorkImpact:      0.8099, // 80.99% SFWB improvement — JISDEP study
  domesticStressSource:    "role_expectation_not_workload", // Damayanti et al. 2025
  dualIncomeTrapRisk:      "outsourced_domesticity_cost_exceeds_second_income",
};

// ── WEDDING COST RANGES (Jabodetabek) ────────────────────────────────────────
export const WEDDING_COSTS = {
  gedung:      { min: 15_000_000, max: 80_000_000  },
  catering:    { min: 50_000,     max: 150_000      }, // per pax
  photographer:{ min: 5_000_000,  max: 25_000_000   },
  decoration:  { min: 5_000_000,  max: 30_000_000   },
  attire:      { min: 3_000_000,  max: 20_000_000   },
  makeup:      { min: 2_000_000,  max: 10_000_000   },
  misc:        { min: 5_000_000,  max: 15_000_000   },
};

// ── THREE ACCOUNT SYSTEM ──────────────────────────────────────────────────────
// Source: Modul 4
export const THREE_ACCOUNT_SYSTEM = {
  joint: {
    id: "joint",
    label: { id: "Rekening Bersama", en: "Joint Account" },
    covers: ["housing", "sinking_fund", "sitter", "baby_costs", "groceries", "bpjs"],
  },
  personal: {
    id: "personal",
    label: { id: "Rekening Pribadi", en: "Personal Accounts (×2)" },
    covers: ["hobbies", "personal_clothing", "self_development"],
    reportingRequired: false,
  },
  relationship: {
    id: "relationship",
    label: { id: "Shared Date Fund", en: "Relationship Fund" },
    covers: ["vacations", "date_nights", "anniversary"],
  },
};

// ── CONTRIBUTION METHODS ──────────────────────────────────────────────────────
// Source: Modul 4
export const CONTRIBUTION_METHODS = {
  proportional: {
    id: "proportional",
    label: { id: "Proporsional", en: "Proportional" },
    description: { id: "% tetap dari gaji masing-masing", en: "Fixed % of each salary" },
    fairness: "high",
    recommended: true,
  },
  fixed: {
    id: "fixed",
    label: { id: "Nominal Tetap", en: "Fixed Amount" },
    description: { id: "Jumlah sama dari masing-masing", en: "Same amount each" },
    fairness: "nominal",
    risk: "lifestyle_gap",
  },
};

// ── DEFAULT SCENARIO VALUES ───────────────────────────────────────────────────
// Base values before screening customizes them
export const DEFAULT_SCENARIO = {
  id: "custom",
  name: "Rencana Saya",
  lastModified: null,

  husbandNetIncome:  12_000_000,
  wifeNetIncome:     10_000_000,
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

  monthlyInvestment: 2_000_000,
  investmentStyle:   "moderate",

  emergencyFundMonths:  3,
  emergencyFundTarget:  6,

  babyPlanned:             false,
  conceptionMonthsFromNow: 12,
  sitterType:              "livein_medior",
  diapers:                 900_000,
  vaccinationPeds:         1_000_000,
  nutrition:               0,
  grandparentCareOffset:   0,

  weddingFundAccumulated:  0,
  weddingTargetCost:       0,

  debtMonthlyPayment:      0,

  _flags: {
    bpjsWarning:      false,
    debtBurden:       false,
    incomeInstability:false,
  },
};

// ── PRESET SCENARIOS ──────────────────────────────────────────────────────────
export const PRESETS = {
  baseline: {
    ...DEFAULT_SCENARIO,
    id: "baseline",
    name: "Baseline — Sewa Mandiri",
    rentActive:        true,
    rentAmount:        3_500_000,
    ipl:               600_000,
    sinkingFund:       500_000,
    transportMode:     "krl_motor",
    groceries:         2_000_000,
    lifestyleSpend:    1_500_000,
    monthlyInvestment: 1_500_000,
    husbandNetIncome:  10_000_000,
    wifeNetIncome:     8_000_000,
    emergencyFundMonths: 1,
    babyPlanned:       false,
  },
  a: {
    ...DEFAULT_SCENARIO,
    id: "a",
    name: "Skenario A — Rumah Orang Tua",
    rentActive:        false,
    ipl:               300_000,
    sinkingFund:       0,
    transportMode:     "krl_motor",
    groceries:         1_200_000,
    lifestyleSpend:    1_000_000,
    monthlyInvestment: 3_000_000,
    husbandNetIncome:  10_000_000,
    wifeNetIncome:     8_000_000,
    emergencyFundMonths: 2,
    babyPlanned:       false,
  },
  b: {
    ...DEFAULT_SCENARIO,
    id: "b",
    name: "Skenario B — Rumah Hibah + Bayi",
    rentActive:        false,
    ipl:               750_000,
    sinkingFund:       400_000,
    carCicilanActive:  true,
    carCicilanAmount:  2_500_000,
    transportMode:     "ev_krl",
    groceries:         1_800_000,
    lifestyleSpend:    1_200_000,
    monthlyInvestment: 2_000_000,
    husbandNetIncome:  12_000_000,
    wifeNetIncome:     10_000_000,
    emergencyFundMonths: 3,
    babyPlanned:       true,
    conceptionMonthsFromNow: 12,
    sitterType:        "livein_medior",
  },
};
