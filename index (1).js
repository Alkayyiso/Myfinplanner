// ─────────────────────────────────────────────────────────────────────────────
// hooks/index.js
// useEngine — runs all engine functions, returns computed state
// useVault  — save/load/compare scenarios via window.storage
// useScreening — 4-step questionnaire state machine
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  computeCashflow, computeVerdict, computeLevers, applyLevers,
  computeTimeline, detectGoalConflicts, computeStressTest,
  computeGoalReadiness, profileToScenario,
} from "../engine/index.js";
import { GOAL_DEFINITIONS, DEFAULT_SCENARIO } from "../data/knowledge.js";

// ─────────────────────────────────────────────────────────────────────────────
// useEngine
// Runs all engine functions whenever scenario / goals / activeLevers / year change.
// Returns the full `computed` object. Components only read from this — never write.
// ─────────────────────────────────────────────────────────────────────────────
export function useEngine(scenario, goals, activeLevers, year) {
  return useMemo(() => {
    if (!scenario) return null;

    const hasBaby = scenario.babyPlanned ?? false;

    // Core cashflow
    const cashflow = computeCashflow(scenario, year);

    // Verdict
    const verdict = computeVerdict(cashflow, hasBaby);

    // Levers (ranked, unactivated)
    const leversRaw = computeLevers(scenario, cashflow);
    // Merge isActive flags from activeLevers
    const levers = leversRaw.map((l) => ({ ...l, isActive: activeLevers.includes(l.id) }));

    // Adjusted scenario after active levers
    const leverResult = applyLevers(leversRaw, activeLevers, scenario, year);

    // Timeline & runway
    const primaryGoal    = goals?.primary ?? null;
    const supportGoals   = goals?.supporting ?? [];
    const { milestones, runway } = computeTimeline(scenario, { primary: primaryGoal, supporting: supportGoals }, cashflow, year);

    // Goal conflicts
    const conflictFlags = detectGoalConflicts(primaryGoal, supportGoals, cashflow);

    // Goal readiness per goal
    const allGoals = [primaryGoal, ...supportGoals].filter(Boolean);
    const goalReadiness = {};
    allGoals.forEach((g) => {
      goalReadiness[g.id] = computeGoalReadiness(g, cashflow, scenario, year);
    });

    // Projections
    const efNeeded = Math.max(0, (scenario.emergencyFundTarget ?? 6) - (scenario.emergencyFundMonths ?? 0));
    const monthsToEF = cashflow.investmentAmount > 0
      ? Math.ceil((efNeeded * cashflow.totalExpenses) / cashflow.investmentAmount)
      : 99;

    // Double income trap detection
    const wifeGross  = scenario.wifeNetIncome ?? 0;
    const wifeCosts  = cashflow.babyCost + (cashflow.transportOpex / 2);
    const wifenetContrib = wifeGross - wifeCosts;
    const doubleTrap = hasBaby && wifeGross > 0 && wifenetContrib < wifeGross * 0.30;

    // Smart warnings
    const warnings = [];
    if (scenario._flags?.bpjsWarning)       warnings.push("bpjs");
    if (scenario._flags?.debtBurden)         warnings.push("debtBurden");
    if (conflictFlags.length > 0)            warnings.push("goalConflict");
    if (doubleTrap)                          warnings.push("doubleTrap");
    if (cashflow.investPct < 13)             warnings.push("lowInvestment");

    return {
      cashflow,
      verdict,
      levers,
      adjusted: leverResult,
      milestones,
      runway,
      conflictFlags,
      goalReadiness,
      monthsToEF: Math.min(monthsToEF, 99),
      doubleTrap,
      wifenetContrib,
      warnings,
    };
  }, [scenario, goals, activeLevers, year]);
}

// ─────────────────────────────────────────────────────────────────────────────
// useVault
// Manages 3 named slots. Persists to window.storage between sessions.
// ─────────────────────────────────────────────────────────────────────────────
const VAULT_STORAGE_KEY = "jabodetabek_vault_v1";

const EMPTY_VAULT = {
  slots: {
    utama:       { id: "utama",       label: { id: "Rencana Utama",  en: "Main Plan"     }, scenario: null, engineResult: null, savedAt: null },
    optimis:     { id: "optimis",     label: { id: "Optimis",        en: "Optimistic"    }, scenario: null, engineResult: null, savedAt: null },
    konservatif: { id: "konservatif", label: { id: "Konservatif",    en: "Conservative"  }, scenario: null, engineResult: null, savedAt: null },
  },
  activeComparison: [],
};

