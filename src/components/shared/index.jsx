// ─────────────────────────────────────────────────────────────────────────────
// components/shared/index.jsx
// All reusable UI primitives. Zero business logic — pure display + interaction.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const T = {
  // Semantic colors (hardcoded for iframe isolation — no CSS vars dependency)
  green50:  "#E1F5EE", green100: "#9FE1CB", green400: "#1D9E75",
  green600: "#0F6E56", green800: "#085041",
  amber50:  "#FAEEDA", amber100: "#FAC775", amber400: "#EF9F27",
  amber600: "#BA7517", amber800: "#633806",
  red50:    "#FCEBEB", red100:   "#F7C1C1", red400:   "#E24B4A",
  red600:   "#A32D2D", red800:   "#791F1F",
  blue50:   "#E6F1FB", blue100:  "#B5D4F4", blue400:  "#378ADD",
  blue600:  "#185FA5", blue800:  "#0C447C",
  purple400:"#7F77DD", coral400: "#D85A30", chartGreen:"#639922",

  // Neutrals
  bg:        "#ffffff",
  bgSurface: "#f6f5f0",
  bgDeep:    "#efede8",
  border:    "rgba(0,0,0,0.10)",
  borderMed: "rgba(0,0,0,0.18)",
  borderStrong:"rgba(0,0,0,0.28)",
  text:      "#1a1a1a",
  textMid:   "#444",
  textMuted: "#777",
  textHint:  "#aaa",

  // Radius
  rSm:  6,
  rMd:  8,
  rLg:  12,
  rXl:  16,
  rPill:20,

  // Font
  fontSerif: "'Georgia', 'Times New Roman', serif",
  fontSans:  "system-ui, -apple-system, sans-serif",
};

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
export const Card = ({ children, style, onClick, hover = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: T.bg,
        border: `0.5px solid ${hovered ? T.borderMed : T.border}`,
        borderRadius: T.rLg,
        padding: "14px 16px",
        transition: "border-color .15s, background .15s",
        cursor: onClick ? "pointer" : "default",
        background: hovered ? T.bgSurface : T.bg,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Surface = ({ children, style }) => (
  <div style={{ background: T.bgSurface, borderRadius: T.rMd, padding: "12px 14px", ...style }}>
    {children}
  </div>
);

export const Divider = ({ style }) => (
  <div style={{ height: "0.5px", background: T.border, margin: "12px 0", ...style }} />
);

export const Grid2 = ({ children, gap = 12, style }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap, ...style }}>
    {children}
  </div>
);

export const Grid3 = ({ children, gap = 8, style }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap, ...style }}>
    {children}
  </div>
);

export const Grid4 = ({ children, gap = 8, style }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap, ...style }}>
    {children}
  </div>
);

export const Stack = ({ children, gap = 12, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>
    {children}
  </div>
);

export const Row = ({ children, gap = 8, align = "center", justify = "flex-start", wrap = false, style }) => (
  <div style={{ display: "flex", alignItems: align, justifyContent: justify, gap, flexWrap: wrap ? "wrap" : "nowrap", ...style }}>
    {children}
  </div>
);

// ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────
export const Label = ({ children, style }) => (
  <div style={{ fontSize: 11, fontWeight: 500, color: T.textHint, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6, ...style }}>
    {children}
  </div>
);

export const Heading = ({ children, size = 16, style }) => (
  <div style={{ fontSize: size, fontWeight: 500, color: T.text, lineHeight: 1.3, ...style }}>
    {children}
  </div>
);

export const Body = ({ children, size = 13, muted = false, style }) => (
  <div style={{ fontSize: size, color: muted ? T.textMuted : T.textMid, lineHeight: 1.6, ...style }}>
    {children}
  </div>
);

export const Hint = ({ children, style }) => (
  <div style={{ fontSize: 11, color: T.textHint, lineHeight: 1.5, ...style }}>
    {children}
  </div>
);

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
export const MetricCard = ({ label, value, sub, accent, style }) => (
  <div style={{ background: T.bgSurface, borderRadius: T.rMd, padding: "12px 14px", ...style }}>
    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 5 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 500, lineHeight: 1, color: accent ?? T.text }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: T.textHint, marginTop: 3 }}>{sub}</div>}
  </div>
);

