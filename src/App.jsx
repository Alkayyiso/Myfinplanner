// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Jabodetabek Family Financial Planner
// Supabase edition: vault persists to Postgres via anonymous sessions
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useCallback, useEffect } from "react";
import { useVault } from "./hooks/useVault.js";
import {
  computeCashflow, computeVerdict, computeLevers, applyLevers,
  computeTimeline, detectGoalConflicts, computeStressTest,
  computeGoalReadiness, profileToScenario, fmtAmount,
} from "./engine/index.js";
import {
  INFLATION, THRESHOLDS, SITTER_RATES, TRANSPORT, GOAL_DEFINITIONS,
  PRESETS, DEFAULT_SCENARIO, INCOME_BRACKETS, MATERNITY_LEAVE,
} from "./data/knowledge.js";
import { t, COPY } from "./data/copy.js";
import {
  T, Card, Surface, Divider, Grid2, Grid3, Grid4, Stack, Row,
  Label, Heading, Body, Hint, MetricCard, Badge, Btn, Toggle,
  SliderRow, ChipGroup, OptionCard, ProgressBar, VerdictBox,
  WarningBanner, FlowRow, AllocRow, StepIndicator, SectionLabel,
  LeverCard, MilestoneDot, NavBar, ConceptionTimeline,
  PresetStrip, YearSelector, DonutChart, MonthChart,
} from "./components/shared/index.jsx";

const fmt  = fmtAmount;
const fmtP = (n) => `${Math.round(n)}%`;

// ─────────────────────────────────────────────────────────────────────────────
// SCREENING SECTION
// ─────────────────────────────────────────────────────────────────────────────
function ChipItem({ label, selected, onClick, disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "6px 12px", borderRadius: T.rPill, fontSize: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        border: selected ? `1.5px solid ${T.green400}` : `0.5px solid ${hov ? T.borderMed : T.border}`,
        background: selected ? T.green50 : hov ? T.bgSurface : "transparent",
        color: selected ? T.green800 : T.textMuted,
        fontWeight: selected ? 500 : 400, transition: "all .15s",
        opacity: disabled ? 0.4 : 1, fontFamily: T.fontSans,
      }}>
      {label}
    </button>
  );
}

