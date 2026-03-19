(() => {
  type Lang = "hi" | "en";
  type ThemeMode = "night" | "dawn";
  type Mode = "dashboard" | "plan" | "benefits";
  type Sex = "male" | "female";

  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }

  type Profile = {
    sex: Sex;
    wake: string;
    sleep: string;
    intervalHours: 1 | 2 | 3;
    cupMl: number;
  };

  type LogEntry = { time: string; amount: number; timestamp?: string };
  type DailyLog = { date: string; consumedMl: number; entries: LogEntry[]; notifiedSlots: string[] };
  type LogsMap = Record<string, DailyLog>;

  const STORAGE = {
    lang: "jal-lang",
    theme: "jal-theme",
    familyTheme: "sathi-family-theme",
    familyThemeMode: "sathi-family-theme-mode",
    reminderTime: "jal-reminder-start",
    reminderEnabled: "jal-reminder-enabled",
    installMarker: "sathi-installed-jal-sathi",
    profile: "jal-profile",
    logs: "jal-logs",
    cloudSyncedAt: "jal-cloud-synced-at",
    lastOpen: "jal-last-open",
    catchupSeen: "jal-catchup-seen",
    reminderLastPing: "jal-reminder-last-ping"
  } as const;

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC6Cpg83N8fBuvY7YOSwTWsfM9DUsaVc3E",
    authDomain: "pariksha-sathi.firebaseapp.com",
    projectId: "pariksha-sathi",
    storageBucket: "pariksha-sathi.firebasestorage.app",
    messagingSenderId: "921721697043",
    appId: "1:921721697043:web:dada90a420c40e11ae60e6",
    measurementId: "G-NC7955J7KV"
  } as const;

  const BENEFITS = {
    hi: [
      { title: "Energy steady", text: "Body ko din bhar me better hydration pace milta hai." },
      { title: "Mind clarity", text: "Thakaan aur mental fog kam feel hoti hai." },
      { title: "Routine anchor", text: "Hourly sip aapke din ko gentle structure deta hai." },
      { title: "Recovery support", text: "Garmi, walk, aur work ke baad recovery me madad milti hai." }
    ],
    en: [
      { title: "Energy steady", text: "Your body gets a smoother hydration pace through the day." },
      { title: "Mind clarity", text: "Fatigue and mental fog often feel lighter with better rhythm." },
      { title: "Routine anchor", text: "A simple sip reminder creates a calm daily structure." },
      { title: "Recovery support", text: "It helps your day recover better after heat, walks, and work." }
    ]
  } as const;

  const UI_COPY = {
    hi: {
      menuLabel: "Quick Controls",
      menuTitle: "Jal menu",
      languageLabel: "Language",
      languageTitle: "Hindi aur English",
      themeLabel: "Theme",
      themeTitle: "Water studio mode",
      themeAction: "Theme badlo",
      installLabel: "Install",
      installTitle: "App ko phone par rakho",
      installAction: "Install app",
      authLabel: "Family login",
      authTitle: "Ek login, poori family",
      authLoading: "Login status load ho raha hai...",
      authSignIn: "Login with Google",
      authSignOut: "Logout",
      authSignedAs: "Signed in as",
      authLoggedOut: "Abhi family login active nahi hai.",
      reminderLabel: "Reminder",
      reminderTitle: "Hourly hydration alert",
      reminderField: "First reminder time",
      reminderSave: "Reminder save karo",
      pagesLabel: "Pages",
      pagesTitle: "Family links aur info",
      pageAbout: "About",
      pageResources: "Resources",
      pageContact: "Contact",
      pagePrivacy: "Privacy Policy",
      pageTerms: "Terms & Conditions",
      pageFamily: "Aapka-Sathi Family",
      brandTag: "Hydration rhythm desk",
      familyChip: "Aapka-Sathi family ka hissa",
      heroHeadline: "Pani peene ki aadat ko schedule, streak, aur calm dashboard ke saath easy banao.",
      heroText: "Official baseline guidance ko simple daily goal me badal kar app aapko wake se sleep tak pace maintain karne me help karta hai.",
      goalLabel: "Today's goal",
      streakLabel: "Hydration streak",
      dashboardLabel: "Today's hydration",
      dashboardTitle: "Live progress orb",
      quickLogLabel: "Quick log",
      quickLogTitle: "Ek tap me add karo",
      undoLast: "Undo last",
      catchupLabel: "Catch-up",
      catchupTitle: "Aaj se hydration board continue karein?",
      dismiss: "Dismiss",
      timelineLabel: "Reminder timeline",
      timelineTitle: "Wake se sleep tak plan",
      planLabel: "Personal plan",
      planTitle: "Goal aur reminder pace set karo",
      sexLabel: "Profile",
      wakeLabel: "Wake time",
      sleepLabel: "Sleep time",
      intervalLabel: "Reminder interval",
      cupLabel: "Default cup size",
      savePlan: "Save plan",
      guidelineLabel: "Guideline",
      guidelineTitle: "Official baseline",
      guidelineNote: "This is a daily wellness baseline, not medical advice.",
      benefitLabel: "Benefits",
      benefitTitle: "Pani pace maintain karne ka fayda",
      cloudLabel: "Cloud sync",
      logLabel: "Today's log",
      logTitle: "Recent sips",
      profileLabel: "Profile summary",
      profileTitle: "Daily rhythm",
      footerNote: "Pani peene ko routine se joy me badalne ke liye.",
      reminderSaved: (time: string) => `Hydration reminder ${time} se active ho gaya.`,
      reminderBlocked: "Notification permission off hai, isliye sirf local plan save hua hai.",
      installUnavailable: "Install prompt abhi available nahi hai. Browser menu se install try karo.",
      guidelineMale: "Men ke liye baseline around 3.7 litres per day rakha gaya hai.",
      guidelineFemale: "Women ke liye baseline around 2.7 litres per day rakha gaya hai.",
      goalMeta: (cups: string) => `${cups} default cups ke aas-paas`,
      streakMeta: (days: string) => `${days} din ka running streak`,
      streakHeadline: (days: string) => `${days} days`,
      remainingLabel: (value: string) => `${value} baaki`,
      cupsLeft: "Cups left",
      nextSip: "Next sip",
      pace: "Current pace",
      logEmpty: "Abhi tak aaj ka water log empty hai.",
      noReminderLeft: "Aaj ke reminders complete",
      paceGood: "On track",
      paceSlow: "Catch up gently",
      paceGreat: "Ahead of pace",
      slotDone: "Logged",
      slotPending: "Pending",
      planSaved: "Plan save ho gaya.",
      male: "Male",
      female: "Female",
      dashboard: "Dashboard",
      plan: "Plan",
      benefits: "Benefits",
      summaryGoal: "Daily goal",
      summaryWindow: "Wake window",
      summaryInterval: "Reminder gap",
      summaryCup: "Cup size",
      catchupMeta: (days: string) => `${days} din baad app khula hai. Aaj ka hydration board fresh start ke saath ready hai.`,
      cloudReady: "Family sync ready",
      cloudUser: "Family account linked",
      cloudSavedAt: (value: string) => `Last cloud save: ${value}`
    },
    en: {
      menuLabel: "Quick Controls",
      menuTitle: "Jal menu",
      languageLabel: "Language",
      languageTitle: "Hindi and English",
      themeLabel: "Theme",
      themeTitle: "Water studio mode",
      themeAction: "Change theme",
      installLabel: "Install",
      installTitle: "Keep the app on your phone",
      installAction: "Install app",
      authLabel: "Family login",
      authTitle: "One login, whole family",
      authLoading: "Loading login status...",
      authSignIn: "Login with Google",
      authSignOut: "Logout",
      authSignedAs: "Signed in as",
      authLoggedOut: "No family login is active right now.",
      reminderLabel: "Reminder",
      reminderTitle: "Hourly hydration alert",
      reminderField: "First reminder time",
      reminderSave: "Save reminder",
      pagesLabel: "Pages",
      pagesTitle: "Family links and info",
      pageAbout: "About",
      pageResources: "Resources",
      pageContact: "Contact",
      pagePrivacy: "Privacy Policy",
      pageTerms: "Terms & Conditions",
      pageFamily: "Aapka-Sathi Family",
      brandTag: "Hydration rhythm desk",
      familyChip: "Part of Aapka-Sathi family",
      heroHeadline: "Make water intake easier with a calm schedule, streaks, and a live dashboard.",
      heroText: "The app turns official baseline guidance into a simple daily goal that helps you hold a better pace from wake-up to sleep.",
      goalLabel: "Today's goal",
      streakLabel: "Hydration streak",
      dashboardLabel: "Today's hydration",
      dashboardTitle: "Live progress orb",
      quickLogLabel: "Quick log",
      quickLogTitle: "Add with one tap",
      undoLast: "Undo last",
      catchupLabel: "Catch-up",
      catchupTitle: "Continue today's hydration board?",
      dismiss: "Dismiss",
      timelineLabel: "Reminder timeline",
      timelineTitle: "Plan from wake to sleep",
      planLabel: "Personal plan",
      planTitle: "Set your goal and reminder pace",
      sexLabel: "Profile",
      wakeLabel: "Wake time",
      sleepLabel: "Sleep time",
      intervalLabel: "Reminder interval",
      cupLabel: "Default cup size",
      savePlan: "Save plan",
      guidelineLabel: "Guideline",
      guidelineTitle: "Official baseline",
      guidelineNote: "This is a daily wellness baseline, not medical advice.",
      benefitLabel: "Benefits",
      benefitTitle: "Why hydration rhythm helps",
      cloudLabel: "Cloud sync",
      logLabel: "Today's log",
      logTitle: "Recent sips",
      profileLabel: "Profile summary",
      profileTitle: "Daily rhythm",
      footerNote: "Built to turn hydration from a task into a calm routine.",
      reminderSaved: (time: string) => `Hydration reminders are active from ${time}.`,
      reminderBlocked: "Notification permission is off, so only the local plan was saved.",
      installUnavailable: "The install prompt is not available yet. Try the browser install option.",
      guidelineMale: "The baseline for men is set around 3.7 litres per day.",
      guidelineFemale: "The baseline for women is set around 2.7 litres per day.",
      goalMeta: (cups: string) => `roughly ${cups} default cups`,
      streakMeta: (days: string) => `${days}-day running streak`,
      streakHeadline: (days: string) => `${days} days`,
      remainingLabel: (value: string) => `${value} left`,
      cupsLeft: "Cups left",
      nextSip: "Next sip",
      pace: "Current pace",
      logEmpty: "Today's water log is still empty.",
      noReminderLeft: "Today's reminders are complete",
      paceGood: "On track",
      paceSlow: "Catch up gently",
      paceGreat: "Ahead of pace",
      slotDone: "Logged",
      slotPending: "Pending",
      planSaved: "Plan saved.",
      male: "Male",
      female: "Female",
      dashboard: "Dashboard",
      plan: "Plan",
      benefits: "Benefits",
      summaryGoal: "Daily goal",
      summaryWindow: "Wake window",
      summaryInterval: "Reminder gap",
      summaryCup: "Cup size",
      catchupMeta: (days: string) => `The app opened after ${days} days. Today's hydration board is ready with a fresh start.`,
      cloudReady: "Family sync ready",
      cloudUser: "Family account linked",
      cloudSavedAt: (value: string) => `Last cloud save: ${value}`
    }
  } as const;

  const state = {
    lang: (localStorage.getItem(STORAGE.lang) as Lang) || "hi",
    theme: resolveTheme(getThemePreference()),
    mode: "dashboard" as Mode,
    profile: loadProfile(),
    logs: safeJsonParse<LogsMap>(localStorage.getItem(STORAGE.logs), {}),
    reminderStart: localStorage.getItem(STORAGE.reminderTime) || "08:00",
    authUser: null as { uid: string; displayName: string | null; email: string | null } | null,
    deferredPrompt: null as BeforeInstallPromptEvent | null
  };

  const firebaseContext: { db: unknown | null; auth: unknown | null; sdk: Record<string, unknown> | null; saveTimer: number | null } = {
    db: null,
    auth: null,
    sdk: null,
    saveTimer: null
  };

  let reminderPoll: number | null = null;

  function safeJsonParse<T>(value: string | null, fallback: T): T {
    try {
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  function loadProfile(): Profile {
    return safeJsonParse<Profile>(localStorage.getItem(STORAGE.profile), {
      sex: "male",
      wake: "07:00",
      sleep: "22:30",
      intervalHours: 1,
      cupMl: 250
    });
  }

  function getThemePreference(): string {
    return localStorage.getItem(STORAGE.familyThemeMode)
      || localStorage.getItem(STORAGE.familyTheme)
      || localStorage.getItem(STORAGE.theme)
      || "system";
  }

  function resolveTheme(themePreference: string): ThemeMode {
    if (themePreference === "night" || themePreference === "dawn") return themePreference;
    const base = themePreference === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : themePreference;
    return base === "light" ? "dawn" : "night";
  }

  function $(id: string): HTMLElement {
    return document.getElementById(id) as HTMLElement;
  }

  function inputEl(id: string): HTMLInputElement {
    return document.getElementById(id) as HTMLInputElement;
  }

  function selectEl(id: string): HTMLSelectElement {
    return document.getElementById(id) as HTMLSelectElement;
  }

  function t<K extends keyof typeof UI_COPY.hi>(key: K): (typeof UI_COPY.hi)[K] {
    return UI_COPY[state.lang][key] as (typeof UI_COPY.hi)[K];
  }

  function todayKey(date = new Date()): string {
    return date.toISOString().slice(0, 10);
  }

  function nowTime(): string {
    return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function parseTime(value: string): number {
    const [hours, minutes] = value.split(":").map((part) => Number(part));
    return hours * 60 + minutes;
  }

  function formatTime(minutes: number): string {
    const date = new Date();
    date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return new Intl.DateTimeFormat(state.lang === "hi" ? "hi-IN" : "en-IN", {
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }

  function mlGoal(): number {
    return state.profile.sex === "male" ? 3700 : 2700;
  }

  function cupsForGoal(): string {
    return String(Math.ceil(mlGoal() / state.profile.cupMl));
  }

  function ensureTodayLog(): DailyLog {
    const key = todayKey();
    if (!state.logs[key]) {
      state.logs[key] = { date: key, consumedMl: 0, entries: [], notifiedSlots: [] };
    }
    return state.logs[key];
  }

  function saveLocalState(): void {
    localStorage.setItem(STORAGE.profile, JSON.stringify(state.profile));
    localStorage.setItem(STORAGE.logs, JSON.stringify(state.logs));
  }

  function scheduledSlots(): number[] {
    const wake = parseTime(state.profile.wake);
    const sleep = parseTime(state.profile.sleep);
    const interval = state.profile.intervalHours * 60;
    const slots: number[] = [];
    for (let minute = wake; minute <= sleep; minute += interval) slots.push(minute);
    return slots;
  }

  function streakDays(): number {
    const keys = Object.keys(state.logs).sort().reverse();
    let streak = 0;
    const compare = new Date();
    compare.setHours(0, 0, 0, 0);

    for (const key of keys) {
      const log = state.logs[key];
      const day = new Date(`${key}T00:00:00`);
      if (day.getTime() !== compare.getTime()) break;
      if (log.consumedMl < mlGoal() * 0.8) break;
      streak += 1;
      compare.setDate(compare.getDate() - 1);
    }
    return streak;
  }

  function formatSyncedAt(): string {
    const synced = localStorage.getItem(STORAGE.cloudSyncedAt);
    if (!synced) return "";
    return synced;
  }

  function renderModeTabs(): void {
    const tabs = [
      { id: "dashboard", label: t("dashboard") },
      { id: "plan", label: t("plan") },
      { id: "benefits", label: t("benefits") }
    ];
    $("modeTabs").innerHTML = tabs.map((tab) => `<button class="tab-btn ${state.mode === tab.id ? "active" : ""}" type="button" data-mode="${tab.id}">${tab.label}</button>`).join("");
    document.querySelectorAll<HTMLElement>(".tool-view").forEach((view) => {
      view.classList.toggle("active", view.id === `view-${state.mode}`);
    });
  }

  function syncAuthUi(): void {
    const authStateText = $("authStateText");
    const authBtn = $("authBtn") as HTMLButtonElement;
    if (state.authUser) {
      authStateText.textContent = `${t("authSignedAs")} ${state.authUser.displayName || state.authUser.email || "User"}`;
      authBtn.textContent = t("authSignOut") as string;
    } else {
      authStateText.textContent = t("authLoggedOut") as string;
      authBtn.textContent = t("authSignIn") as string;
    }
  }

  function applyText(): void {
    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n as keyof typeof UI_COPY.hi | undefined;
      if (!key) return;
      const value = UI_COPY[state.lang][key];
      if (typeof value === "string") node.textContent = value;
    });
    $("langHiBtn").classList.toggle("active", state.lang === "hi");
    $("langEnBtn").classList.toggle("active", state.lang === "en");
    syncAuthUi();
  }

  function setTheme(themePreference: string, persist = true): void {
    const resolved = resolveTheme(themePreference);
    state.theme = resolved;
    document.body.dataset.theme = resolved;
    if (persist) {
      localStorage.setItem(STORAGE.theme, resolved);
      localStorage.setItem(STORAGE.familyTheme, resolved === "dawn" ? "light" : "dark");
      localStorage.setItem(STORAGE.familyThemeMode, resolved === "dawn" ? "light" : "dark");
    }
  }

  function setLanguage(lang: Lang): void {
    state.lang = lang;
    localStorage.setItem(STORAGE.lang, lang);
    document.documentElement.lang = lang;
    renderEverything();
  }

  function renderHero(): void {
    $("heroBadges").innerHTML = ["Baseline goal", "Open-app reminders", "Cloud-ready", "Daily streak"].map((item) => `<span class="hero-badge">${item}</span>`).join("");
    $("goalHeadline").textContent = state.profile.sex === "male" ? (t("male") as string) : (t("female") as string);
    $("goalValue").textContent = `${mlGoal()} ml`;
    $("goalMeta").textContent = (t("goalMeta") as (value: string) => string)(cupsForGoal());
    const streak = streakDays();
    $("streakHeadline").textContent = (t("streakHeadline") as (value: string) => string)(String(streak));
    $("streakMeta").textContent = (t("streakMeta") as (value: string) => string)(String(streak));
  }

  function getGapDays(): number {
    const lastOpen = localStorage.getItem(STORAGE.lastOpen);
    if (!lastOpen) return 0;
    const start = new Date(lastOpen);
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.max(Math.round((now.getTime() - start.getTime()) / 86400000), 0);
  }

  function renderDashboard(): void {
    const log = ensureTodayLog();
    const progress = Math.min(log.consumedMl / mlGoal(), 1);
    $("hydrationRing").setAttribute("style", `background: conic-gradient(from 180deg, var(--accent) ${Math.round(progress * 360)}deg, rgba(255,255,255,0.12) 0deg);`);
    $("consumedValue").textContent = `${log.consumedMl} ml`;
    $("remainingValue").textContent = (t("remainingLabel") as (value: string) => string)(`${Math.max(mlGoal() - log.consumedMl, 0)} ml`);

    const slots = scheduledSlots();
    const current = parseTime(nowTime());
    const nextSlot = slots.find((slot) => slot > current);
    const paceTarget = Math.round((mlGoal() / Math.max(slots.length, 1)) * log.entries.length);
    const paceText = log.consumedMl > paceTarget + 250 ? (t("paceGreat") as string) : log.consumedMl >= paceTarget ? (t("paceGood") as string) : (t("paceSlow") as string);

    $("dailyStats").innerHTML = `
      <div class="detail-card"><strong>${Math.ceil(Math.max(mlGoal() - log.consumedMl, 0) / state.profile.cupMl)}</strong><div>${t("cupsLeft")}</div></div>
      <div class="detail-card"><strong>${nextSlot ? formatTime(nextSlot) : (t("noReminderLeft") as string)}</strong><div>${t("nextSip")}</div></div>
      <div class="detail-card"><strong>${paceText}</strong><div>${t("pace")}</div></div>
    `;

    $("timelineList").innerHTML = slots.map((slot) => `
      <div class="timeline-item">
        <strong>${formatTime(slot)}</strong>
        <small>${log.notifiedSlots.includes(String(slot)) ? t("slotDone") : t("slotPending")}</small>
      </div>
    `).join("");

    const gapDays = getGapDays();
    const catchupVisible = gapDays > 0 && localStorage.getItem(STORAGE.catchupSeen) !== todayKey();
    $("catchupBanner").classList.toggle("hidden", !catchupVisible);
    $("catchupMeta").textContent = (t("catchupMeta") as (days: string) => string)(String(gapDays));
  }

  function renderLogs(): void {
    const log = ensureTodayLog();
    if (!log.entries.length) {
      $("logList").innerHTML = `<div class="history-empty">${t("logEmpty")}</div>`;
      return;
    }
    $("logList").innerHTML = [...log.entries].reverse().map((entry) => `
      <div class="history-item">
        <strong>+${entry.amount} ml</strong>
        <small>${entry.time}</small>
      </div>
    `).join("");
  }

  function renderPlan(): void {
    selectEl("sexSelect").value = state.profile.sex;
    inputEl("wakeInput").value = state.profile.wake;
    inputEl("sleepInput").value = state.profile.sleep;
    selectEl("intervalSelect").value = String(state.profile.intervalHours);
    inputEl("cupInput").value = String(state.profile.cupMl);
    $("guidelineText").textContent = state.profile.sex === "male" ? (t("guidelineMale") as string) : (t("guidelineFemale") as string);
    inputEl("reminderTime").value = state.reminderStart;
  }

  function renderBenefits(): void {
    $("benefitGrid").innerHTML = BENEFITS[state.lang].map((item) => `
      <div class="detail-card"><strong>${item.title}</strong><div>${item.text}</div></div>
    `).join("");
    $("cloudHeadline").textContent = state.authUser ? (t("cloudUser") as string) : (t("cloudReady") as string);
    $("cloudMeta").textContent = state.authUser && formatSyncedAt()
      ? (t("cloudSavedAt") as (value: string) => string)(formatSyncedAt())
      : (t("guidelineNote") as string);
  }

  function renderProfileSummary(): void {
    $("profileSummary").innerHTML = `
      <div class="stack-row"><span>${t("summaryGoal")}</span><strong>${mlGoal()} ml</strong></div>
      <div class="stack-row"><span>${t("summaryWindow")}</span><strong>${state.profile.wake} - ${state.profile.sleep}</strong></div>
      <div class="stack-row"><span>${t("summaryInterval")}</span><strong>${state.profile.intervalHours}h</strong></div>
      <div class="stack-row"><span>${t("summaryCup")}</span><strong>${state.profile.cupMl} ml</strong></div>
    `;
  }

  function renderEverything(): void {
    applyText();
    renderModeTabs();
    renderHero();
    renderDashboard();
    renderLogs();
    renderPlan();
    renderBenefits();
    renderProfileSummary();
  }

  function addWater(amount: number): void {
    const log = ensureTodayLog();
    log.consumedMl += amount;
    log.entries.push({ time: nowTime(), amount, timestamp: new Date().toISOString() });
    localStorage.removeItem(STORAGE.reminderLastPing);
    saveLocalState();
    renderEverything();
    queueCloudSave();
  }

  function undoLast(): void {
    const log = ensureTodayLog();
    const last = log.entries.pop();
    if (!last) return;
    log.consumedMl = Math.max(log.consumedMl - last.amount, 0);
    saveLocalState();
    renderEverything();
    queueCloudSave();
  }

  function queueCloudSave(): void {
    if (!state.authUser || !firebaseContext.db || !firebaseContext.sdk) return;
    if (firebaseContext.saveTimer) window.clearTimeout(firebaseContext.saveTimer);
    firebaseContext.saveTimer = window.setTimeout(() => { void saveCloudState(); }, 700);
  }

  async function saveCloudState(): Promise<void> {
    if (!state.authUser || !firebaseContext.db || !firebaseContext.sdk) return;
    try {
      const { doc, setDoc } = firebaseContext.sdk as {
        doc: (...args: unknown[]) => unknown;
        setDoc: (ref: unknown, value: Record<string, unknown>, options: { merge: boolean }) => Promise<void>;
      };
      const ref = doc(firebaseContext.db, "users", state.authUser.uid, "apps", "jal-sathi", "state", "default");
      await setDoc(ref, {
        profile: state.profile,
        logs: state.logs,
        reminderStart: state.reminderStart,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      localStorage.setItem(STORAGE.cloudSyncedAt, new Date().toLocaleString());
      renderBenefits();
    } catch (error) {
      console.error("Cloud save failed", error);
    }
  }

  async function loadCloudState(): Promise<void> {
    if (!state.authUser || !firebaseContext.db || !firebaseContext.sdk) return;
    try {
      const { doc, getDoc } = firebaseContext.sdk as {
        doc: (...args: unknown[]) => unknown;
        getDoc: (ref: unknown) => Promise<{ exists: () => boolean; data: () => Record<string, unknown> }>;
      };
      const ref = doc(firebaseContext.db, "users", state.authUser.uid, "apps", "jal-sathi", "state", "default");
      const snapshot = await getDoc(ref);
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      if (data.profile) state.profile = data.profile as Profile;
      if (data.logs) state.logs = data.logs as LogsMap;
      if (typeof data.reminderStart === "string") state.reminderStart = data.reminderStart;
      renderEverything();
    } catch (error) {
      console.error("Cloud load failed", error);
    }
  }

  async function initFamilyAuth(): Promise<void> {
    try {
      const firebaseApp = await import("https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js");
      const firebaseAuth = await import("https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js");
      const firebaseStore = await import("https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js");
      const app = firebaseApp.initializeApp(FIREBASE_CONFIG, "jal-sathi-family-app");
      const auth = firebaseAuth.getAuth(app);
      const provider = new firebaseAuth.GoogleAuthProvider();
      const db = firebaseStore.getFirestore(app);
      firebaseContext.auth = auth;
      firebaseContext.db = db;
      firebaseContext.sdk = { ...firebaseAuth, ...firebaseStore };

      ($("authBtn") as HTMLButtonElement).addEventListener("click", async () => {
        if (state.authUser) {
          await firebaseAuth.signOut(auth);
        } else {
          await firebaseAuth.signInWithPopup(auth, provider);
        }
      });

      firebaseAuth.onAuthStateChanged(auth, async (user) => {
        state.authUser = user ? { uid: user.uid, displayName: user.displayName, email: user.email } : null;
        syncAuthUi();
        renderBenefits();
        if (state.authUser) {
          await loadCloudState();
          queueCloudSave();
        }
      });
    } catch (error) {
      console.error("Family auth unavailable", error);
    }
  }

  async function saveReminder(): Promise<void> {
    state.reminderStart = inputEl("reminderTime").value || state.profile.wake;
    localStorage.setItem(STORAGE.reminderTime, state.reminderStart);
    localStorage.setItem(STORAGE.reminderEnabled, "true");
    const supportsNotification = "Notification" in window;
    if (supportsNotification && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error("Notification permission failed", error);
      }
    }
    $("reminderStatus").textContent = supportsNotification && Notification.permission === "granted"
      ? (t("reminderSaved") as (time: string) => string)(state.reminderStart)
      : (t("reminderBlocked") as string);
  }

  function beep(): void {
    try {
      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.frequency.value = 740;
      gain.gain.value = 0.02;
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.15);
    } catch {
      // no-op
    }
  }

  function latestDrinkDate(log: DailyLog): Date | null {
    const latest = log.entries[log.entries.length - 1];
    if (!latest) return null;
    if (latest.timestamp) {
      const parsed = new Date(latest.timestamp);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    const fallback = new Date();
    const [hours, minutes] = latest.time.split(":").map((part) => Number(part));
    fallback.setHours(hours || 0, minutes || 0, 0, 0);
    return fallback;
  }

  async function maybeNotify(): Promise<void> {
    if (localStorage.getItem(STORAGE.reminderEnabled) !== "true") return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (!("serviceWorker" in navigator)) return;

    const log = ensureTodayLog();
    const currentMinutes = parseTime(nowTime());
    const currentSlot = [...scheduledSlots()].reverse().find((slot) => slot <= currentMinutes);
    if (typeof currentSlot !== "number") return;

    const latestDrink = latestDrinkDate(log);
    const latestDrinkMinutes = latestDrink ? latestDrink.getHours() * 60 + latestDrink.getMinutes() : -1;
    if (latestDrinkMinutes >= currentSlot) {
      localStorage.removeItem(STORAGE.reminderLastPing);
      return;
    }

    const lastPing = localStorage.getItem(STORAGE.reminderLastPing);
    if (lastPing) {
      const elapsedMinutes = (Date.now() - new Date(lastPing).getTime()) / 60000;
      if (elapsedMinutes < 10) return;
    }

    if (!log.notifiedSlots.includes(String(currentSlot))) {
      log.notifiedSlots.push(String(currentSlot));
      saveLocalState();
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification("Jal Sathi", {
        body: state.lang === "hi"
          ? "Pani peene ka time ho gaya. Jab tak sip log nahi karte, Jal Sathi yaad dilata rahega."
          : "It is time to drink water. Jal Sathi will keep reminding you until you log a sip."
      });
    }
    localStorage.setItem(STORAGE.reminderLastPing, new Date().toISOString());
    beep();
    renderDashboard();
  }

  function startReminderLoop(): void {
    if (reminderPoll) window.clearInterval(reminderPoll);
    reminderPoll = window.setInterval(() => { void maybeNotify(); }, 60000);
  }

  function initInstallFlow(): void {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      state.deferredPrompt = event as BeforeInstallPromptEvent;
    });
    window.addEventListener("appinstalled", () => {
      localStorage.setItem(STORAGE.installMarker, "true");
      state.deferredPrompt = null;
    });
    $("installBtn").addEventListener("click", async () => {
      if (!state.deferredPrompt) {
        alert(t("installUnavailable") as string);
        return;
      }
      await state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
    });
  }

  async function registerServiceWorker(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("./sw.js");
      } catch (error) {
        console.error("Service worker registration failed", error);
      }
    }
  }

  function bindEvents(): void {
    const openDrawer = () => {
      $("drawer").classList.add("open");
      $("drawer").setAttribute("aria-hidden", "false");
    };
    const closeDrawer = () => {
      $("drawer").classList.remove("open");
      $("drawer").setAttribute("aria-hidden", "true");
    };

    $("openDrawerBtn").addEventListener("click", openDrawer);
    $("closeDrawerBtn").addEventListener("click", closeDrawer);
    $("drawer").addEventListener("click", (event) => {
      if (event.target === $("drawer")) closeDrawer();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDrawer();
    });
    document.querySelectorAll<HTMLAnchorElement>("#drawer a").forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });
    $("themeBtn").addEventListener("click", () => setTheme(state.theme === "night" ? "dawn" : "night"));
    $("langHiBtn").addEventListener("click", () => setLanguage("hi"));
    $("langEnBtn").addEventListener("click", () => setLanguage("en"));
    $("saveReminderBtn").addEventListener("click", () => { void saveReminder(); });

    $("modeTabs").addEventListener("click", (event) => {
      const mode = (event.target as HTMLElement).dataset.mode as Mode | undefined;
      if (!mode) return;
      state.mode = mode;
      renderModeTabs();
    });

    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const waterAmount = target.dataset.addWater;
      if (waterAmount && Number.isFinite(Number(waterAmount)) && Number(waterAmount) > 0) {
        addWater(Number(waterAmount));
      }
    });

    $("undoLogBtn").addEventListener("click", undoLast);
    $("dismissCatchupBtn").addEventListener("click", () => {
      localStorage.setItem(STORAGE.catchupSeen, todayKey());
      renderDashboard();
    });

    $("savePlanBtn").addEventListener("click", () => {
      state.profile = {
        sex: selectEl("sexSelect").value as Sex,
        wake: inputEl("wakeInput").value || "07:00",
        sleep: inputEl("sleepInput").value || "22:30",
        intervalHours: Number(selectEl("intervalSelect").value) as 1 | 2 | 3,
        cupMl: Math.max(Number(inputEl("cupInput").value || 250), 100)
      };
      state.reminderStart = state.profile.wake;
      saveLocalState();
      $("reminderStatus").textContent = t("planSaved") as string;
      renderEverything();
      queueCloudSave();
    });

    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE.familyTheme || event.key === STORAGE.familyThemeMode) {
        setTheme(getThemePreference(), false);
      }
    });
  }

  void (async function init(): Promise<void> {
    document.body.dataset.theme = state.theme;
    await registerServiceWorker();
    initInstallFlow();
    bindEvents();
    await initFamilyAuth();
    renderEverything();
    startReminderLoop();
    localStorage.setItem(STORAGE.lastOpen, todayKey());
  })();
})();