// ─── BADGE / PILL ─────────────────────────────────────────────────────────────
export const Badge = ({ children, color = "gray", style }) => {
  const colors = {
    green:  { bg: T.green50,  text: T.green800  },
    amber:  { bg: T.amber50,  text: T.amber800  },
    red:    { bg: T.red50,    text: T.red800    },
    blue:   { bg: T.blue50,   text: T.blue800   },
    gray:   { bg: T.bgDeep,   text: T.textMuted },
  };
  const c = colors[color] ?? colors.gray;
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 500,
      padding: "3px 8px", borderRadius: T.rPill,
      background: c.bg, color: c.text, ...style,
    }}>
      {children}
    </span>
  );
};

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, variant = "outline", size = "md", disabled = false, style }) => {
  const [hov, setHov] = useState(false);
  const sizes = { sm: { padding: "5px 12px", fontSize: 12 }, md: { padding: "8px 16px", fontSize: 13 }, lg: { padding: "11px 20px", fontSize: 14 } };
const variants = {
  outline: { background: hov ? T.bgSurface : "transparent", border: `0.5px solid ${T.borderMed}`, color: hov ? T.text : T.textMid },
  primary: { background: hov ? T.green600  : T.green400,    border: "none", color: "#fff" },
  ghost:   { background: hov ? T.bgSurface : "transparent", border: "none", color: T.textMuted },
  danger:  { background: hov ? T.red600    : T.red50,       border: `0.5px solid ${T.red100}`, color: hov ? "#fff" : T.red800 },
};
  const v = variants[variant] ?? variants.outline;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...sizes[size], ...v,
        borderRadius: T.rMd, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        fontFamily: T.fontSans, transition: "all .15s",
        display: "inline-flex", alignItems: "center", gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// ─── TOGGLE ──────────────────────────────────────────────────────────────────
export const Toggle = ({ on, onToggle, label, hint, style }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, ...style }}>
    <div>
      {label && <div style={{ fontSize: 13, color: T.textMid }}>{label}</div>}
      {hint  && <div style={{ fontSize: 11, color: T.textHint, marginTop: 2 }}>{hint}</div>}
    </div>
    <div
      onClick={onToggle}
      style={{
        position: "relative", width: 34, height: 20, flexShrink: 0,
        background: on ? T.green400 : T.border,
        borderRadius: 10, cursor: "pointer", transition: "background .2s",
        border: `0.5px solid ${on ? T.green600 : T.borderMed}`,
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: on ? 16 : 2,
        width: 14, height: 14, background: "#fff", borderRadius: "50%",
        transition: "left .2s", boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
      }} />
    </div>
  </div>
);

// ─── SLIDER ROW ───────────────────────────────────────────────────────────────
export const SliderRow = ({ label, min, max, step = 1, value, onChange, display, hint, style }) => (
  <div style={{ marginBottom: 12, ...style }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ fontSize: 12, color: T.textMuted }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{display ?? value}</span>
    </div>
    {hint && <div style={{ fontSize: 11, color: T.textHint, marginBottom: 4 }}>{hint}</div>}
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: T.green400, cursor: "pointer" }}
    />
  </div>
);

// ─── CHIP GROUP ───────────────────────────────────────────────────────────────
export const ChipGroup = ({ chips, selected, onSelect, multi = false, style }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, ...style }}>
    {chips.map((c) => {
      const isSelected = multi
        ? (selected ?? []).includes(c.value)
        : selected === c.value;
      return (
        <ChipItem
          key={c.value}
          label={c.label}
          selected={isSelected}
          onClick={() => onSelect(c.value)}
          disabled={c.disabled}
        />
      );
    })}
  </div>
);

export const ChipItem = ({ label, selected, onClick, disabled = false }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "6px 12px", borderRadius: T.rPill, fontSize: 12, cursor: disabled ? "not-allowed" : "pointer",
        border: selected ? `1.5px solid ${T.green400}` : `0.5px solid ${hov ? T.borderMed : T.border}`,
        background: selected ? T.green50 : hov ? T.bgSurface : "transparent",
        color: selected ? T.green800 : T.textMuted,
        fontWeight: selected ? 500 : 400,
        transition: "all .15s",
        opacity: disabled ? 0.4 : 1,
        fontFamily: T.fontSans,
      }}
    >
      {label}
    </button>
  );
};

