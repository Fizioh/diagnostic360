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
  light: {
    loading: string;
    hubBack: string;
    title: string;
    subtitle: string;
    resume: string;
    restart: string;
    restartConfirm: string;
    start: string;
    difficultyMedium: string;
    difficultyHard: string;
    confidence: string;
    confidenceHint: string;
    next: string;
    pause: string;
    provisionalResults: string;
    completeTitle: string;
    overallLine: string;
    notValidated: string;
    domainBreakdown: string;
    strongest: string;
    weakest: string;
    calibration: string;
    calibrationCorrectHigh: string;
    calibrationCorrectLow: string;
    calibrationIncorrectHigh: string;
    calibrationIncorrectLow: string;
    highConfidenceIncorrect: string;
    conceptsNeeding: string;
    recommendedModules: string;
    openCockpit: string;
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
  light: {
    loading: "Loading…",
    hubBack: "← Diagnostic hub",
    title: "Light Diagnostic",
    subtitle: "Provisional baseline · {count} questions",
    resume: "Resume",
    restart: "Restart",
    restartConfirm: "Reset progress and start over?",
    start: "Start Light Diagnostic",
    difficultyMedium: "medium",
    difficultyHard: "hard",
    confidence: "Confidence",
    confidenceHint: "1 = guessing · 5 = certain",
    next: "Next",
    pause: "Pause",
    provisionalResults: "Provisional results",
    completeTitle: "Light Diagnostic complete",
    overallLine: "Overall provisional baseline:",
    notValidated: "not validated practical performance.",
    domainBreakdown: "Domain breakdown",
    strongest: "Strongest signals",
    weakest: "Weakest signals",
    calibration: "Confidence calibration",
    calibrationCorrectHigh: "Correct · high confidence",
    calibrationCorrectLow: "Correct · low confidence",
    calibrationIncorrectHigh: "Incorrect · high confidence",
    calibrationIncorrectLow: "Incorrect · low confidence",
    highConfidenceIncorrect: "High-confidence incorrect",
    conceptsNeeding: "Concepts needing deeper validation",
    recommendedModules: "Recommended Diagnostic 360 modules",
    openCockpit: "Open cockpit →",
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
  light: {
    loading: "Chargement…",
    hubBack: "← Hub diagnostic",
    title: "Light Diagnostic",
    subtitle: "Baseline provisionnelle · {count} questions",
    resume: "Reprendre",
    restart: "Recommencer",
    restartConfirm: "Réinitialiser la progression et recommencer ?",
    start: "Démarrer le Light Diagnostic",
    difficultyMedium: "moyen",
    difficultyHard: "difficile",
    confidence: "Confiance",
    confidenceHint: "1 = au hasard · 5 = certain",
    next: "Suivant",
    pause: "Pause",
    provisionalResults: "Résultats provisionnels",
    completeTitle: "Light Diagnostic terminé",
    overallLine: "Baseline provisionnelle globale :",
    notValidated: "— ce n'est pas une performance pratique validée.",
    domainBreakdown: "Détail par domaine",
    strongest: "Signaux les plus forts",
    weakest: "Signaux les plus faibles",
    calibration: "Calibration de confiance",
    calibrationCorrectHigh: "Correct · confiance élevée",
    calibrationCorrectLow: "Correct · confiance faible",
    calibrationIncorrectHigh: "Incorrect · confiance élevée",
    calibrationIncorrectLow: "Incorrect · confiance faible",
    highConfidenceIncorrect: "Erreurs à haute confiance",
    conceptsNeeding: "Concepts à valider en profondeur",
    recommendedModules: "Modules Diagnostic 360 recommandés",
    openCockpit: "Ouvrir le cockpit →",
  },
};

export const messages: Record<Locale, MessageTree> = { en, fr };