function ScreeningSection({ onComplete, lang }) {
  const [step, setStep] = useState(1);
  const TOTAL = 4;
  const [profile, setProfile] = useState({
    maritalStatus: null, weddingMonthsAway: 6, weddingBudget: null,
    livingSituation: null, parentalSupport: [], existingDebt: null,
    existingDebtAmount: null, bpjsActive: null,
    incomeBracket: null, husbandEmployment: null, wifeEmployment: null, incomeOutlook: null,
    primaryGoal: null, supportingGoals: [], conceptionTimeline: null,
    motherReturnToWork: null, grandparentChildcare: null,
    riskTolerance: null, lifestyleVsSpeed: 3, upcomingExpenses: [],
  });

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const toggleArr = (k, v) => setProfile(p => {
    const arr = p[k] ?? [];
    if (v === "none") return { ...p, [k]: arr.includes("none") ? [] : ["none"] };
    const without = arr.filter(x => x !== "none");
    return { ...p, [k]: arr.includes(v) ? without.filter(x => x !== v) : [...without, v] };
  });

  const required = {
    1: ["maritalStatus", "livingSituation", "bpjsActive"],
    2: ["incomeBracket", "husbandEmployment", "wifeEmployment"],
    3: ["primaryGoal"],
    4: ["riskTolerance"],
  };
  const canNext = (required[step] ?? []).every(f => {
    const v = profile[f];
    return Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined;
  });

  const babyInGoals = profile.primaryGoal === "baby" || profile.supportingGoals.includes("baby");

  const incomeBracketChips = Object.entries(INCOME_BRACKETS).map(([k, v]) => ({
    value: k, label: v.label[lang],
  }));

  const employmentChips = (includeNotWorking = false) => [
    { value: "employed",       label: lang === "id" ? "Karyawan Tetap"   : "Permanent Employee" },
    { value: "contract",       label: lang === "id" ? "Karyawan Kontrak" : "Contract Employee"  },
    { value: "freelance",      label: lang === "id" ? "Freelance"         : "Freelance / Gig"   },
    { value: "business_owner", label: lang === "id" ? "Wirausaha"         : "Business Owner"    },
    ...(includeNotWorking ? [{ value: "not_working", label: lang === "id" ? "Tidak Bekerja" : "Not Working" }] : []),
  ];

  const supportingGoalChips = Object.values(GOAL_DEFINITIONS)
    .filter(g => g.id !== profile.primaryGoal)
    .map(g => ({ value: g.id, label: g.label[lang] }));

  const stepMeta = COPY.screening.steps;

  const stepContent = {
    1: (
      <Stack gap={16}>
        <div>
          <SectionLabel>{t("screening.q_maritalStatus.label", lang)}</SectionLabel>
          <Stack gap={6}>
            {Object.entries(COPY.screening.q_maritalStatus.options).map(([k, v]) => (
              <OptionCard key={k} label={v[lang]} selected={profile.maritalStatus === k} onClick={() => set("maritalStatus", k)} />
            ))}
          </Stack>
        </div>

        {profile.maritalStatus && profile.maritalStatus !== "married" && (
          <div>
            <SectionLabel>{t("screening.q_weddingMonths.label", lang)}</SectionLabel>
            <Hint style={{ marginBottom: 8 }}>{t("screening.q_weddingMonths.hint", lang)}</Hint>
            <SliderRow
              label={lang === "id" ? "Estimasi bulan lagi" : "Estimated months away"}
              min={1} max={36} step={1}
              value={profile.weddingMonthsAway ?? 6}
              onChange={v => set("weddingMonthsAway", v)}
              display={`${profile.weddingMonthsAway ?? 6} ${lang === "id" ? "bulan" : "months"}`}
            />
          </div>
        )}

        <div>
          <SectionLabel>{t("screening.q_livingSituation.label", lang)}</SectionLabel>
          <Stack gap={6}>
            {Object.entries(COPY.screening.q_livingSituation.options).map(([k, v]) => (
              <OptionCard key={k} label={v[lang]} selected={profile.livingSituation === k} onClick={() => set("livingSituation", k)} />
            ))}
          </Stack>
        </div>

        <div>
          <SectionLabel>{t("screening.q_parentalSupport.label", lang)}</SectionLabel>
          <Stack gap={6}>
            {Object.entries(COPY.screening.q_parentalSupport.options).map(([k, v]) => (
              <OptionCard key={k} label={v[lang]} selected={(profile.parentalSupport ?? []).includes(k)} onClick={() => toggleArr("parentalSupport", k)} />
            ))}
          </Stack>
        </div>

        <div>
          <SectionLabel>{t("screening.q_bpjsActive.label", lang)}</SectionLabel>
          <Stack gap={6}>
            {Object.entries(COPY.screening.q_bpjsActive.options).map(([k, v]) => (
              <OptionCard key={k} label={v[lang]} selected={profile.bpjsActive === k} onClick={() => set("bpjsActive", k)} />
            ))}
          </Stack>
          {profile.bpjsActive && profile.bpjsActive !== "both" && (
            <WarningBanner level="error" style={{ marginTop: 8 }}>
              {t("screening.q_bpjsActive.warning", lang)}
            </WarningBanner>
          )}
        </div>

        <div>
          <SectionLabel>{t("screening.q_existingDebt.label", lang)}</SectionLabel>
          <Row gap={8}>
            {Object.entries(COPY.screening.q_existingDebt.options).map(([k, v]) => (
              <ChipItem key={k} label={v[lang]} selected={profile.existingDebt === (k === "yes")} onClick={() => set("existingDebt", k === "yes")} />
            ))}
          </Row>
          {profile.existingDebt && (
            <div style={{ marginTop: 10 }}>
              <SectionLabel>{t("screening.q_existingDebtAmount.label", lang)}</SectionLabel>
              <ChipGroup
                chips={Object.entries(COPY.screening.q_existingDebtAmount.options).map(([k, v]) => ({ value: k, label: v[lang] }))}
                selected={profile.existingDebtAmount}
                onSelect={v => set("existingDebtAmount", v)}
              />
            </div>
          )}
        </div>
      </Stack>
    ),

    2: (
      <Stack gap={16}>
        <div>
          <SectionLabel>{t("screening.q_incomeBracket.label", lang)}</SectionLabel>
          <Hint style={{ marginBottom: 10 }}>{t("screening.q_incomeBracket.hint", lang)}</Hint>
          <Stack gap={6}>
            {incomeBracketChips.map(c => (
              <OptionCard key={c.value} label={c.label} selected={profile.incomeBracket === c.value} onClick={() => set("incomeBracket", c.value)} />
            ))}
          </Stack>
        </div>
        <div>
          <SectionLabel>{t("screening.q_husbandEmployment.label", lang)}</SectionLabel>
          <ChipGroup chips={employmentChips(false)} selected={profile.husbandEmployment} onSelect={v => set("husbandEmployment", v)} />
        </div>
        <div>
          <SectionLabel>{t("screening.q_wifeEmployment.label", lang)}</SectionLabel>
          <ChipGroup chips={employmentChips(true)} selected={profile.wifeEmployment} onSelect={v => set("wifeEmployment", v)} />
        </div>
        <div>
          <SectionLabel>{t("screening.q_incomeOutlook.label", lang)}</SectionLabel>
          <Stack gap={6}>
            {Object.entries(COPY.screening.q_incomeOutlook.options).map(([k, v]) => (
              <OptionCard key={k} label={v[lang]} selected={profile.incomeOutlook === k} onClick={() => set("incomeOutlook", k)} />
            ))}
          </Stack>
        </div>
      </Stack>
    ),

    3: (
      <Stack gap={16}>
        <div>
          <SectionLabel>{t("screening.q_primaryGoal.label", lang)}</SectionLabel>
          <Hint style={{ marginBottom: 10 }}>{t("screening.q_primaryGoal.hint", lang)}</Hint>
          <Stack gap={6}>
            {Object.values(GOAL_DEFINITIONS).map(g => (
              <OptionCard key={g.id} label={g.label[lang]} sublabel={g.sublabel[lang]} selected={profile.primaryGoal === g.id} onClick={() => set("primaryGoal", g.id)} />
            ))}
          </Stack>
        </div>

        {profile.primaryGoal && (
          <div>
            <SectionLabel>{t("screening.q_supportingGoals.label", lang)}</SectionLabel>
            <Hint style={{ marginBottom: 8 }}>{t("screening.q_supportingGoals.hint", lang)}</Hint>
            {profile.supportingGoals.length >= 2 && (
              <WarningBanner level="warn" style={{ marginBottom: 10 }}>
                {t("screening.q_supportingGoals.maxWarning", lang)}
              </WarningBanner>
            )}
            <ChipGroup
              chips={supportingGoalChips}
              selected={profile.supportingGoals}
              multi
              onSelect={v => {
                const cur = profile.supportingGoals;
                if (cur.includes(v)) set("supportingGoals", cur.filter(x => x !== v));
                else if (cur.length < 2) set("supportingGoals", [...cur, v]);
              }}
            />
          </div>
        )}

        {babyInGoals && (
          <>
            <div>
              <SectionLabel>{t("screening.q_conceptionTimeline.label", lang)}</SectionLabel>
              <ConceptionTimeline value={profile.conceptionTimeline} onChange={v => set("conceptionTimeline", v)} lang={lang} />
            </div>
            <div>
              <SectionLabel>{t("screening.q_motherReturnToWork.label", lang)}</SectionLabel>
              <Stack gap={6}>
                {Object.entries(COPY.screening.q_motherReturnToWork.options).map(([k, v]) => (
                  <OptionCard key={k} label={v[lang]} selected={profile.motherReturnToWork === k} onClick={() => set("motherReturnToWork", k)} />
                ))}
              </Stack>
            </div>
            <div>
              <SectionLabel>{t("screening.q_grandparentChildcare.label", lang)}</SectionLabel>
              <Hint style={{ marginBottom: 8 }}>{t("screening.q_grandparentChildcare.hint", lang)}</Hint>
              <Stack gap={6}>
                {Object.entries(COPY.screening.q_grandparentChildcare.options).map(([k, v]) => (
                  <OptionCard key={k} label={v[lang]} selected={profile.grandparentChildcare === k} onClick={() => set("grandparentChildcare", k)} />
                ))}
              </Stack>
            </div>
          </>
        )}

        {(profile.primaryGoal === "wedding" || profile.supportingGoals.includes("wedding")) && (
          <div>
            <SectionLabel>{t("screening.q_weddingBudget.label", lang)}</SectionLabel>
            <Stack gap={6}>
              {Object.entries(COPY.screening.q_weddingBudget.options).map(([k, v]) => (
                <OptionCard key={k} label={v[lang]} selected={profile.weddingBudget === k} onClick={() => set("weddingBudget", k)} />
              ))}
            </Stack>
          </div>
        )}
      </Stack>
    ),

    4: (
      <Stack gap={16}>
        <div>
          <SectionLabel>{t("screening.q_riskTolerance.label", lang)}</SectionLabel>
          <Stack gap={6}>
            {Object.entries(COPY.screening.q_riskTolerance.options).map(([k, v]) => (
              <OptionCard key={k} label={v[lang]} selected={profile.riskTolerance === k} onClick={() => set("riskTolerance", k)} />
            ))}
          </Stack>
        </div>
        <div>
          <SectionLabel>{t("screening.q_lifestyleVsSpeed.label", lang)}</SectionLabel>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textHint, marginBottom: 6 }}>
            <span style={{ maxWidth: "45%" }}>{t("screening.q_lifestyleVsSpeed.left", lang)}</span>
            <span style={{ maxWidth: "45%", textAlign: "right" }}>{t("screening.q_lifestyleVsSpeed.right", lang)}</span>
          </div>
          <input type="range" min={1} max={5} step={1} value={profile.lifestyleVsSpeed} onChange={e => set("lifestyleVsSpeed", Number(e.target.value))} style={{ width: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textHint, marginTop: 4 }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} style={{ fontWeight: profile.lifestyleVsSpeed === n ? 500 : 400, color: profile.lifestyleVsSpeed === n ? T.green600 : T.textHint }}>{n}</span>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>{t("screening.q_upcomingExpenses.label", lang)}</SectionLabel>
          <Stack gap={6}>
            {Object.entries(COPY.screening.q_upcomingExpenses.options).map(([k, v]) => (
              <OptionCard key={k} label={v[lang]} selected={(profile.upcomingExpenses ?? []).includes(k)} onClick={() => toggleArr("upcomingExpenses", k)} />
            ))}
          </Stack>
        </div>
      </Stack>
    ),
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 4px" }}>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="center" style={{ marginBottom: 12 }}>
          <StepIndicator current={step} total={TOTAL} />
          <span style={{ fontSize: 12, color: T.textHint }}>
            {t("screening.stepOf", lang, { current: step, total: TOTAL })}
          </span>
        </Row>
        <Heading size={18} style={{ marginBottom: 4, fontFamily: T.fontSerif }}>
          {stepMeta[step].title[lang]}
        </Heading>
        <Body muted size={13}>{stepMeta[step].sub[lang]}</Body>
      </div>

      {stepContent[step]}

      <Row justify="space-between" style={{ marginTop: 28 }}>
        {step > 1
          ? <Btn onClick={() => setStep(s => s - 1)} variant="outline">{t("screening.back", lang)}</Btn>
          : <div />
        }
        {step < TOTAL
          ? <Btn onClick={() => canNext && setStep(s => s + 1)} variant="primary" disabled={!canNext}>{t("screening.next", lang)} →</Btn>
          : <Btn onClick={() => canNext && onComplete(profile)} variant="primary" disabled={!canNext}>{t("screening.finish", lang)} →</Btn>
        }
      </Row>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR SECTION