// ─── OPTION CARD (for screening questions) ────────────────────────────────────
export const OptionCard = ({ label, sublabel, selected, onClick, icon, disabled = false, style }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "12px 14px", borderRadius: T.rLg, cursor: disabled ? "not-allowed" : "pointer",
        border: selected ? `1.5px solid ${T.green400}` : `0.5px solid ${hov ? T.borderMed : T.border}`,
        background: selected ? T.green50 : hov ? T.bgSurface : T.bg,
        transition: "all .15s", opacity: disabled ? 0.4 : 1,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon && <div style={{ fontSize: 18, width: 24, textAlign: "center" }}>{icon}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: selected ? 500 : 400, color: selected ? T.green800 : T.text }}>
            {label}
          </div>
          {sublabel && (
            <div style={{ fontSize: 11, color: selected ? T.green600 : T.textHint, marginTop: 2 }}>
              {sublabel}
            </div>
          )}
        </div>
        {selected && (
          <div style={{
            width: 18, height: 18, borderRadius: "50%", background: T.green400,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max = 100, color, height = 6, style }) => {
  const pct    = Math.max(0, Math.min(100, (value / max) * 100));
  const fillColor = color ?? (pct >= 70 ? T.green400 : pct >= 40 ? T.amber400 : T.red400);
  return (
    <div style={{ height, background: T.bgDeep, borderRadius: height / 2, overflow: "hidden", ...style }}>
      <div style={{ height: "100%", width: `${pct}%`, background: fillColor, borderRadius: height / 2, transition: "width .4s ease" }} />
    </div>
  );
};

// ─── VERDICT BOX ─────────────────────────────────────────────────────────────
export const VerdictBox = ({ verdict, title, body, style }) => {
  if (!verdict) return null;
  return (
    <div style={{
      background: verdict.bg, border: `0.5px solid ${verdict.border}`,
      borderRadius: T.rMd, padding: "14px 16px", ...style,
    }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: verdict.color, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: verdict.color, lineHeight: 1.6 }}>{body}</div>
    </div>
  );
};

// ─── WARNING BANNER ───────────────────────────────────────────────────────────
export const WarningBanner = ({ children, level = "warn", style }) => {
  const colors = {
    warn:  { bg: T.amber50, border: T.amber100, text: T.amber800 },
    error: { bg: T.red50,   border: T.red100,   text: T.red800   },
    info:  { bg: T.blue50,  border: T.blue100,  text: T.blue800  },
    good:  { bg: T.green50, border: T.green100, text: T.green800 },
  };
  const c = colors[level] ?? colors.warn;
  return (
    <div style={{
      background: c.bg, border: `0.5px solid ${c.border}`, color: c.text,
      borderRadius: T.rMd, padding: "10px 14px", fontSize: 13, lineHeight: 1.5, ...style,
    }}>
      {children}
    </div>
  );
};

// ─── FLOW ROW (cashflow line items) ──────────────────────────────────────────
export const FlowRow = ({ label, value, color, hidden, bold, style }) => {
  if (hidden) return null;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "7px 0", borderBottom: `0.5px solid ${T.border}`, fontSize: 13, ...style,
    }}>
      <span style={{ color: bold ? T.text : T.textMuted, fontWeight: bold ? 500 : 400 }}>{label}</span>
      <span style={{ fontWeight: 500, color: color ?? T.text }}>{value}</span>
    </div>
  );
};

// ─── ALLOC ROW (allocation bar + label) ──────────────────────────────────────
export const AllocRow = ({ label, pct, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, fontSize: 12 }}>
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
    <span style={{ flex: 1, color: T.textMuted, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{label}</span>
    <div style={{ width: 80, height: 4, background: T.bgDeep, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: color, borderRadius: 2, transition: "width .4s" }} />
    </div>
    <span style={{ fontWeight: 500, minWidth: 28, textAlign: "right", color: T.text }}>{pct}%</span>
  </div>
);

// ─── STEP INDICATOR (screening) ──────────────────────────────────────────────
export const StepIndicator = ({ current, total }) => (
  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{
        width: i + 1 === current ? 20 : 8, height: 8, borderRadius: 4,
        background: i + 1 < current ? T.green400 : i + 1 === current ? T.green400 : T.bgDeep,
        transition: "all .3s",
      }} />
    ))}
  </div>
);

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
export const SectionLabel = ({ children, style }) => (
  <div style={{
    fontSize: 11, fontWeight: 500, color: T.textHint, textTransform: "uppercase",
    letterSpacing: ".05em", marginBottom: 8, ...style,
  }}>
    {children}
  </div>
);

