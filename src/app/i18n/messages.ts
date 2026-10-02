export type Locale = "fr" | "en";

export const LOCALE_STORAGE_KEY = "mission2027-locale";

export type MessageTree = {
  brand: string;
  brandSub: string;
  quickTest: string;
  quickTestHint: string;
  logout: string;
  nav: {
    cockpit: string;
    today: string;
    diagnostic: string;
    readiness: string;
    analytics: string;
    remediation: string;
    data: string;
  };
  cockpit: {
    title: string;
    target: string;
    todaysFocus: string;
    overallReadiness: string;
    domainReadiness: string;
    needsAttention: string;
    evidence: string;
    readinessTrend: string;
    proofs: string;
    pipeline: string;
    thisWeek: string;
    viewAll: string;
    analytics: string;
    weeklyPrep: string;
    allClear: string;
    noSignals: string;
  };
};

const en: MessageTree = {
  brand: "Mission 2027",
  brandSub: "Control Center",
  quickTest: "Quick test",
  quickTestHint: "~15 min · Light Diagnostic",
  logout: "Log out",
  nav: {
    cockpit: "Cockpit",
    today: "Today",
    diagnostic: "Diagnostic 360",
    readiness: "Readiness",
    analytics: "Analytics",
    remediation: "Remediation",
    data: "Data",
  },
  cockpit: {
    title: "Engineering Readiness Cockpit",
    target: "Target",
    todaysFocus: "Today's focus",
    overallReadiness: "Overall readiness",
    domainReadiness: "Domain readiness",
    needsAttention: "Needs attention",
    evidence: "Evidence",
    readinessTrend: "Readiness trend",
    proofs: "Proofs",
    pipeline: "Pipeline",
    thisWeek: "This week",
    viewAll: "View all →",
    analytics: "Analytics →",
    weeklyPrep: "Weekly prep",
    allClear: "All clear",
    noSignals: "No urgent signals right now.",
  },
};

const fr: MessageTree = {
  brand: "Mission 2027",
  brandSub: "Centre de contrôle",
  quickTest: "Test rapide",
  quickTestHint: "~15 min · Light Diagnostic",
  logout: "Déconnexion",
  nav: {
    cockpit: "Cockpit",
    today: "Aujourd'hui",
    diagnostic: "Diagnostic 360",
    readiness: "Readiness",
    analytics: "Analytics",
    remediation: "Remédiation",
    data: "Données",
  },
  cockpit: {
    title: "Cockpit Engineering Readiness",
    target: "Cible",
    todaysFocus: "Focus du jour",
    overallReadiness: "Readiness globale",
    domainReadiness: "Readiness par domaine",
    needsAttention: "À surveiller",
    evidence: "Evidence",
    readinessTrend: "Tendance readiness",
    proofs: "Preuves",
    pipeline: "Pipeline",
    thisWeek: "Cette semaine",
    viewAll: "Tout voir →",
    analytics: "Analytics →",
    weeklyPrep: "Préparation hebdo",
    allClear: "RAS",
    noSignals: "Aucun signal urgent pour l'instant.",
  },
};

export const messages: Record<Locale, MessageTree> = { en, fr };