export function useVault() {
  const [vault, setVault] = useState(EMPTY_VAULT);
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const result = await window.storage?.get(VAULT_STORAGE_KEY);
        if (result?.value) {
          setVault(JSON.parse(result.value));
        }
      } catch {
        // storage unavailable or key not found — use empty vault
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  // Persist whenever vault changes (after initial load)
  useEffect(() => {
    if (!loaded) return;
    const persist = async () => {
      try {
        await window.storage?.set(VAULT_STORAGE_KEY, JSON.stringify(vault));
      } catch {
        // storage unavailable — continue without persistence
      }
    };
    persist();
  }, [vault, loaded]);

  const saveToSlot = useCallback((slotId, scenario, engineResult) => {
    setVault((v) => ({
      ...v,
      slots: {
        ...v.slots,
        [slotId]: {
          ...v.slots[slotId],
          scenario: { ...scenario },
          engineResult: engineResult ? { ...engineResult } : null,
          savedAt: Date.now(),
        },
      },
    }));
  }, []);

  const clearSlot = useCallback((slotId) => {
    setVault((v) => ({
      ...v,
      slots: {
        ...v.slots,
        [slotId]: { ...v.slots[slotId], scenario: null, engineResult: null, savedAt: null },
      },
    }));
  }, []);

  const toggleComparison = useCallback((slotId) => {
    setVault((v) => {
      const current = v.activeComparison;
      const next    = current.includes(slotId)
        ? current.filter((id) => id !== slotId)
        : [...current.slice(-1), slotId]; // max 2 at a time
      return { ...v, activeComparison: next };
    });
  }, []);

  return {
    vault,
    loaded,
    saveToSlot,
    clearSlot,
    toggleComparison,
    slotsArray: Object.values(vault.slots),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useScreening
// 4-step questionnaire state machine.
// Returns: { step, totalSteps, profile, setField, next, back, canProceed,
//            isComplete, generatedScenario }
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4;

const EMPTY_PROFILE = {
  // Step 1
  maritalStatus:      null,
  weddingMonthsAway:  null,
  weddingBudget:      null,
  livingSituation:    null,
  parentalSupport:    [],
  existingDebt:       null,
  existingDebtAmount: null,
  bpjsActive:         null,

  // Step 2
  incomeBracket:      null,
  husbandEmployment:  null,
  wifeEmployment:     null,
  incomeOutlook:      null,

  // Step 3
  primaryGoal:        null,
  supportingGoals:    [],
  conceptionTimeline: null,
  motherReturnToWork: null,
  grandparentChildcare: null,

  // Step 4
  riskTolerance:      null,
  lifestyleVsSpeed:   3,
  upcomingExpenses:   [],
};

// Validation: minimum required fields per step
const STEP_REQUIRED = {
  1: ["maritalStatus", "livingSituation", "bpjsActive"],
  2: ["incomeBracket", "husbandEmployment", "wifeEmployment"],
  3: ["primaryGoal"],
  4: ["riskTolerance"],
};

export function useScreening() {
  const [step, setStep]       = useState(1);
  const [profile, setProfile] = useState({ ...EMPTY_PROFILE });

  const setField = useCallback((key, value) => {
    setProfile((p) => ({ ...p, [key]: value }));
  }, []);

  const toggleArrayField = useCallback((key, value) => {
    setProfile((p) => {
      const arr     = p[key] ?? [];
      const exists  = arr.includes(value);
      // Special case: "none" clears all others
      if (value === "none") return { ...p, [key]: exists ? [] : ["none"] };
      const filtered = arr.filter((v) => v !== "none");
      return { ...p, [key]: exists ? filtered.filter((v) => v !== value) : [...filtered, value] };
    });
  }, []);

  const addSupportingGoal = useCallback((goalId) => {
    setProfile((p) => {
      if (p.supportingGoals.includes(goalId)) return p;
      if (p.supportingGoals.length >= 2) return p; // max 2
      if (goalId === p.primaryGoal) return p; // can't duplicate primary
      return { ...p, supportingGoals: [...p.supportingGoals, goalId] };
    });
  }, []);

  const removeSupportingGoal = useCallback((goalId) => {
    setProfile((p) => ({ ...p, supportingGoals: p.supportingGoals.filter((g) => g !== goalId) }));
  }, []);

  const canProceed = useMemo(() => {
    const required = STEP_REQUIRED[step] ?? [];
    return required.every((field) => {
      const val = profile[field];
      if (Array.isArray(val)) return val.length > 0;
      return val !== null && val !== undefined && val !== "";
    });
  }, [step, profile]);

  const next = useCallback(() => {
    if (canProceed && step < TOTAL_STEPS) setStep((s) => s + 1);
  }, [canProceed, step]);

  const back = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const isComplete = step === TOTAL_STEPS && canProceed;

  // Generate scenario from completed profile
  const generatedScenario = useMemo(() => {
    if (!isComplete) return null;
    return profileToScenario(profile);
  }, [isComplete, profile]);

  // Derive initial goals from profile
  const derivedGoals = useMemo(() => {
    const primary = profile.primaryGoal
      ? GOAL_DEFINITIONS[profile.primaryGoal] ?? null
      : null;
    const supporting = (profile.supportingGoals ?? [])
      .map((id) => GOAL_DEFINITIONS[id])
      .filter(Boolean);
    return { primary, supporting };
  }, [profile.primaryGoal, profile.supportingGoals]);

  const reset = useCallback(() => {
    setStep(1);
    setProfile({ ...EMPTY_PROFILE });
  }, []);

  return {
    step,
    totalSteps: TOTAL_STEPS,
    profile,
    setField,
    toggleArrayField,
    addSupportingGoal,
    removeSupportingGoal,
    next,
    back,
    canProceed,
    isComplete,
    generatedScenario,
    derivedGoals,
    reset,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useAppState — top-level state that App.jsx uses
// Combines screening, scenario, vault, engine into one coherent store
// ─────────────────────────────────────────────────────────────────────────────
export function useAppState() {
  const screening = useScreening();
  const vault     = useVault();

  const [activeSection,  setActiveSection]  = useState("screening");
  const [scenario,       setScenario]       = useState(null);
  const [goals,          setGoals]          = useState({ primary: null, supporting: [] });
  const [activeLevers,   setActiveLevers]   = useState([]);
  const [year,           setYear]           = useState(2026);
  const [language,       setLanguage]       = useState("id");

  // When screening completes, bootstrap scenario + goals
  const finalizeScreening = useCallback(() => {
    if (!screening.isComplete) return;
    setScenario(screening.generatedScenario);
    setGoals(screening.derivedGoals);
    setActiveLevers([]);
    setActiveSection("calculator");
  }, [screening]);

  // Scenario update (from calculator sliders)
  const updateScenario = useCallback((patch) => {
    setScenario((s) => s ? { ...s, ...patch, lastModified: Date.now() } : s);
  }, []);

  // Single field update (convenience)
  const setScenarioField = useCallback((key, value) => {
    updateScenario({ [key]: value });
  }, [updateScenario]);

  // Lever toggle
  const toggleLever = useCallback((leverId) => {
    setActiveLevers((ids) =>
      ids.includes(leverId) ? ids.filter((id) => id !== leverId) : [...ids, leverId]
    );
  }, []);

  // Apply active levers permanently to scenario
  const applyActiveLevers = useCallback((leverResult) => {
    if (!leverResult?.adjustedScenario) return;
    setScenario(leverResult.adjustedScenario);
    setActiveLevers([]);
  }, []);

  // Load a preset
  const loadPreset = useCallback((presetKey) => {
    const { PRESETS } = require("../data/knowledge.js");
    setScenario({ ...PRESETS[presetKey] });
    setActiveLevers([]);
  }, []);

  // Compute engine output
  const computed = useEngine(scenario, goals, activeLevers, year);

  // Save to vault
  const saveToVault = useCallback((slotId) => {
    if (!scenario) return;
    vault.saveToSlot(slotId, scenario, computed);
  }, [scenario, computed, vault]);

  // Load from vault
  const loadFromVault = useCallback((slotId) => {
    const slot = vault.vault.slots[slotId];
    if (!slot?.scenario) return;
    setScenario({ ...slot.scenario });
    setActiveLevers([]);
  }, [vault.vault]);

  return {
    // Navigation
    activeSection, setActiveSection,
    language, setLanguage,
    year, setYear,

    // Screening
    screening,
    finalizeScreening,

    // Scenario
    scenario, setScenario, updateScenario, setScenarioField, loadPreset,

    // Goals
    goals, setGoals,

    // Levers
    activeLevers, toggleLever, applyActiveLevers,

    // Engine output
    computed,

    // Vault
    vault, saveToVault, loadFromVault,
  };
}