// ─── LEVER CARD ──────────────────────────────────────────────────────────────
export const LeverCard = ({ lever, isActive, onToggle, lang = "id", fmt }) => {
  const [hov, setHov] = useState(false);
  const catColor = lever.category === "timeline" ? T.blue400
    : lever.category === "income" ? T.amber400 : T.green400;
  const catBg    = lever.category === "timeline" ? T.blue50
    : lever.category === "income" ? T.amber50  : T.green50;
  const catText  = lever.category === "timeline" ? T.blue800
    : lever.category === "income" ? T.amber800 : T.green800;
  const catLabel = lever.category === "timeline" ? (lang === "id" ? "Waktu" : "Timeline")
    : lever.category === "income" ? (lang === "id" ? "Penghasilan" : "Income")
    : (lang === "id" ? "Gaya Hidup" : "Lifestyle");

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: isActive ? `1.5px solid ${T.green400}` : `0.5px solid ${hov ? T.borderMed : T.border}`,
        borderRadius: T.rLg, padding: "12px 14px",
        background: isActive ? T.green50 : hov ? T.bgSurface : T.bg,
        transition: "all .15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: T.rPill, background: catBg, color: catText }}>{catLabel}</span>
            {lever.confidence === "aspirational" && (
              <span style={{ fontSize: 11, color: T.textHint, fontStyle: "italic" }}>
                {lang === "id" ? "aspirasional" : "aspirational"}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: isActive ? T.green800 : T.text, marginBottom: 2 }}>
            {lever.label?.[lang] ?? lever.label?.id ?? lever.id}
          </div>
          {lever.monthlySaving > 0 && (
            <div style={{ fontSize: 12, color: T.green600, fontWeight: 500 }}>
              {fmt(lever.monthlySaving)}/bln
              {lever.gapClosurePct > 0 && (
                <span style={{ color: T.textHint, fontWeight: 400 }}> · tutup {lever.gapClosurePct}% gap</span>
              )}
            </div>
          )}
          {lever.timelineGainMonths && (
            <div style={{ fontSize: 12, color: T.blue600, fontWeight: 500 }}>
              +{lever.timelineGainMonths} bulan runway
              {lever.extraSavings > 0 && <span style={{ color: T.textHint, fontWeight: 400 }}> · tabungan +{fmt(lever.extraSavings)}</span>}
            </div>
          )}
          {lever.tradeoff?.[lang] && (
            <div style={{ fontSize: 11, color: T.textHint, marginTop: 3, lineHeight: 1.4 }}>
              {lang === "id" ? "Trade-off: " : "Trade-off: "}{lever.tradeoff[lang]}
            </div>
          )}
        </div>
        <Toggle on={isActive} onToggle={onToggle} />
      </div>
    </div>
  );
};

// ─── MILESTONE DOT (timeline) ────────────────────────────────────────────────
export const MilestoneDot = ({ milestone, lang = "id", fmt }) => {
  const statusColor = milestone.readyByThen ? T.green400
    : milestone.isEvent ? T.blue400 : T.amber400;
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: statusColor, border: `2px solid ${T.bg}`, outline: `1.5px solid ${statusColor}`, marginTop: 3 }} />
        <div style={{ width: 1, flex: 1, background: T.border, marginTop: 4 }} />
      </div>
      <div style={{ flex: 1, paddingBottom: 8 }}>
        <div style={{ fontSize: 11, color: T.textHint, marginBottom: 1 }}>
          {milestone.monthsFromNow === 0
            ? (lang === "id" ? "Sekarang" : "Now")
            : `${lang === "id" ? "+" : "+"}${milestone.monthsFromNow} ${lang === "id" ? "bulan" : "months"}`}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>
          {milestone.label?.[lang] ?? milestone.label?.id}
        </div>
        {milestone.amount > 0 && (
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>
            Target: {fmt(milestone.amount)}
            {milestone.shortfall > 0 && (
              <span style={{ color: T.amber800 }}> · Kurang {fmt(milestone.shortfall)}</span>
            )}
          </div>
        )}
        {milestone.inflationNote && (
          <div style={{ fontSize: 11, color: T.textHint, fontStyle: "italic", marginTop: 1 }}>
            {lang === "id" ? "sudah disesuaikan inflasi medis" : "medical inflation adjusted"}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── NAV BAR ─────────────────────────────────────────────────────────────────
export const NavBar = ({ active, onChange, sections, lang, onLangToggle }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: `0.5px solid ${T.border}`, paddingBottom: 12, marginBottom: 20,
    flexWrap: "wrap", gap: 8,
  }}>
    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          disabled={s.disabled}
          style={{
            padding: "6px 12px", borderRadius: T.rMd, fontSize: 12, cursor: s.disabled ? "not-allowed" : "pointer",
            border: "none", fontFamily: T.fontSans,
            background: active === s.id ? T.bgDeep : "transparent",
            color: active === s.id ? T.text : s.disabled ? T.textHint : T.textMuted,
            fontWeight: active === s.id ? 500 : 400,
            transition: "all .15s", opacity: s.disabled ? 0.5 : 1,
          }}
        >
          {s.label}
          {s.badge && (
            <span style={{ marginLeft: 4, fontSize: 10, background: T.green400, color: "#fff", borderRadius: T.rPill, padding: "1px 5px" }}>
              {s.badge}
            </span>
          )}
        </button>
      ))}
    </div>
    <button
      onClick={onLangToggle}
      style={{
        padding: "4px 10px", borderRadius: T.rMd, fontSize: 11, cursor: "pointer",
        border: `0.5px solid ${T.border}`, background: "transparent",
        color: T.textMuted, fontFamily: T.fontSans,
      }}
    >
      {lang === "id" ? "EN" : "ID"}
    </button>
  </div>
);

