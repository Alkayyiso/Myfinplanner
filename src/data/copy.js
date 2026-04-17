// ─────────────────────────────────────────────────────────────────────────────
// copy.js
// All user-facing strings, bilingual (id / en).
// Use t(key, lang) to resolve. Supports {variable} interpolation.
// ─────────────────────────────────────────────────────────────────────────────

export const COPY = {

  // ── APP SHELL ──────────────────────────────────────────────────────────────
  app: {
    title:    { id: "Perencana Keuangan Keluarga Jabodetabek", en: "Jabodetabek Family Financial Planner" },
    subtitle: { id: "Proyeksi 2026–2028 · Dual-Earner Household · Depok / Jabodetabek", en: "2026–2028 Projection · Dual-Earner Household · Depok / Jabodetabek" },
  },

  // ── NAVIGATION ─────────────────────────────────────────────────────────────
  nav: {
    profile:    { id: "Profil",     en: "Profile"     },
    calculator: { id: "Kalkulator", en: "Calculator"  },
    vault:      { id: "Skenario",   en: "Scenarios"   },
    plan:       { id: "Rencana",    en: "Plan"        },
    stress:     { id: "Stress Test",en: "Stress Test" },
  },

  // ── SCREENING — STEP LABELS ────────────────────────────────────────────────
  screening: {
    stepOf:      { id: "Langkah {current} dari {total}", en: "Step {current} of {total}" },
    next:        { id: "Lanjut",                         en: "Next"                       },
    back:        { id: "Kembali",                        en: "Back"                       },
    finish:      { id: "Lihat Hasil",                    en: "See Results"                },
    editProfile: { id: "Ubah Profil",                    en: "Edit Profile"               },

    steps: {
      1: { title: { id: "Situasi Saat Ini",   en: "Your Current Situation" }, sub: { id: "Mari kenali kondisi Anda sekarang", en: "Let's understand where you are today" } },
      2: { title: { id: "Gambaran Penghasilan", en: "Income Picture" },       sub: { id: "Tidak perlu angka pasti — estimasi sudah cukup", en: "No exact numbers needed — estimates are fine" } },
      3: { title: { id: "Tujuan Anda",        en: "Your Goals" },             sub: { id: "Pilih apa yang paling ingin Anda capai", en: "Choose what matters most to you" } },
      4: { title: { id: "Preferensi & Gaya", en: "Preferences & Style" },    sub: { id: "Bantu kami sesuaikan rencana untuk Anda", en: "Help us tailor the plan to you" } },
    },

    // Step 1 questions
    q_maritalStatus: {
      label:   { id: "Status pernikahan Anda saat ini?", en: "What is your current marital status?" },
      options: {
        married:  { id: "Sudah menikah",         en: "Married"              },
        engaged:  { id: "Sudah tunangan / lamaran", en: "Engaged"           },
        planning: { id: "Sedang berencana menikah", en: "Planning to marry" },
      },
    },
    q_weddingMonths: {
      label:   { id: "Perkiraan berapa bulan lagi menikah?", en: "How many months until your wedding?" },
      hint:    { id: "Estimasi kasar sudah cukup",           en: "A rough estimate is fine"            },
    },
    q_weddingBudget: {
      label:   { id: "Perkiraan total anggaran pernikahan?", en: "Estimated total wedding budget?" },
      options: {
        under30:  { id: "Di bawah Rp30 jt (intim/akad saja)",  en: "Under Rp30M (intimate/akad only)" },
        "30to60": { id: "Rp30–60 jt (sedang)",                  en: "Rp30–60M (moderate)"             },
        "60to100":{ id: "Rp60–100 jt (resepsi gedung)",         en: "Rp60–100M (reception hall)"      },
        over100:  { id: "Di atas Rp100 jt (besar)",             en: "Over Rp100M (grand)"              },
      },
    },
    q_livingSituation: {
      label:   { id: "Di mana Anda tinggal sekarang / setelah menikah?", en: "Where do you live now / after marriage?" },
      options: {
        with_parents:  { id: "Di rumah orang tua (tanpa bayar sewa)",      en: "With parents (no rent)"              },
        granted_house: { id: "Rumah hibah / pemberian (tanggung perawatan)",en: "Granted house (you maintain it)"     },
        renting:       { id: "Kontrak / kos / sewa apartemen",             en: "Renting apartment or house"          },
        own_property:  { id: "Properti sendiri (KPR atau lunas)",          en: "Own property (mortgage or paid off)" },
      },
    },
    q_parentalSupport: {
      label:   { id: "Dukungan apa yang Anda terima dari keluarga? (pilih semua yang berlaku)", en: "What family support do you receive? (select all that apply)" },
      options: {
        housing:          { id: "Tempat tinggal gratis / subsidi",   en: "Free or subsidised housing"    },
        childcare:        { id: "Bantuan asuh anak (kakek/nenek)",   en: "Childcare from grandparents"   },
        groceries:        { id: "Subsidi kebutuhan dapur",           en: "Grocery subsidies"              },
        financial_buffer: { id: "Bisa minta bantuan darurat",        en: "Can ask for emergency help"     },
        none:             { id: "Tidak ada (mandiri penuh)",         en: "None (fully independent)"       },
      },
    },
    q_existingDebt: {
      label:   { id: "Apakah ada cicilan / utang aktif saat ini?", en: "Do you have any active loans or instalments?" },
      options: {
        yes: { id: "Ya, ada", en: "Yes" },
        no:  { id: "Tidak ada", en: "No" },
      },
    },
    q_existingDebtAmount: {
      label:   { id: "Total kewajiban cicilan per bulan?", en: "Total monthly debt obligation?" },
      options: {
        under1:  { id: "Di bawah Rp1 jt / bulan",  en: "Under Rp1M / month"  },
        "1to3":  { id: "Rp1–3 jt / bulan",         en: "Rp1–3M / month"      },
        "3to5":  { id: "Rp3–5 jt / bulan",         en: "Rp3–5M / month"      },
        over5:   { id: "Di atas Rp5 jt / bulan",   en: "Over Rp5M / month"   },
      },
    },
    q_bpjsActive: {
      label:   { id: "Status BPJS Kesehatan Anda berdua?", en: "BPJS Kesehatan status for both of you?" },
      options: {
        both:    { id: "Keduanya aktif",               en: "Both active"           },
        one:     { id: "Hanya satu yang aktif",        en: "Only one is active"    },
        neither: { id: "Belum ada / tidak aktif",      en: "Neither / not active"  },
      },
      warning: { id: "BPJS tidak aktif = risiko finansial besar saat sakit atau melahirkan.", en: "Inactive BPJS = major financial risk during illness or childbirth." },
    },

    // Step 2 questions
    q_incomeBracket: {
      label: { id: "Perkiraan total penghasilan bersih gabungan per bulan?", en: "Estimated total combined net income per month?" },
      hint:  { id: "Gaji setelah pajak + semua sumber penghasilan", en: "After-tax salary + all income sources" },
    },
    q_husbandEmployment: {
      label:   { id: "Status pekerjaan suami / pasangan pertama?", en: "Husband / Partner 1 employment type?" },
      options: {
        employed:      { id: "Karyawan tetap (PKWTT)",      en: "Permanent employee"  },
        contract:      { id: "Karyawan kontrak (PKWT)",     en: "Contract employee"   },
        freelance:     { id: "Freelance / pekerja lepas",   en: "Freelance / gig"     },
        business_owner:{ id: "Pemilik usaha / wirausaha",   en: "Business owner"      },
      },
    },
    q_wifeEmployment: {
      label:   { id: "Status pekerjaan istri / pasangan kedua?", en: "Wife / Partner 2 employment type?" },
      options: {
        employed:      { id: "Karyawan tetap (PKWTT)",      en: "Permanent employee"  },
        contract:      { id: "Karyawan kontrak (PKWT)",     en: "Contract employee"   },
        freelance:     { id: "Freelance / pekerja lepas",   en: "Freelance / gig"     },
        business_owner:{ id: "Pemilik usaha / wirausaha",   en: "Business owner"      },
        not_working:   { id: "Tidak bekerja saat ini",      en: "Not currently working"},
      },
    },
    q_incomeOutlook: {
      label:   { id: "Bagaimana perkiraan penghasilan Anda dalam 12 bulan ke depan?", en: "How do you expect your income to change in the next 12 months?" },
      options: {
        stable:           { id: "Stabil — tidak banyak berubah",            en: "Stable — no major changes"       },
        expecting_raise:  { id: "Kemungkinan naik (kenaikan gaji / promosi)",en: "Likely to increase (raise/promo)"},
        job_change:       { id: "Ada kemungkinan pindah kerja",             en: "Possible job change"              },
        one_may_stop:     { id: "Salah satu mungkin berhenti kerja",        en: "One partner may stop working"    },
      },
    },

    // Step 3 questions
    q_primaryGoal: {
      label:  { id: "Apa tujuan finansial utama Anda saat ini?", en: "What is your main financial goal right now?" },
      hint:   { id: "Pilih satu yang paling ingin Anda capai dalam 1–2 tahun ke depan", en: "Pick the one you most want to achieve in the next 1–2 years" },
    },
    q_supportingGoals: {
      label:  { id: "Ada tujuan lain yang ingin dicapai bersamaan? (maks. 2)", en: "Any other goals to pursue alongside? (max 2)" },
      hint:   { id: "Terlalu banyak tujuan = fokus pecah. Prioritas itu kunci.", en: "Too many goals = split focus. Prioritisation is key." },
      maxWarning: { id: "Kami sarankan maksimal 2 tujuan pendukung agar fokus tetap terjaga.", en: "We recommend max 2 supporting goals to maintain focus." },
    },
    q_conceptionTimeline: {
      label:   { id: "Kapan Anda berencana untuk mulai mencoba hamil?", en: "When do you plan to start trying to conceive?" },
      options: {
        now:      { id: "Sekarang / dalam 3 bulan",        en: "Now / within 3 months"    },
        6:        { id: "Sekitar 6 bulan setelah menikah", en: "~6 months after marriage"  },
        12:       { id: "Sekitar 1 tahun setelah menikah", en: "~1 year after marriage"    },
        18:       { id: "Sekitar 1,5 tahun setelah menikah",en: "~1.5 years after marriage"},
        24:       { id: "Sekitar 2 tahun setelah menikah", en: "~2 years after marriage"   },
        not_sure: { id: "Belum tahu — tergantung kondisi", en: "Not sure — depends on situation" },
      },
    },
    q_motherReturnToWork: {
      label:   { id: "Setelah melahirkan, apakah ibu berencana kembali bekerja?", en: "After birth, does the mother plan to return to work?" },
      options: {
        yes_3mo: { id: "Ya, setelah cuti 3 bulan (wajib)",  en: "Yes, after 3 months (statutory leave)" },
        yes_6mo: { id: "Ya, setelah cuti 6 bulan",         en: "Yes, after 6 months"                   },
        yes_12mo:{ id: "Ya, setelah cuti 12 bulan",        en: "Yes, after 12 months"                  },
        no:      { id: "Tidak — istri akan di rumah penuh", en: "No — wife will be full-time at home"   },
      },
    },
    q_grandparentChildcare: {
      label:   { id: "Apakah kakek/nenek bisa bantu jaga anak secara rutin?", en: "Can grandparents regularly help with childcare?" },
      hint:    { id: "Ini bisa menghemat Rp2–4 jt/bulan biaya pengasuh", en: "This can save Rp2–4M/month in babysitter costs" },
      options: {
        yes: { id: "Ya, bisa rutin setiap hari kerja",       en: "Yes, regularly on weekdays"   },
        partial: { id: "Sebagian — beberapa hari saja",      en: "Partially — a few days/week"  },
        no:  { id: "Tidak — kami akan cari pengasuh sendiri",en: "No — we will hire a babysitter"},
      },
    },

    // Step 4 questions
    q_riskTolerance: {
      label:   { id: "Bagaimana gaya investasi Anda?", en: "What is your investment style?" },
      options: {
        conservative: { id: "Konservatif — utamakan aman (RDPU + Emas)",      en: "Conservative — safety first (RDPU + Gold)"   },
        moderate:     { id: "Moderat — campuran aman dan tumbuh",              en: "Moderate — balanced safe and growth"          },
        growth:       { id: "Agresif — siap rugi jangka pendek demi tumbuh",  en: "Growth — OK with short-term loss for growth"  },
      },
    },
    q_lifestyleVsSpeed: {
      label: { id: "Mana yang lebih penting bagi Anda?", en: "What matters more to you?" },
      left:  { id: "Optimasi keras — capai tujuan secepat mungkin", en: "Optimise hard — reach goals as fast as possible" },
      right: { id: "Hidup nyaman — nikmati perjalanannya",          en: "Live well — enjoy the journey"                   },
    },
    q_upcomingExpenses: {
      label:   { id: "Ada pengeluaran besar yang direncanakan dalam 12 bulan ke depan?", en: "Any planned big expenses in the next 12 months?" },
      options: {
        wedding:     { id: "Biaya pernikahan",          en: "Wedding costs"      },
        renovation:  { id: "Renovasi rumah",            en: "Home renovation"    },
        vehicle:     { id: "Beli kendaraan",            en: "Vehicle purchase"   },
        education:   { id: "Pendidikan / kursus",       en: "Education / course" },
        umroh_hajj:  { id: "Umroh / Haji",              en: "Umroh / Hajj"       },
        none:        { id: "Tidak ada",                 en: "None planned"       },
      },
    },
  },

  // ── VERDICT COPY ───────────────────────────────────────────────────────────
  verdict: {
    optimal: {
      title: { id: "Optimal — Kondisi Sangat Sehat",    en: "Optimal — Excellent Financial Health" },
      body:  { id: "Anda berada jauh di atas Comfortable Target. Alokasikan kelebihan ke emas/SBN/reksa dana untuk melawan inflasi medis. Pertahankan disiplin investasi 26%.", en: "You are well above the Comfortable Target. Allocate surplus to gold/SBN/mutual funds to beat medical inflation. Maintain 26% investment discipline." },
    },
    go: {
      title: { id: "Siap Jalan — Comfortable Target Tercapai", en: "Ready to Go — Comfortable Target Reached" },
      body:  { id: "Kondisi keuangan Anda sehat. Pertahankan disiplin debit-kredit dan tingkatkan alokasi investasi secara bertahap.", en: "Your finances are healthy. Maintain debit-kredit discipline and gradually increase investment allocation." },
    },
    conditional: {
      title: { id: "Belum Optimal — Zona Survival",    en: "Not Yet Optimal — Survival Zone" },
      body:  { id: "Anda bisa berjalan, tapi ketahanan finansial masih rendah. Satu kejadian tak terduga bisa mengguncang seluruh rencana. Bangun dana darurat terlebih dahulu.", en: "You can proceed, but financial resilience is low. One unexpected event could derail everything. Build emergency fund first." },
    },
    nogo: {
      title: { id: "Belum Siap — Tapi Ada Jalannya",  en: "Not Yet — But There Is a Path" },
      body:  { id: "Kondisi saat ini belum mencapai ambang aman untuk tujuan ini. Bukan berarti tidak bisa — artinya perlu penyesuaian. Lihat panduan di bawah.", en: "Current conditions haven't reached the safe threshold for this goal. This doesn't mean impossible — it means adjustments are needed. See the guided plan below." },
    },
    deficit: {
      title: { id: "Defisit — Pengeluaran Melebihi Penghasilan", en: "Deficit — Expenses Exceed Income" },
      body:  { id: "Arus kas negatif {gap}/bulan. Ini harus diselesaikan sebelum tujuan apapun bisa dikejar. Aktifkan lever di bawah untuk melihat jalur keluar.", en: "Cash flow is negative {gap}/month. This must be resolved before any goal can be pursued. Activate levers below to find a way out." },
    },
  },

  // ── LEVER COPY ─────────────────────────────────────────────────────────────
  levers: {
    downgrade_sitter: {
      label:    { id: "Ganti ke pengasuh live-out",          en: "Switch to live-out babysitter"         },
      impact:   { id: "Hemat {amount}/bln — tutup {pct}% gap", en: "Save {amount}/mo — closes {pct}% of gap" },
      tradeoff: { id: "Butuh koordinasi jadwal lebih ketat", en: "Requires stricter schedule coordination" },
    },
    remove_car_cicilan: {
      label:    { id: "Hapus cicilan mobil",                 en: "Remove car instalment"                 },
      impact:   { id: "Hemat {amount}/bln — tutup {pct}% gap", en: "Save {amount}/mo — closes {pct}% of gap" },
      tradeoff: { id: "Pertimbangkan beli mobil cash di masa depan", en: "Consider buying car cash in the future" },
    },
    switch_transport_ev: {
      label:    { id: "Beralih ke motor listrik + KRL",      en: "Switch to EV motorcycle + KRL"         },
      impact:   { id: "Hemat {amount}/bln — tutup {pct}% gap", en: "Save {amount}/mo — closes {pct}% of gap" },
      tradeoff: { id: "Perjalanan lebih lama tapi lebih hemat", en: "Longer commute but significantly cheaper" },
    },
    reduce_lifestyle: {
      label:    { id: "Kurangi pengeluaran gaya hidup 30%",  en: "Reduce lifestyle spending by 30%"      },
      impact:   { id: "Hemat {amount}/bln — tutup {pct}% gap", en: "Save {amount}/mo — closes {pct}% of gap" },
      tradeoff: { id: "Batasi makan di luar, hiburan, dan belanja non-esensial", en: "Limit dining out, entertainment, non-essentials" },
    },
    grandparent_childcare: {
      label:    { id: "Aktifkan pengasuhan kakek/nenek",     en: "Activate grandparent childcare"        },
      impact:   { id: "Hemat {amount}/bln — tutup {pct}% gap", en: "Save {amount}/mo — closes {pct}% of gap" },
      tradeoff: { id: "Perlu kesepakatan dan dukungan keluarga besar", en: "Requires family agreement and commitment" },
    },
    delay_conception: {
      label:    { id: "Tunda rencana hamil {months} bulan", en: "Delay conception plan by {months} months" },
      impact:   { id: "Tambah tabungan Rp{amount} sebelum kelahiran", en: "Add Rp{amount} savings before birth" },
      tradeoff: { id: "Waktu lebih panjang tapi runway lebih kuat",   en: "Longer timeline but stronger financial runway" },
    },
    add_side_income: {
      label:    { id: "Tambah penghasilan sampingan Rp{amount}/bln", en: "Add side income Rp{amount}/mo"  },
      impact:   { id: "Tutup {pct}% gap jika tercapai",             en: "Closes {pct}% of gap if achieved" },
      tradeoff: { id: "Aspirasional — perlu upaya ekstra dan waktu", en: "Aspirational — requires extra effort and time" },
      confidence: "aspirational",
    },
    delay_wedding: {
      label:    { id: "Tunda pernikahan {months} bulan",    en: "Delay wedding by {months} months"       },
      impact:   { id: "Tambah tabungan Rp{amount} sebelum hari H", en: "Add Rp{amount} savings before the wedding" },
      tradeoff: { id: "Lebih banyak waktu untuk mempersiapkan biaya", en: "More time to accumulate wedding funds" },
    },
    reduce_wedding_budget: {
      label:    { id: "Kurangi anggaran pernikahan",         en: "Reduce wedding budget"                  },
      impact:   { id: "Hemat Rp{amount} one-time — kurangi tekanan arus kas", en: "Save Rp{amount} one-time — reduce cashflow pressure" },
      tradeoff: { id: "Prioritaskan masa depan di atas satu hari pernikahan", en: "Prioritise the future over one wedding day" },
    },
    asi_exclusive: {
      label:    { id: "ASI eksklusif (hemat biaya formula)", en: "Exclusive breastfeeding (no formula)"   },
      impact:   { id: "Hemat {amount}/bln — tutup {pct}% gap", en: "Save {amount}/mo — closes {pct}% of gap" },
      tradeoff: { id: "Membutuhkan komitmen dan dukungan dari tempat kerja", en: "Requires commitment and workplace support" },
    },
  },

  // ── STRESS TEST ────────────────────────────────────────────────────────────
  stressTest: {
    title:   { id: "Stress Test: Simulasi Cuti Melahirkan",      en: "Stress Test: Maternity Leave Simulation"   },
    subtitle:{ id: "Bagaimana arus kas keluarga selama istri cuti?", en: "How does family cashflow hold up during maternity leave?" },
    months:  { id: "{n} bulan cuti",                             en: "{n}-month leave"                           },
    ok:      { id: "Aman",                                       en: "OK"                                        },
    warning: { id: "Perhatian",                                  en: "Warning"                                   },
    critical:{ id: "Kritis",                                     en: "Critical"                                  },
    survives:{ id: "Dana darurat cukup menanggung seluruh cuti", en: "Emergency fund covers the full leave"       },
    burns:   { id: "Dana darurat habis di bulan ke-{month}",     en: "Emergency fund depleted by month {month}"  },
    recovery:{ id: "Kembali ke posisi normal dalam {months} bulan setelah cuti selesai", en: "Recover to pre-leave position in {months} months after returning" },
  },

  // ── VAULT ──────────────────────────────────────────────────────────────────
  vault: {
    title:    { id: "Brankas Skenario",       en: "Scenario Vault"           },
    subtitle: { id: "Simpan dan bandingkan hingga 3 skenario berbeda", en: "Save and compare up to 3 different scenarios" },
    empty:    { id: "Slot kosong",            en: "Empty slot"               },
    save:     { id: "Simpan ke slot ini",     en: "Save to this slot"        },
    load:     { id: "Muat skenario ini",      en: "Load this scenario"       },
    compare:  { id: "Bandingkan",             en: "Compare"                  },
    overwrite:{ id: "Timpa",                  en: "Overwrite"                },
    lastSaved:{ id: "Terakhir disimpan: {date}", en: "Last saved: {date}"   },
    slots: {
      utama:       { id: "Rencana Utama",  en: "Main Plan"      },
      optimis:     { id: "Optimis",        en: "Optimistic"     },
      konservatif: { id: "Konservatif",    en: "Conservative"   },
    },
  },

  // ── PLAN / GUIDED ──────────────────────────────────────────────────────────
  plan: {
    title:    { id: "Rencana Panduan",       en: "Guided Plan"              },
    leversTitle: { id: "Pilihan Penyesuaian", en: "Adjustment Options"     },
    leversSubtitle: { id: "Aktifkan lever untuk melihat dampaknya secara langsung", en: "Toggle levers to see their live impact" },
    afterLevers: { id: "Setelah penyesuaian yang Anda pilih:", en: "After your selected adjustments:" },
    applyAll: { id: "Terapkan semua yang aktif ke rencana saya", en: "Apply all active to my plan" },
    timeline: { id: "Peta Jalan Finansial",  en: "Financial Roadmap"        },
    goalReady:   { id: "Siap",              en: "Ready"                    },
    goalOnTrack: { id: "Menuju target",     en: "On Track"                 },
    goalAtRisk:  { id: "Berisiko",          en: "At Risk"                  },
    goalConflict:{ id: "Konflik tujuan",    en: "Goal Conflict"            },
  },

  // ── WARNINGS ───────────────────────────────────────────────────────────────
  warnings: {
    bpjs:         { id: "BPJS tidak aktif pada salah satu atau kedua pihak. Aktifkan segera — cuti melahirkan tanpa BPJS bisa menguras Rp30–70 jt.", en: "BPJS inactive for one or both partners. Activate immediately — childbirth without BPJS can cost Rp30–70M out of pocket." },
    debtBurden:   { id: "Cicilan aktif mengurangi ruang investasi. Pertimbangkan pelunasan sebagai tujuan prioritas.", en: "Active debt reduces investment room. Consider debt payoff as a priority goal." },
    goalConflict: { id: "Tujuan {a} dan {b} bersaing untuk kas yang sama. Kami sarankan fokus ke satu dulu.", en: "Goals {a} and {b} compete for the same cash. We suggest focusing on one first." },
    tooManyGoals: { id: "Tiga tujuan sekaligus membagi tabungan Anda menjadi terlalu kecil. Pilih fokus utama.", en: "Three goals simultaneously splits your savings too thin. Choose a primary focus." },
    maternityDip: { id: "Dana darurat Anda tidak cukup untuk menanggung cuti melahirkan {months} bulan. Lihat Stress Test.", en: "Your emergency fund is insufficient to cover {months}-month maternity leave. See Stress Test." },
    lowInvestment:{ id: "Alokasi investasi {pct}% — di bawah target 26%. Inflasi medis {inflRate}%/tahun akan menggerus daya beli.", en: "Investment allocation {pct}% — below 26% target. Medical inflation at {inflRate}%/year erodes purchasing power." },
    doubleTrap:   { id: "Waspada 'Double Income Trap': penghasilan istri hampir habis untuk biaya pengasuh + transportasi. Hitung net contribution-nya.", en: "Beware of the 'Double Income Trap': wife's income is nearly consumed by childcare + transport costs. Calculate net contribution." },
  },

  // ── GENERAL UI ─────────────────────────────────────────────────────────────
  ui: {
    customize:      { id: "Kustomisasi Skenario",   en: "Customise Scenario"   },
    saveScenario:   { id: "Simpan Skenario",         en: "Save Scenario"        },
    loadPreset:     { id: "Muat Preset",             en: "Load Preset"          },
    projectionYear: { id: "Tahun proyeksi:",         en: "Projection year:"     },
    perMonth:       { id: "/bln",                    en: "/mo"                  },
    perYear:        { id: "/tahun",                  en: "/year"                },
    months:         { id: "bulan",                   en: "months"               },
    million:        { id: "jt",                      en: "M"                    },
    thousand:       { id: "rb",                      en: "K"                    },
    total:          { id: "Total",                   en: "Total"                },
    gap:            { id: "Gap",                     en: "Gap"                  },
    surplus:        { id: "Surplus",                 en: "Surplus"              },
    margin:         { id: "Sisa kas",                en: "Free cash"            },
    recommended:    { id: "Direkomendasikan",        en: "Recommended"          },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Resolver — t(keyPath, lang, vars)
// Usage: t("verdict.go.title", "id")
//        t("levers.delay_conception.impact", "en", { months: 6, amount: "Rp25 jt" })
// ─────────────────────────────────────────────────────────────────────────────
export function t(keyPath, lang = "id", vars = {}) {
  const keys  = keyPath.split(".");
  let node    = COPY;
  for (const key of keys) {
    if (node == null) return keyPath;
    node = node[key];
  }
  if (node == null) return keyPath;
  let str = node[lang] ?? node["id"] ?? keyPath;
  // interpolate {variable} placeholders
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  });
  return str;
}
