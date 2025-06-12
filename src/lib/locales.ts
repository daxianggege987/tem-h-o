
export interface LocaleStrings {
  appTitle: string;
  appDescription: string;
  calculatingDestiny: string;
  calculationErrorTitle: string;
  calculationErrorText: string;
  temporalCoordinatesTitle: string;
  temporalCoordinatesDescription: string;
  currentTimeGregorianLabel: string;
  lunarMonthLabel: string;
  lunarMonthUnit: string;
  lunarDayLabel: string;
  lunarDayUnit: string;
  shichenLabel: string;
  shichenTimeUnit: string;
  lunarCalendarNote: string;
  firstOracleTitle: string;
  firstOracleFormula: string;
  secondOracleTitle: string;
  secondOracleFormula: string;
  singlePalaceInterpretationTitle: string;
  doublePalaceInterpretationTitle: string;
  meaningLabel: string;
  adviceLabel: string;
  poemLabel: string;
  explanationLabel: string;
  interpretationsPendingTitle: string;
  interpretationMissingText: (oracleName: string, type: 'single' | 'double', secondOracleName?: string, lang?: string) => string;
  addInterpretationsNote: string;
  languageNameChinese: string;
}

export const translations: Record<string, LocaleStrings> = {
  "en": {
    appTitle: "Temporal Harmony Oracle",
    appDescription: "Discover insights from the confluence of time and tradition. Your local time is used to calculate your momentary oracle.",
    calculatingDestiny: "Calculating your destiny...",
    calculationErrorTitle: "Calculation Error",
    calculationErrorText: "Could not retrieve oracle data. Please try refreshing the page.",
    temporalCoordinatesTitle: "Your Temporal Coordinates",
    temporalCoordinatesDescription: "Based on your current local time.",
    currentTimeGregorianLabel: "Current Time (Gregorian):",
    lunarMonthLabel: "Lunar Month",
    lunarMonthUnit: "Month",
    lunarDayLabel: "Lunar Day",
    lunarDayUnit: "Day",
    shichenLabel: "Shichen (时辰)",
    shichenTimeUnit: "Hour",
    lunarCalendarNote: "Note: Lunar calendar conversion is a simplified mock for demonstration purposes.",
    firstOracleTitle: "First Oracle (Single Palace)",
    firstOracleFormula: "(Lunar Month + Lunar Day + Shichen - 2) mod 6",
    secondOracleTitle: "Second Oracle (for Double Palace)",
    secondOracleFormula: "(Lunar Day + Shichen - 1) mod 6",
    singlePalaceInterpretationTitle: "Single Palace Interpretation",
    doublePalaceInterpretationTitle: "Double Palace Interpretation",
    meaningLabel: "Meaning:",
    adviceLabel: "Advice (斷曰):",
    poemLabel: "Poem (詩曰):",
    explanationLabel: "Explanation (解):",
    interpretationsPendingTitle: "Interpretations Pending",
    interpretationMissingText: (oracleName, type, secondOracleName, lang = 'en') => 
      type === 'single' 
        ? `Interpretation for ${oracleName} (single) in ${lang.toUpperCase()} is not yet defined.`
        : `Interpretation for ${oracleName} combined with ${secondOracleName} (double) in ${lang.toUpperCase()} is not yet defined.`,
    addInterpretationsNote: "Please add them to src/lib/interpretations.ts to see the detailed explanations.",
    languageNameChinese: "Chinese"
  },
  "zh-CN": {
    appTitle: "时辰和谐神谕",
    appDescription: "从时间与传统的交汇中发现深刻见解。您的本地时间用于计算您当下的神谕。",
    calculatingDestiny: "正在计算您的命运...",
    calculationErrorTitle: "计算错误",
    calculationErrorText: "无法获取神谕数据。请尝试刷新页面。",
    temporalCoordinatesTitle: "您的时间坐标",
    temporalCoordinatesDescription: "基于您当前的本地时间。",
    currentTimeGregorianLabel: "当前时间 (公历):",
    lunarMonthLabel: "农历月份",
    lunarMonthUnit: "月",
    lunarDayLabel: "农历日期",
    lunarDayUnit: "日",
    shichenLabel: "时辰",
    shichenTimeUnit: "时",
    lunarCalendarNote: "注意：农历转换为演示目的简化模拟。",
    firstOracleTitle: "第一神谕 (单宫)",
    firstOracleFormula: "(农历月 + 农历日 + 时辰 - 2) % 6",
    secondOracleTitle: "第二神谕 (用于双宫)",
    secondOracleFormula: "(农历日 + 时辰 - 1) % 6",
    singlePalaceInterpretationTitle: "单宫解说",
    doublePalaceInterpretationTitle: "双宫解说",
    meaningLabel: "含义:",
    adviceLabel: "断曰:",
    poemLabel: "诗曰:",
    explanationLabel: "解:",
    interpretationsPendingTitle: "解说待定",
    interpretationMissingText: (oracleName, type, secondOracleName, lang = 'zh-CN') =>
      type === 'single'
        ? `“${oracleName}” (单宫) 的${lang === 'zh-CN' ? '' : lang.toUpperCase()}解说尚未定义。`
        : `“${oracleName}” 与 “${secondOracleName}” (双宫) 的${lang === 'zh-CN' ? '' : lang.toUpperCase()}组合解说尚未定义。`,
    addInterpretationsNote: "请将其添加到 src/lib/interpretations.ts 文件中以查看详细解说。",
    languageNameChinese: "中文"
  },
  "ja": {
    appTitle: "[JP] Temporal Harmony Oracle",
    appDescription: "[JP] Discover insights from the confluence of time and tradition. Your local time is used to calculate your momentary oracle.",
    calculatingDestiny: "[JP] Calculating your destiny...",
    calculationErrorTitle: "[JP] Calculation Error",
    calculationErrorText: "[JP] Could not retrieve oracle data. Please try refreshing the page.",
    temporalCoordinatesTitle: "[JP] Your Temporal Coordinates",
    temporalCoordinatesDescription: "[JP] Based on your current local time.",
    currentTimeGregorianLabel: "[JP] Current Time (Gregorian):",
    lunarMonthLabel: "[JP] Lunar Month",
    lunarMonthUnit: "[JP] Month",
    lunarDayLabel: "[JP] Lunar Day",
    lunarDayUnit: "[JP] Day",
    shichenLabel: "[JP] Shichen (时辰)",
    shichenTimeUnit: "[JP] Hour",
    lunarCalendarNote: "[JP] Note: Lunar calendar conversion is a simplified mock for demonstration purposes.",
    firstOracleTitle: "[JP] First Oracle (Single Palace)",
    firstOracleFormula: "[JP] (Lunar Month + Lunar Day + Shichen - 2) mod 6",
    secondOracleTitle: "[JP] Second Oracle (for Double Palace)",
    secondOracleFormula: "[JP] (Lunar Day + Shichen - 1) mod 6",
    singlePalaceInterpretationTitle: "[JP] Single Palace Interpretation",
    doublePalaceInterpretationTitle: "[JP] Double Palace Interpretation",
    meaningLabel: "[JP] Meaning:",
    adviceLabel: "[JP] Advice (斷曰):",
    poemLabel: "[JP] Poem (詩曰):",
    explanationLabel: "[JP] Explanation (解):",
    interpretationsPendingTitle: "[JP] Interpretations Pending",
    interpretationMissingText: (oracleName, type, secondOracleName, lang = 'ja') => 
      type === 'single' 
        ? `[JP] Interpretation for ${oracleName} (single) in ${lang.toUpperCase()} is not yet defined.`
        : `[JP] Interpretation for ${oracleName} combined with ${secondOracleName} (double) in ${lang.toUpperCase()} is not yet defined.`,
    addInterpretationsNote: "[JP] Please add them to src/lib/interpretations.ts to see the detailed explanations.",
    languageNameChinese: "[JP] Chinese"
  }
};

const DEFAULT_LOCALE_KEY = 'en';

export function getLocaleStrings(lang: string): LocaleStrings {
  const languageCode = lang.toLowerCase();
  if (languageCode.startsWith('ja')) {
    return translations['ja'] || translations[DEFAULT_LOCALE_KEY];
  }
  if (languageCode.startsWith('zh')) {
    return translations['zh-CN'] || translations[DEFAULT_LOCALE_KEY];
  }
  if (languageCode.startsWith('en')) {
    return translations['en'] || translations[DEFAULT_LOCALE_KEY];
  }
  return translations[DEFAULT_LOCALE_KEY]; // Default fallback
}

    