// ─── CONCEPTION TIMELINE SELECTOR ────────────────────────────────────────────
export const ConceptionTimeline = ({ value, onChange, lang = "id" }) => {
  const options = [
    { value: "now", label: { id: "Sekarang",  en: "Now"        }, sub: { id: "< 3 bulan",      en: "< 3 months"     }, months: 0  },
    { value: 6,     label: { id: "6 bulan",   en: "6 months"   }, sub: { id: "½ tahun",         en: "½ year"         }, months: 6  },
    { value: 12,    label: { id: "1 tahun",   en: "1 year"     }, sub: { id: "Paling umum",     en: "Most common"    }, months: 12 },
    { value: 18,    label: { id: "1,5 tahun", en: "1.5 years"  }, sub: { id: "Lebih siap",      en: "Better prepared"}, months: 18 },
    { value: 24,    label: { id: "2 tahun",   en: "2 years"    }, sub: { id: "Siapkan fondasi",  en: "Build foundation"}, months: 24 },
    { value: "not_sure", label: { id: "Belum tahu", en: "Not sure" }, sub: { id: "Tergantung kondisi", en: "Situational" }, months: null },
  ];

  return (
    <div>
      {/* Visual timeline bar */}
      <div style={{ position: "relative", padding: "0 8px", marginBottom: 16 }}>
        <div style={{ height: 3, background: T.bgDeep, borderRadius: 2, position: "relative" }}>
          {options.filter(o => o.months !== null).map((o, i, arr) => {
            const pos = (o.months / 24) * 100;
            const isSelected = value === o.value;
            return (
              <div
                key={o.value}
                onClick={() => onChange(o.value)}
                style={{
                  position: "absolute", top: "50%", left: `${pos}%`,
                  transform: "translate(-50%, -50%)",
                  width: isSelected ? 16 : 10, height: isSelected ? 16 : 10,
                  borderRadius: "50%", cursor: "pointer",
                  background: isSelected ? T.green400 : T.bgDeep,
                  border: `2px solid ${isSelected ? T.green600 : T.borderMed}`,
                  transition: "all .2s", zIndex: 2,
                }}
              />
            );
          })}
          {/* Fill track */}
          {value !== "not_sure" && value !== null && (
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${(value === "now" ? 0 : (Number(value) / 24)) * 100}%`,
              background: T.green400, borderRadius: 2, transition: "width .3s",
            }} />
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: T.textHint }}>
          <span>{lang === "id" ? "Sekarang" : "Now"}</span>
          <span>6 bln</span><span>1 thn</span><span>1,5 thn</span><span>2 thn</span>
        </div>
      </div>

      {/* Option cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 6 }}>
        {options.map((o) => (
          <OptionCard
            key={o.value}
            label={o.label[lang]}
            sublabel={o.sub[lang]}
            selected={value === o.value}
            onClick={() => onChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
};

// ─── SCENARIO PRESET STRIP ───────────────────────────────────────────────────
export const PresetStrip = ({ active, onLoad, lang = "id" }) => {
  const presets = [
    { id: "baseline", label: { id: "Baseline",    en: "Baseline"      }, name: { id: "Sewa Mandiri",      en: "Renting"           }, sub: { id: "Apartemen 2BR Depok", en: "2BR Apt, Depok" } },
    { id: "a",        label: { id: "Skenario A",  en: "Scenario A"    }, name: { id: "Rumah Orang Tua",   en: "Parents' Home"     }, sub: { id: "Zero rent, nabung agresif", en: "Zero rent, aggressive savings" } },
    { id: "b",        label: { id: "Skenario B",  en: "Scenario B"    }, name: { id: "Rumah Hibah + Bayi",en: "Granted House + Baby"}, sub: { id: "Direkomendasikan",    en: "Recommended"       } },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginBottom: 16 }}>
      {presets.map((p) => (
        <button
          key={p.id}
          onClick={() => onLoad(p.id)}
          style={{
            padding: "10px 12px", textAlign: "left", cursor: "pointer", borderRadius: T.rMd,
            border: active === p.id ? `1.5px solid ${T.green400}` : `0.5px solid ${T.border}`,
            background: active === p.id ? T.green50 : T.bg,
            fontFamily: T.fontSans, transition: "all .15s",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 500, color: T.textHint, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 3 }}>
            {p.label[lang]}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: active === p.id ? T.green800 : T.text }}>
            {p.name[lang]}
          </div>
          <div style={{ fontSize: 11, color: active === p.id ? T.green600 : T.textHint, marginTop: 2 }}>
            {p.sub[lang]}
          </div>
        </button>
      ))}
    </div>
  );
};

// ─── YEAR SELECTOR ────────────────────────────────────────────────────────────
export const YearSelector = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[2026, 2027, 2028].map((y) => (
      <button
        key={y}
        onClick={() => onChange(y)}
        style={{
          padding: "5px 12px", borderRadius: T.rMd, fontSize: 12, cursor: "pointer",
          border: `0.5px solid ${T.border}`, fontFamily: T.fontSans,
          background: value === y ? T.bgDeep : "transparent",
          color: value === y ? T.text : T.textMuted,
          fontWeight: value === y ? 500 : 400,
        }}
      >
        {y}
      </button>
    ))}
  </div>
);

// ─── DONUT CHART (pure SVG, no library) ──────────────────────────────────────
export const DonutChart = ({ slices, size = 120, thickness = 22 }) => {
  const r     = (size / 2) - thickness / 2;
  const circ  = 2 * Math.PI * r;
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  let offset  = 0;

  const arcs = slices.map((s) => {
    const dash  = (s.value / total) * circ;
    const gap   = circ - dash;
    const arc   = { ...s, dash, gap, offset };
    offset += dash;
    return arc;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {arcs.map((a, i) => (
        <circle
          key={i}
          r={r} cx={size / 2} cy={size / 2}
          fill="none" stroke={a.color} strokeWidth={thickness}
          strokeDasharray={`${a.dash} ${a.gap}`}
          strokeDashoffset={-a.offset + circ / 4}
          style={{ transition: "stroke-dasharray .5s ease" }}
        />
      ))}
    </svg>
  );
};

// ─── MONTH BY MONTH CHART (stress test) ──────────────────────────────────────
export const MonthChart = ({ months, height = 120 }) => {
  if (!months?.length) return null;
  const maxVal = Math.max(...months.map((m) => Math.abs(m.netFlow)), 1);
  const barW   = Math.floor(280 / months.length) - 2;
  const statusColor = { ok: T.green400, warning: T.amber400, critical: T.red400 };

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={Math.max(280, months.length * (barW + 2) + 20)} height={height + 30} style={{ display: "block" }}>
        {months.map((m, i) => {
          const barH = Math.round((Math.abs(m.netFlow) / maxVal) * (height - 20));
          const x    = 10 + i * (barW + 2);
          const y    = m.netFlow >= 0 ? height - 10 - barH : height - 10;
          const fill = statusColor[m.status] ?? T.green400;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={Math.max(2, barH)} fill={fill} rx={2} />
              <text x={x + barW / 2} y={height + 18} textAnchor="middle" fontSize={9} fill={T.textHint}>
                {m.onLeave ? `M${m.month}*` : `M${m.month}`}
              </text>
            </g>
          );
        })}
        <line x1={10} y1={height - 10} x2={months.length * (barW + 2) + 10} y2={height - 10} stroke={T.border} strokeWidth={0.5} />
      </svg>
      <div style={{ fontSize: 10, color: T.textHint, marginTop: 4 }}>* = bulan cuti melahirkan</div>
    </div>
  );
};