// ─────────────────────────────────────────────────────────────────────────────
function CalculatorSection({ scenario, onUpdate, year, lang, computed }) {
  if (!scenario) return null;
  const { cashflow, verdict, warnings } = computed ?? {};

  const sitterChips = Object.entries(SITTER_RATES)
    .filter(([k]) => k !== "source")
    .map(([k, v]) => ({ value: k, label: v.label[lang] }));

  const transportChips = Object.entries(TRANSPORT.modes).map(([k, v]) => ({
    value: k, label: v.label[lang],
  }));

  const nutritionChips = [
    { value: 0,       label: lang === "id" ? "ASI Eksklusif" : "Exclusive Breastfeeding" },
    { value: 400_000, label: lang === "id" ? "ASI + Formula" : "Mixed Feeding" },
    { value: 800_000, label: lang === "id" ? "Formula Penuh" : "Full Formula" },
  ];

  return (
    <Stack gap={0}>
      {warnings?.includes("bpjs") && (
        <WarningBanner level="error" style={{ marginBottom: 12 }}>
          {t("warnings.bpjs", lang)}
        </WarningBanner>
      )}
      {warnings?.includes("doubleTrap") && (
        <WarningBanner level="warn" style={{ marginBottom: 12 }}>
          {t("warnings.doubleTrap", lang)}
        </WarningBanner>
      )}

      <Grid2 gap={12}>
        <Stack gap={0}>
          <SectionLabel>{lang === "id" ? "Pendapatan" : "Income"}</SectionLabel>
          <Card style={{ marginBottom: 12 }}>
            <SliderRow label={lang === "id" ? "Gaji bersih suami" : "Husband net salary"} min={3e6} max={35e6} step={5e5} value={scenario.husbandNetIncome} onChange={v => onUpdate({ husbandNetIncome: v })} display={fmt(scenario.husbandNetIncome)} />
            <SliderRow label={lang === "id" ? "Gaji bersih istri" : "Wife net salary"} min={0} max={30e6} step={5e5} value={scenario.wifeNetIncome} onChange={v => onUpdate({ wifeNetIncome: v })} display={fmt(scenario.wifeNetIncome)} />
            <SliderRow label={lang === "id" ? "Penghasilan sampingan" : "Side income"} min={0} max={10e6} step={25e4} value={scenario.sideIncome ?? 0} onChange={v => onUpdate({ sideIncome: v })} display={fmt(scenario.sideIncome ?? 0)} />
            <Divider />
            <Row justify="space-between">
              <Body muted size={13}>{lang === "id" ? "Total income" : "Total income"}</Body>
              <Body size={13} style={{ fontWeight: 500 }}>{fmt((scenario.husbandNetIncome || 0) + (scenario.wifeNetIncome || 0) + (scenario.sideIncome || 0))}</Body>
            </Row>
          </Card>

          <SectionLabel>{lang === "id" ? "Housing" : "Housing"}</SectionLabel>
          <Card style={{ marginBottom: 12 }}>
            <Toggle label={lang === "id" ? "Sewa / cicilan KPR aktif" : "Rent / mortgage active"} on={scenario.rentActive} onToggle={() => onUpdate({ rentActive: !scenario.rentActive })} />
            {scenario.rentActive && <SliderRow label={lang === "id" ? "Jumlah sewa / KPR" : "Amount"} min={5e5} max={12e6} step={25e4} value={scenario.rentAmount ?? 0} onChange={v => onUpdate({ rentAmount: v })} display={fmt(scenario.rentAmount ?? 0)} style={{ marginTop: 10 }} />}
            <SliderRow label="IPL / maintenance" min={0} max={3e6} step={1e5} value={scenario.ipl ?? 0} onChange={v => onUpdate({ ipl: v })} display={fmt(scenario.ipl ?? 0)} />
            <SliderRow label={lang === "id" ? "Sinking fund properti" : "Property sinking fund"} min={0} max={1e6} step={5e4} value={scenario.sinkingFund ?? 0} onChange={v => onUpdate({ sinkingFund: v })} display={fmt(scenario.sinkingFund ?? 0)} hint="Rp50–100rb/m²/tahun" />
          </Card>

          <SectionLabel>{lang === "id" ? "Transportasi" : "Transport"}</SectionLabel>
          <Card style={{ marginBottom: 12 }}>
            <Toggle label={lang === "id" ? "Cicilan mobil aktif" : "Car instalment active"} on={scenario.carCicilanActive} onToggle={() => onUpdate({ carCicilanActive: !scenario.carCicilanActive })} />
            {scenario.carCicilanActive && <SliderRow label={lang === "id" ? "Cicilan mobil" : "Car instalment"} min={5e5} max={8e6} step={25e4} value={scenario.carCicilanAmount ?? 0} onChange={v => onUpdate({ carCicilanAmount: v })} display={fmt(scenario.carCicilanAmount ?? 0)} style={{ marginTop: 10 }} />}
            <SectionLabel style={{ marginTop: 10 }}>{lang === "id" ? "Moda harian" : "Daily mode"}</SectionLabel>
            <ChipGroup chips={transportChips} selected={scenario.transportMode} onSelect={v => onUpdate({ transportMode: v })} />
          </Card>

          <SectionLabel>{lang === "id" ? "Dana Darurat" : "Emergency Fund"}</SectionLabel>
          <Card style={{ marginBottom: 12 }}>
            <SliderRow label={lang === "id" ? "Saat ini" : "Current"} min={0} max={12} step={1} value={scenario.emergencyFundMonths ?? 0} onChange={v => onUpdate({ emergencyFundMonths: v })} display={`${scenario.emergencyFundMonths ?? 0} ${lang === "id" ? "bulan" : "mo"}`} />
            <SliderRow label={lang === "id" ? "Target" : "Target"} min={3} max={12} step={1} value={scenario.emergencyFundTarget ?? 6} onChange={v => onUpdate({ emergencyFundTarget: v })} display={`${scenario.emergencyFundTarget ?? 6} ${lang === "id" ? "bulan" : "mo"}`} />
          </Card>
        </Stack>

        <Stack gap={0}>
          <SectionLabel>{lang === "id" ? "Kebutuhan Rutin" : "Monthly Essentials"}</SectionLabel>
          <Card style={{ marginBottom: 12 }}>
            <SliderRow label={lang === "id" ? "Dapur & FMCG" : "Groceries & FMCG"} min={5e5} max={6e6} step={1e5} value={scenario.groceries ?? 0} onChange={v => onUpdate({ groceries: v })} display={fmt(scenario.groceries ?? 0)} />
            <SliderRow label="BPJS Kesehatan" min={1e5} max={6e5} step={5e4} value={scenario.bpjsPremium ?? 0} onChange={v => onUpdate({ bpjsPremium: v })} display={fmt(scenario.bpjsPremium ?? 0)} />
            <SliderRow label={lang === "id" ? "Gaya hidup & sosial" : "Lifestyle & social"} min={2e5} max={6e6} step={1e5} value={scenario.lifestyleSpend ?? 0} onChange={v => onUpdate({ lifestyleSpend: v })} display={fmt(scenario.lifestyleSpend ?? 0)} />
            <SliderRow label={lang === "id" ? "Cicilan / utang lain" : "Other debt"} min={0} max={8e6} step={1e5} value={scenario.debtMonthlyPayment ?? 0} onChange={v => onUpdate({ debtMonthlyPayment: v })} display={fmt(scenario.debtMonthlyPayment ?? 0)} />
          </Card>

          <SectionLabel>{lang === "id" ? "Investasi & Tabungan" : "Investment & Savings"}</SectionLabel>
          <Card style={{ marginBottom: 12 }}>
            <SliderRow label={lang === "id" ? "Target investasi bulanan" : "Monthly investment target"} min={0} max={12e6} step={25e4} value={scenario.monthlyInvestment ?? 0} onChange={v => onUpdate({ monthlyInvestment: v })} display={fmt(scenario.monthlyInvestment ?? 0)} hint={`Target ideal: 26% dari income`} />
            {cashflow && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textHint, marginBottom: 4 }}>
                  <span>{lang === "id" ? "Alokasi saat ini" : "Current allocation"}</span>
                  <span style={{ fontWeight: 500, color: cashflow.investPct >= 20 ? T.green600 : cashflow.investPct >= 13 ? T.amber600 : T.red600 }}>{fmtP(cashflow.investPct)}</span>
                </div>
                <ProgressBar value={cashflow.investPct} max={30} color={cashflow.investPct >= 20 ? T.green400 : cashflow.investPct >= 13 ? T.amber400 : T.red400} />
              </>
            )}
          </Card>

          <SectionLabel>{lang === "id" ? "Rencana Keluarga" : "Family Planning"}</SectionLabel>
          <Card style={{ marginBottom: 12 }}>
            <Toggle label={lang === "id" ? "Rencana punya anak" : "Planning to have a baby"} on={scenario.babyPlanned} onToggle={() => onUpdate({ babyPlanned: !scenario.babyPlanned })} />
            {scenario.babyPlanned && (
              <Stack gap={12} style={{ marginTop: 14 }}>
                <div>
                  <SectionLabel>{lang === "id" ? "Target konsepsi dari sekarang" : "Conception target from now"}</SectionLabel>
                  <ConceptionTimeline
                    value={scenario.conceptionMonthsFromNow === 0 ? "now" : scenario.conceptionMonthsFromNow}
                    onChange={v => onUpdate({ conceptionMonthsFromNow: v === "now" ? 0 : v === "not_sure" ? 18 : Number(v) })}
                    lang={lang}
                  />
                </div>
                <div>
                  <SectionLabel>{lang === "id" ? "Pengasuh" : "Childcare"}</SectionLabel>
                  <ChipGroup chips={sitterChips} selected={scenario.sitterType} onSelect={v => onUpdate({ sitterType: v })} />
                </div>
                <div>
                  <SectionLabel>{lang === "id" ? "Nutrisi bayi" : "Baby nutrition"}</SectionLabel>
                  <ChipGroup chips={nutritionChips} selected={scenario.nutrition ?? 0} onSelect={v => onUpdate({ nutrition: v })} />
                </div>
                <SliderRow label={lang === "id" ? "Popok & kebersihan" : "Diapers & hygiene"} min={5e5} max={15e5} step={5e4} value={scenario.diapers ?? 0} onChange={v => onUpdate({ diapers: v })} display={fmt(scenario.diapers ?? 0)} />
                <SliderRow label={lang === "id" ? "Vaksin privat & dokter anak" : "Vaccines & pediatrics"} min={0} max={25e5} step={1e5} value={scenario.vaccinationPeds ?? 0} onChange={v => onUpdate({ vaccinationPeds: v })} display={fmt(scenario.vaccinationPeds ?? 0)} />
                <Toggle
                  label={lang === "id" ? "Pengasuhan kakek/nenek (hemat ~Rp2,95 jt/bln)" : "Grandparent childcare (saves ~Rp2.95M/mo)"}
                  on={(scenario.grandparentCareOffset ?? 0) > 0}
                  onToggle={() => onUpdate({ grandparentCareOffset: (scenario.grandparentCareOffset ?? 0) > 0 ? 0 : 2_950_000 })}
                />
              </Stack>
            )}
          </Card>
        </Stack>
      </Grid2>

      {cashflow && (
        <>
          <SectionLabel style={{ marginTop: 8 }}>{lang === "id" ? "Hasil arus kas bulanan" : "Monthly cashflow result"}</SectionLabel>
          <Card style={{ padding: "16px 18px", marginBottom: 12 }}>
            <FlowRow label={lang === "id" ? "Total pendapatan bersih" : "Total net income"} value={fmt(cashflow.totalIncome)} color={T.green800} bold />
            <FlowRow hidden={!scenario.rentActive} label={lang === "id" ? "Sewa / KPR" : "Rent / Mortgage"} value={`–${fmt(cashflow.rentCost)}`} />
            <FlowRow hidden={cashflow.iplCost + cashflow.sinkCost === 0} label="IPL + sinking fund" value={`–${fmt(cashflow.iplCost + cashflow.sinkCost)}`} />
            <FlowRow hidden={!scenario.carCicilanActive} label={lang === "id" ? "Cicilan mobil" : "Car instalment"} value={`–${fmt(cashflow.carCost)}`} />
            <FlowRow label={lang === "id" ? "Transportasi operasional" : "Transport opex"} value={`–${fmt(cashflow.transportOpex)}`} />
            <FlowRow label={lang === "id" ? "Dapur, FMCG, BPJS" : "Groceries, FMCG, BPJS"} value={`–${fmt(cashflow.essentialCost)}`} />
            <FlowRow hidden={(cashflow.debtCost ?? 0) === 0} label={lang === "id" ? "Cicilan / utang" : "Debt payments"} value={`–${fmt(cashflow.debtCost)}`} />
            <FlowRow hidden={!scenario.babyPlanned} label="Baby overhead" value={`–${fmt(cashflow.babyCost)}`} />
            <FlowRow label={lang === "id" ? "Gaya hidup" : "Lifestyle"} value={`–${fmt(cashflow.lifestyleCost)}`} />
            <FlowRow label={lang === "id" ? "Investasi / tabungan" : "Investment / savings"} value={`–${fmt(cashflow.investmentAmount)}`} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 10, borderTop: `0.5px solid ${T.borderMed}` }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{lang === "id" ? "Sisa kas bebas" : "Free cash"}</span>
              <span style={{ fontSize: 20, fontWeight: 500, color: cashflow.monthlyMargin >= 0 ? T.green800 : T.red800 }}>{fmt(cashflow.monthlyMargin)}</span>
            </div>
            <ProgressBar value={Math.max(0, cashflow.marginPct)} max={100} style={{ marginTop: 8 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textHint, marginTop: 4 }}>
              <span>0%</span>
              <span style={{ fontWeight: 500, color: T.textMid }}>{fmtP(cashflow.marginPct)} {lang === "id" ? "sisa" : "remaining"}</span>
              <span>100%</span>
            </div>
          </Card>

          {verdict && (
            <VerdictBox verdict={verdict} title={t(`verdict.${verdict.level}.title`, lang)} body={t(`verdict.${verdict.level}.body`, lang, { gap: fmt(verdict.gap) })} style={{ marginBottom: 16 }} />
          )}

          <Grid2 gap={12}>
            <div>
              <SectionLabel>{lang === "id" ? "Alokasi pendapatan" : "Income allocation"}</SectionLabel>
              <Card>
                <Row gap={16} align="flex-start">
                  <DonutChart slices={cashflow.allocationBreakdown.map(s => ({ value: s.value, color: s.color }))} size={80} thickness={16} />
                  <div style={{ flex: 1 }}>
                    {cashflow.allocationBreakdown.map(s => (
                      <AllocRow key={s.id} label={s.label[lang]} pct={Math.round((s.value / cashflow.totalIncome) * 100)} color={s.color} />
                    ))}
                  </div>
                </Row>
              </Card>
            </div>
            <div>
              <SectionLabel>{lang === "id" ? "Proyeksi finansial" : "Financial projections"}</SectionLabel>
              <Grid2 gap={8}>
                <MetricCard label={lang === "id" ? "Tabungan/tahun" : "Savings/year"} value={fmt(Math.max(0, cashflow.monthlyMargin + cashflow.investmentAmount) * 12)} />
                <MetricCard label={lang === "id" ? "Dana darurat" : "Emergency fund"} value={`${scenario.emergencyFundMonths ?? 0} bln`} sub={`Target: ${scenario.emergencyFundTarget ?? 6} bln`} />
                <MetricCard label={lang === "id" ? "Capai target DE" : "Reach EF target"} value={computed?.monthsToEF > 36 ? "36+ bln" : `${computed?.monthsToEF ?? "—"} bln`} />
                <MetricCard label="% investasi" value={fmtP(cashflow.investPct)} sub="Target: 26%" accent={cashflow.investPct >= 20 ? T.green800 : cashflow.investPct >= 13 ? T.amber800 : T.red800} />
              </Grid2>
            </div>
          </Grid2>
        </>
      )}
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN SECTION
// ─────────────────────────────────────────────────────────────────────────────
function PlanSection({ computed, scenario, activeLevers, onToggleLever, onApplyLevers, lang }) {
  if (!computed || !scenario) return <Body muted>{lang === "id" ? "Lengkapi kalkulator terlebih dahulu." : "Complete the calculator first."}</Body>;
  const { verdict, levers, adjusted, milestones, conflictFlags, goalReadiness } = computed;

  return (
    <Stack gap={16}>
      {conflictFlags?.map((cf, i) => (
        <WarningBanner key={i} level="warn">
          {t("warnings.goalConflict", lang, { a: cf.goals[0], b: cf.goals[1] })}
        </WarningBanner>
      ))}

      <div>
        <SectionLabel>{lang === "id" ? "Status saat ini" : "Current status"}</SectionLabel>
        <VerdictBox verdict={verdict} title={t(`verdict.${verdict.level}.title`, lang)} body={t(`verdict.${verdict.level}.body`, lang, { gap: fmt(verdict.gap) })} />
      </div>

      {levers?.length > 0 && (
        <div>
          <SectionLabel>{t("plan.leversTitle", lang)}</SectionLabel>
          <Body muted size={12} style={{ marginBottom: 10 }}>{t("plan.leversSubtitle", lang)}</Body>
          <Stack gap={8}>
            {levers.map(l => (
              <LeverCard key={l.id} lever={l} isActive={activeLevers.includes(l.id)} onToggle={() => onToggleLever(l.id)} lang={lang} fmt={fmt} />
            ))}
          </Stack>

          {activeLevers.length > 0 && adjusted && (
            <Card style={{ marginTop: 12, border: `1.5px solid ${T.green400}`, background: T.green50 }}>
              <SectionLabel style={{ color: T.green600 }}>{t("plan.afterLevers", lang)}</SectionLabel>
              <Row justify="space-between" style={{ marginBottom: 6 }}>
                <Body size={13}>{lang === "id" ? "Sisa kas bebas" : "Free cash"}</Body>
                <Body size={14} style={{ fontWeight: 500, color: adjusted.adjustedCashflow.monthlyMargin >= 0 ? T.green800 : T.red800 }}>
                  {fmt(adjusted.adjustedCashflow.monthlyMargin)}
                </Body>
              </Row>
              <VerdictBox verdict={adjusted.adjustedVerdict} title={t(`verdict.${adjusted.adjustedVerdict.level}.title`, lang)} body={t(`verdict.${adjusted.adjustedVerdict.level}.body`, lang, { gap: fmt(adjusted.adjustedVerdict.gap) })} />
              <Btn variant="primary" onClick={() => onApplyLevers(adjusted)} style={{ marginTop: 12, width: "100%" }}>
                {t("plan.applyAll", lang)}
              </Btn>
            </Card>
          )}
        </div>
      )}

      {Object.keys(goalReadiness ?? {}).length > 0 && (
        <div>
          <SectionLabel>{lang === "id" ? "Kesiapan per tujuan" : "Goal readiness"}</SectionLabel>
          <Stack gap={8}>
            {Object.values(goalReadiness).filter(Boolean).map(gr => {
              const goalDef    = GOAL_DEFINITIONS[gr.id];
              const statusColor = gr.status === "ready" ? T.green400 : gr.status === "on_track" ? T.amber400 : T.red400;
              const statusLabel = gr.status === "ready" ? t("plan.goalReady", lang) : gr.status === "on_track" ? t("plan.goalOnTrack", lang) : t("plan.goalAtRisk", lang);
              return (
                <Card key={gr.id}>
                  <Row justify="space-between" style={{ marginBottom: 6 }}>
                    <Body size={13} style={{ fontWeight: 500 }}>{goalDef?.label[lang] ?? gr.id}</Body>
                    <Badge color={gr.status === "ready" ? "green" : gr.status === "on_track" ? "amber" : "red"}>{statusLabel}</Badge>
                  </Row>
                  <ProgressBar value={gr.pct} max={100} color={statusColor} style={{ marginBottom: 4 }} />
                  {gr.monthsToReach > 0 && gr.monthsToReach < 99 && (
                    <Hint>{lang === "id" ? `Estimasi ${gr.monthsToReach} bulan` : `~${gr.monthsToReach} months`}</Hint>
                  )}
                </Card>
              );
            })}
          </Stack>
        </div>
      )}

      {milestones?.length > 0 && (
        <div>
          <SectionLabel>{t("plan.timeline", lang)}</SectionLabel>
          <Card>
            {milestones.map((m, i) => <MilestoneDot key={m.id + i} milestone={m} lang={lang} fmt={fmt} />)}
          </Card>
        </div>
      )}
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VAULT SECTION — Supabase powered
// ─────────────────────────────────────────────────────────────────────────────
function VaultSection({ vault, onSave, onLoad, onClear, scenario, computed, lang }) {
  const [confirmSlot, setConfirmSlot] = useState(null);
  const slots = vault.slotsArray;

  if (vault.loading) return (
    <div style={{ textAlign: "center", padding: 40, color: T.textHint, fontSize: 13 }}>
      {lang === "id" ? "Memuat brankas..." : "Loading vault..."}
    </div>
  );

  return (
    <Stack gap={16}>
      <Body muted size={13}>{t("vault.subtitle", lang)}</Body>

      {vault.sessionId && (
        <div style={{ fontSize: 11, color: T.textHint, fontFamily: "monospace", background: T.bgSurface, padding: "4px 8px", borderRadius: T.rMd }}>
          Session: {vault.sessionId.slice(0, 8)}...
        </div>
      )}

      <Grid3 gap={10}>
        {slots.map(slot => {
          const hasSave = !!slot.scenario;
          const cf      = slot.engineResult?.cashflow;
          const vd      = slot.engineResult?.verdict;
          return (
            <Card key={slot.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Row justify="space-between" align="flex-start">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.green600, marginBottom: 2 }}>{slot.label[lang]}</div>
                  {hasSave && <div style={{ fontSize: 12, color: T.textMuted }}>{slot.scenario?.name}</div>}
                  {slot.savedAt && <div style={{ fontSize: 10, color: T.textHint }}>{new Date(slot.savedAt).toLocaleDateString("id-ID")}</div>}
                </div>
                {hasSave && vd && <Badge color={vd.level === "optimal" || vd.level === "go" ? "green" : vd.level === "conditional" ? "amber" : "red"}>{vd.level?.toUpperCase()}</Badge>}
              </Row>

              {hasSave && cf ? (
                <Stack gap={4}>
                  <Row justify="space-between"><Hint>Income</Hint><Hint style={{ fontWeight: 500, color: T.text }}>{fmt(cf.totalIncome)}</Hint></Row>
                  <Row justify="space-between"><Hint>{lang === "id" ? "Sisa kas" : "Free cash"}</Hint><Hint style={{ fontWeight: 500, color: cf.monthlyMargin >= 0 ? T.green800 : T.red800 }}>{fmt(cf.monthlyMargin)}</Hint></Row>
                  <Row justify="space-between"><Hint>Margin</Hint><Hint style={{ fontWeight: 500 }}>{fmtP(cf.marginPct)}</Hint></Row>
                  <ProgressBar value={Math.max(0, cf.marginPct)} max={100} height={4} />
                </Stack>
              ) : (
                <div style={{ textAlign: "center", padding: "12px 0", color: T.textHint, fontSize: 12 }}>{t("vault.empty", lang)}</div>
              )}

              <Stack gap={6}>
                {scenario && (
                  confirmSlot === slot.id
                    ? <Row gap={6}>
                        <Btn size="sm" variant="primary" onClick={() => { onSave(slot.id); setConfirmSlot(null); }} style={{ flex: 1 }}>{lang === "id" ? "Ya, timpa" : "Yes, overwrite"}</Btn>
                        <Btn size="sm" variant="outline" onClick={() => setConfirmSlot(null)} style={{ flex: 1 }}>{lang === "id" ? "Batal" : "Cancel"}</Btn>
                      </Row>
                    : <Btn size="sm" variant="outline" onClick={() => hasSave ? setConfirmSlot(slot.id) : onSave(slot.id)} style={{ width: "100%" }}>
                        {hasSave ? t("vault.overwrite", lang) : t("vault.save", lang)}
                      </Btn>
                )}
                {hasSave && (
                  <Row gap={6}>
                    <Btn size="sm" variant="primary" onClick={() => onLoad(slot.id)} style={{ flex: 1 }}>{t("vault.load", lang)}</Btn>
                    <Btn size="sm" variant="danger" onClick={() => onClear(slot.id)}>✕</Btn>
                  </Row>
                )}
              </Stack>
            </Card>
          );
        })}
      </Grid3>

      {slots.filter(s => s.scenario && s.engineResult?.cashflow).length >= 2 && (
        <div>
          <SectionLabel>{lang === "id" ? "Perbandingan skenario tersimpan" : "Saved scenario comparison"}</SectionLabel>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: T.textHint, fontWeight: 500, borderBottom: `0.5px solid ${T.border}` }}>{lang === "id" ? "Metrik" : "Metric"}</th>
                  {slots.filter(s => s.scenario).map(s => (
                    <th key={s.id} style={{ textAlign: "right", padding: "6px 8px", color: T.green600, fontWeight: 500, borderBottom: `0.5px solid ${T.border}` }}>{s.label[lang]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "totalIncome",   label: "Income",                     f: fmt  },
                  { key: "totalExpenses", label: lang === "id" ? "Pengeluaran" : "Expenses", f: fmt  },
                  { key: "monthlyMargin", label: lang === "id" ? "Sisa Kas"    : "Free Cash", f: fmt  },
                  { key: "marginPct",     label: "Margin %",                   f: fmtP },
                  { key: "investPct",     label: lang === "id" ? "Investasi %" : "Investment %", f: fmtP },
                ].map(row => (
                  <tr key={row.key}>
                    <td style={{ padding: "6px 8px", color: T.textMuted, borderBottom: `0.5px solid ${T.border}` }}>{row.label}</td>
                    {slots.filter(s => s.scenario && s.engineResult?.cashflow).map(s => {
                      const val = s.engineResult.cashflow[row.key] ?? 0;
                      return (
                        <td key={s.id} style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500, borderBottom: `0.5px solid ${T.border}`, color: row.key === "monthlyMargin" ? (val >= 0 ? T.green800 : T.red800) : T.text }}>
                          {row.f(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STRESS TEST SECTION
// ─────────────────────────────────────────────────────────────────────────────
function StressTestSection({ scenario, cashflow, lang }) {
  const [leaveDuration, setLeaveDuration] = useState(4);
  const [paidMonths,    setPaidMonths]    = useState(3);

  const result = useMemo(() => {
    if (!scenario || !cashflow) return null;
    return computeStressTest(scenario, cashflow, leaveDuration, paidMonths);
  }, [scenario, cashflow, leaveDuration, paidMonths]);

  if (!scenario || !cashflow) return <Body muted>{lang === "id" ? "Lengkapi kalkulator terlebih dahulu." : "Complete the calculator first."}</Body>;

  return (
    <Stack gap={16}>
      <Body muted size={13}>{t("stressTest.subtitle", lang)}</Body>
      <Card>
        <SectionLabel>{lang === "id" ? "Parameter simulasi" : "Simulation parameters"}</SectionLabel>
        <SliderRow label={lang === "id" ? "Total durasi cuti" : "Total leave duration"} min={1} max={12} step={1} value={leaveDuration} onChange={setLeaveDuration} display={`${leaveDuration} ${lang === "id" ? "bulan" : "months"}`} />
        <SliderRow label={lang === "id" ? "Bulan dibayar penuh" : "Fully paid months"} min={0} max={leaveDuration} step={1} value={Math.min(paidMonths, leaveDuration)} onChange={v => setPaidMonths(Math.min(v, leaveDuration))} display={`${Math.min(paidMonths, leaveDuration)} ${lang === "id" ? "bulan" : "months"}`} hint={lang === "id" ? "Minimum 3 bulan per UU Ketenagakerjaan" : "Minimum 3 months per Indonesian labour law"} />
      </Card>

      {result && (
        <>
          <Grid4 gap={8}>
            <MetricCard label={lang === "id" ? "Dana darurat" : "Emergency fund"} value={result.efSurvives ? (lang === "id" ? "Cukup" : "Sufficient") : (lang === "id" ? "Tidak Cukup" : "Insufficient")} accent={result.efSurvives ? T.green800 : T.red800} />
            <MetricCard label={lang === "id" ? "Total defisit" : "Total deficit"} value={result.totalDeficit > 0 ? fmt(result.totalDeficit) : (lang === "id" ? "Nihil" : "None")} accent={result.totalDeficit > 0 ? T.red800 : T.green800} />
            <MetricCard label={lang === "id" ? "Bulan kritis pertama" : "First critical month"} value={result.firstCriticalMonth ? `M${result.firstCriticalMonth}` : (lang === "id" ? "Tidak ada" : "None")} accent={result.firstCriticalMonth ? T.red800 : T.green800} />
            <MetricCard label={lang === "id" ? "Pemulihan pasca-cuti" : "Post-leave recovery"} value={result.recoveryMonths >= 99 ? (lang === "id" ? "Lama" : "Long") : `${result.recoveryMonths} ${lang === "id" ? "bln" : "mo"}`} />
          </Grid4>

          <Card>
            <SectionLabel>{lang === "id" ? "Arus kas bulan per bulan" : "Month-by-month cashflow"}</SectionLabel>
            <MonthChart months={result.monthByMonth.slice(0, Math.max(leaveDuration + 3, 8))} height={100} />
            <Row gap={12} style={{ marginTop: 8 }}>
              {[["ok", T.green400, "Aman / OK"], ["warning", T.amber400, "Perhatian / Warning"], ["critical", T.red400, "Kritis / Critical"]].map(([k, c, l]) => (
                <Row key={k} gap={4}><div style={{ width: 8, height: 8, background: c, borderRadius: 2, marginTop: 1 }} /><Hint>{l}</Hint></Row>
              ))}
            </Row>
          </Card>

          <Card>
            <SectionLabel>{lang === "id" ? "Detail per bulan" : "Monthly detail"}</SectionLabel>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Bulan", "Status", "Income", "Pengeluaran", "Net", "EF sisa"].map(h => (
                      <th key={h} style={{ textAlign: "right", padding: "5px 8px", color: T.textHint, fontWeight: 500, borderBottom: `0.5px solid ${T.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.monthByMonth.slice(0, leaveDuration + 3).map(m => (
                    <tr key={m.month}>
                      <td style={{ padding: "5px 8px", textAlign: "right", borderBottom: `0.5px solid ${T.border}`, color: m.onLeave ? T.amber800 : T.textMuted }}>M{m.month}{m.onLeave ? "*" : ""}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", borderBottom: `0.5px solid ${T.border}` }}>
                        <Badge color={m.status === "ok" ? "green" : m.status === "warning" ? "amber" : "red"}>{m.status.toUpperCase()}</Badge>
                      </td>
                      <td style={{ padding: "5px 8px", textAlign: "right", borderBottom: `0.5px solid ${T.border}`, fontWeight: 500 }}>{fmt(m.income)}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", borderBottom: `0.5px solid ${T.border}`, color: T.textMuted }}>{fmt(m.expenses)}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", borderBottom: `0.5px solid ${T.border}`, color: m.netFlow >= 0 ? T.green800 : T.red800, fontWeight: 500 }}>{fmt(m.netFlow)}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", borderBottom: `0.5px solid ${T.border}`, color: m.efRemaining > 0 ? T.textMid : T.red800 }}>{fmt(m.efRemaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.efSurvives
              ? <WarningBanner level="good" style={{ marginTop: 12 }}>{t("stressTest.survives", lang)}</WarningBanner>
              : <WarningBanner level="error" style={{ marginTop: 12 }}>{t("stressTest.burns", lang, { month: result.firstCriticalMonth })}</WarningBanner>
            }
          </Card>
        </>
      )}
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,          setLang]          = useState("id");
  const [section,       setSection]       = useState("screening");
  const [year,          setYear]          = useState(2026);
  const [scenario,      setScenario]      = useState(null);
  const [goals,         setGoals]         = useState({ primary: null, supporting: [] });
  const [activeLevers,  setActiveLevers]  = useState([]);
  const [activePreset,  setActivePreset]  = useState(null);

  // Supabase-backed vault
  const vault = useVault();

  // ── Engine ──────────────────────────────────────────────────────────────
  const computed = useMemo(() => {
    if (!scenario) return null;
    const cashflow      = computeCashflow(scenario, year);
    const verdict       = computeVerdict(cashflow, scenario.babyPlanned);
    const leversRaw     = computeLevers(scenario, cashflow);
    const levers        = leversRaw.map(l => ({ ...l, isActive: activeLevers.includes(l.id) }));
    const adjusted      = applyLevers(leversRaw, activeLevers, scenario, year);
    const { milestones, runway } = computeTimeline(scenario, goals, cashflow, year);
    const conflictFlags = detectGoalConflicts(goals.primary, goals.supporting ?? [], cashflow);
    const goalReadiness = {};
    [goals.primary, ...(goals.supporting ?? [])].filter(Boolean).forEach(g => {
      goalReadiness[g.id] = computeGoalReadiness(g, cashflow, scenario, year);
    });
    const efNeeded   = Math.max(0, (scenario.emergencyFundTarget ?? 6) - (scenario.emergencyFundMonths ?? 0));
    const monthsToEF = cashflow.investmentAmount > 0 ? Math.ceil((efNeeded * cashflow.totalExpenses) / cashflow.investmentAmount) : 99;
    const wifeGross  = scenario.wifeNetIncome ?? 0;
    const warnings   = [];
    if (scenario._flags?.bpjsWarning)                                          warnings.push("bpjs");
    if (wifeGross > 0 && scenario.babyPlanned && cashflow.babyCost > wifeGross * 0.70) warnings.push("doubleTrap");
    if (cashflow.investPct < 13)                                                warnings.push("lowInvestment");
    return { cashflow, verdict, levers, adjusted, milestones, runway, conflictFlags, goalReadiness, monthsToEF, warnings };
  }, [scenario, goals, activeLevers, year]);

  const updateScenario = useCallback((patch) => {
    setScenario(s => s ? { ...s, ...patch, lastModified: Date.now() } : s);
    setActivePreset(null);
  }, []);

  const handleScreeningComplete = useCallback((profile) => {
    const gen = profileToScenario(profile);
    setScenario(gen);
    setGoals({
      primary:    GOAL_DEFINITIONS[profile.primaryGoal] ?? null,
      supporting: (profile.supportingGoals ?? []).map(id => GOAL_DEFINITIONS[id]).filter(Boolean),
    });
    setActiveLevers([]);
    setSection("calculator");
    // Persist profile to Supabase
    vault.saveProfile(profile);
  }, [vault]);

  const loadPreset = (key) => {
    setScenario({ ...PRESETS[key] });
    setActivePreset(key);
    setActiveLevers([]);
  };

  const navSections = [
    { id: "screening",  label: lang === "id" ? "Profil"      : "Profile"    },
    { id: "calculator", label: lang === "id" ? "Kalkulator"  : "Calculator", disabled: !scenario },
    { id: "plan",       label: lang === "id" ? "Rencana"     : "Plan",       disabled: !scenario },
    { id: "vault",      label: lang === "id" ? "Skenario"    : "Scenarios"  },
    { id: "stress",     label: lang === "id" ? "Stress Test" : "Stress Test",disabled: !scenario },
  ];

  return (
    <div style={{ fontFamily: T.fontSans, maxWidth: 860, margin: "0 auto", padding: "16px 4px 40px", color: T.text }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 400, letterSpacing: "-0.01em", marginBottom: 3 }}>
          {t("app.title", lang)}
        </div>
        <div style={{ fontSize: 12, color: T.textHint }}>{t("app.subtitle", lang)}</div>
      </div>

      <NavBar active={section} onChange={setSection} sections={navSections} lang={lang} onLangToggle={() => setLang(l => l === "id" ? "en" : "id")} />

      {section !== "screening" && scenario && (
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="flex-start" style={{ marginBottom: 8 }}>
            <SectionLabel style={{ margin: 0 }}>{lang === "id" ? "Preset skenario" : "Scenario presets"}</SectionLabel>
            <Row gap={8} align="center">
              <span style={{ fontSize: 11, color: T.textHint }}>{t("ui.projectionYear", lang)}</span>
              <YearSelector value={year} onChange={setYear} />
            </Row>
          </Row>
          <PresetStrip active={activePreset} onLoad={loadPreset} lang={lang} />
        </div>
      )}

      {section === "screening" && (
        <ScreeningSection onComplete={handleScreeningComplete} lang={lang} />
      )}

      {section === "calculator" && scenario && (
        <CalculatorSection scenario={scenario} onUpdate={updateScenario} year={year} lang={lang} computed={computed} />
      )}

      {section === "plan" && (
        <PlanSection
          computed={computed} scenario={scenario}
          activeLevers={activeLevers}
          onToggleLever={id => setActiveLevers(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])}
          onApplyLevers={adj => { setScenario(adj.adjustedScenario); setActiveLevers([]); }}
          lang={lang}
        />
      )}

      {section === "vault" && (
        <VaultSection
          vault={vault}
          onSave={(slotId) => vault.saveToSlot(slotId, scenario, computed)}
          onLoad={(slotId) => { loadFromVault(slotId); }}
          onClear={vault.clearSlot}
          scenario={scenario}
          computed={computed}
          lang={lang}
        />
      )}

      {section === "stress" && (
        <StressTestSection scenario={scenario} cashflow={computed?.cashflow} lang={lang} />
      )}
    </div>
  );

  function loadFromVault(slotId) {
    const slot = vault.slots[slotId];
    if (!slot?.scenario) return;
    setScenario({ ...slot.scenario });
    setActiveLevers([]);
    setSection("calculator");
  }
}
