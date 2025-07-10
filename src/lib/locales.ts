
export interface LocaleStrings {
  langCode: 'en' | 'zh-CN' | 'ja';
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
  // Meditate Page
  meditateNow: string;
  meditateRepeat: string;
  meditateDecision: string;
  meditateNote: string;
  meditateReady: string;
  meditateStart: string;
  // Landing Page
  landingTitle: string;
  landingDescription: string;
  landingExamples: string;
  landingButton: string;
  // Cus Page
  cusPageTitle: string;
  cusPageDescription: string;
  cusInputCardTitle: string;
  cusInputCardDescription: string;
  cusDateLabel: string;
  cusDatePlaceholder: string;
  cusShichenLabel: string;
  cusShichenPlaceholder: string;
  cusCalculateButton: string;
  cusErrorDateShichen: string;

  // Source Code Purchase Card
  sourceCodeCardTitle: string;
  sourceCodeCardDescription: string;
  
  // VIP Success Page
  vipSuccessTitle: string;
  vipSuccessDescription: string;
  vipLinkTitlePin: string;
  vipLinkTitlePush: string;
  vipLinkTitleCus: string;
  vipContactInfo: string;
  vipUrlCopiedTitle: string;
  vipUrlCopiedDescription: string;
  vipUrlCopyErrorTitle: string;
  vipUrlCopyErrorDescription: string;
}

export const translations: Record<string, LocaleStrings> = {
  "en": {
    langCode: "en",
    appTitle: "Temporal Harmony Oracle",
    appDescription: "Discover insights from the confluence of time and tradition. Your local time is used to calculate your momentary oracle.",
    calculatingDestiny: "Unveiling the Oracle of Time...",
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
    languageNameChinese: "Chinese",
    meditateNow: "Now",
    meditateRepeat: "Silently repeat three times",
    meditateDecision: "The matter you need a decision on",
    meditateNote: "Note: The same matter can only be divined once",
    meditateReady: "When you are ready, please click",
    meditateStart: "Start",
    landingTitle: "Finger-Pinching Divination",
    landingDescription: "Finger-pinching divination (掐指一算, Qiā Zhǐ Yī Suàn) is the highest level of predictive science in the I Ching. Ancient Chinese used information such as 'Tiangan' (天干), 'Dizhi' (地支), 'Bagua' (八卦), and more, combined with the time of the inquiry, to deduce the good or bad fortune of matters.",
    landingExamples: "Topics for divination include, but are not limited to:<br/>How to pursue wealth? Where did the lost item go?<br/>Where to find the person? How will official matters proceed?<br/>Will health be restored? Is the marriage compatible?<br/>How will the plan unfold? <span class=\"font-semibold text-foreground\">Get an immediate result!</span>",
    landingButton: "Start Divination",
    cusPageTitle: "Custom Oracle",
    cusPageDescription: "Select a date and Shichen to look back at the past or peer into the future.",
    cusInputCardTitle: "Enter Your Divination Time",
    cusInputCardDescription: "Please select a Gregorian date and Shichen.",
    cusDateLabel: "Gregorian Date",
    cusDatePlaceholder: "Pick a date",
    cusShichenLabel: "Shichen (时辰)",
    cusShichenPlaceholder: "Select a Shichen",
    cusCalculateButton: "Calculate Oracle",
    cusErrorDateShichen: "Please select a complete date and Shichen.",
    sourceCodeCardTitle: "Get This App's Source Code",
    sourceCodeCardDescription: "The source code for this site is available for purchase at $399 per set. You can pay via the link below. After payment, please save your receipt and contact 94722424@qq.com to receive the download link.",
    vipSuccessTitle: "Please Remember These Three URLs",
    vipSuccessDescription: "We recommend bookmarking them in your browser.",
    vipLinkTitlePin: "Finger-Pinching Oracle (Pin)",
    vipLinkTitlePush: "Divine Finger-Pinching Oracle",
    vipLinkTitleCus: "Custom Time Oracle",
    vipContactInfo: "If you encounter access issues or the page expires, please contact 94722424@qq.com",
    vipUrlCopiedTitle: "Copied!",
    vipUrlCopiedDescription: "The URL has been copied to your clipboard.",
    vipUrlCopyErrorTitle: "Copy Failed",
    vipUrlCopyErrorDescription: "Could not copy the URL. Please copy it manually.",
  },
  "zh-CN": {
    langCode: "zh-CN",
    appTitle: "时辰和谐神谕",
    appDescription: "从时间与传统的交汇中发现深刻见解。您的本地时间用于计算您当下的神谕。",
    calculatingDestiny: "正在开启时间的神谕...",
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
    languageNameChinese: "中文",
    meditateNow: "现在",
    meditateRepeat: "请在心里默念三遍",
    meditateDecision: "想要测算的事",
    meditateNote: "注意：同一件事，只能测一次",
    meditateReady: "准备好了, 请点",
    meditateStart: "开始",
    landingTitle: "掐指一算",
    landingDescription: "掐指一算是易经中最高层次的预测学，中国古人根据“天干”“地支”“八卦”“八门”“九宫”“九星”“九神”等信息，结合问卦时间或者事发时间，推算出事情的吉凶祸福。",
    landingExamples: "可以测算的包括但不限于：<br />求财如何行？失物何处去？<br />寻人去何方？官事欲如何？<br />疾病安与康？姻缘合不合？<br />谋事参几何？ <span class=\"font-semibold text-foreground\">当下有结果！</span>",
    landingButton: "立即测算",
    cusPageTitle: "自定义测算",
    cusPageDescription: "选择一个日期和时辰，回顾过去或展望未来。",
    cusInputCardTitle: "输入您的测算时间",
    cusInputCardDescription: "请选择公历日期和时辰",
    cusDateLabel: "公历日期",
    cusDatePlaceholder: "选择一个日期",
    cusShichenLabel: "时辰",
    cusShichenPlaceholder: "请选择一个时辰",
    cusCalculateButton: "开始测算",
    cusErrorDateShichen: "请选择完整的日期和时辰。",
    sourceCodeCardTitle: "获取本站源码",
    sourceCodeCardDescription: "本站源码可开源，价格为399美元一套。您可以通过下面链接付费，付费后请保存付费记录，联系94722424@qq.com 提供下载地址。",
    vipSuccessTitle: "请您牢记这三个网址",
    vipSuccessDescription: "建议添加到您的浏览器书签页收藏",
    vipLinkTitlePin: "掐指一算 (Pin)",
    vipLinkTitlePush: "掐指神算",
    vipLinkTitleCus: "自定义时间测算",
    vipContactInfo: "如果出现无法访问，或者网页过期问题，请联系微信81324338",
    vipUrlCopiedTitle: "已复制!",
    vipUrlCopiedDescription: "网址已成功复制到您的剪贴板。",
    vipUrlCopyErrorTitle: "复制失败",
    vipUrlCopyErrorDescription: "无法复制网址，请手动复制。",
  },
  "ja": {
    langCode: "ja",
    appTitle: "[JP] Temporal Harmony Oracle",
    appDescription: "[JP] Discover insights from the confluence of time and tradition. Your local time is used to calculate your momentary oracle.",
    calculatingDestiny: "[JP] Unveiling the Oracle of Time...",
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
    languageNameChinese: "[JP] Chinese",
    meditateNow: "[JP] Now",
    meditateRepeat: "[JP] Silently repeat three times",
    meditateDecision: "[JP] The matter you need a decision on",
    meditateNote: "[JP] Note: The same matter can only be divined once",
    meditateReady: "[JP] When you are ready, please click",
    meditateStart: "[JP] Start",
    landingTitle: "[JP] Finger-Pinching Divination",
    landingDescription: "[JP] Finger-pinching divination (掐指一算, Qiā Zhǐ Yī Suàn) is the highest level of predictive science in the I Ching. Ancient Chinese used information such as 'Tiangan' (天干), 'Dizhi' (地支), 'Bagua' (八卦), and more, combined with the time of the inquiry, to deduce the good or bad fortune of matters.",
    landingExamples: "[JP] Topics for divination include, but are not limited to:<br/>How to pursue wealth? Where did the lost item go?<br/>Where to find the person? How will official matters proceed?<br/>Will health be restored? Is the marriage compatible?<br/>How will the plan unfold? <span class=\"font-semibold text-foreground\">Get an immediate result!</span>",
    landingButton: "[JP] Start Divination",
    cusPageTitle: "[JP] Custom Oracle",
    cusPageDescription: "[JP] Select a date and Shichen to look back at the past or peer into the future.",
    cusInputCardTitle: "[JP] Enter Your Divination Time",
    cusInputCardDescription: "[JP] Please select a Gregorian date and Shichen.",
    cusDateLabel: "[JP] Gregorian Date",
    cusDatePlaceholder: "[JP] Pick a date",
    cusShichenLabel: "[JP] Shichen (时辰)",
    cusShichenPlaceholder: "[JP] Select a Shichen",
    cusCalculateButton: "[JP] Calculate Oracle",
    cusErrorDateShichen: "[JP] Please select a complete date and Shichen.",
    sourceCodeCardTitle: "[JP] Get This App's Source Code",
    sourceCodeCardDescription: "[JP] The source code for this site is available for purchase at $399 per set. You can pay via the link below. After payment, please save your receipt and contact 94722424@qq.com to receive the download link.",
    vipSuccessTitle: "[JP] Please Remember These Three URLs",
    vipSuccessDescription: "[JP] We recommend bookmarking them in your browser.",
    vipLinkTitlePin: "[JP] Finger-Pinching Oracle (Pin)",
    vipLinkTitlePush: "[JP] Divine Finger-Pinching Oracle",
    vipLinkTitleCus: "[JP] Custom Time Oracle",
    vipContactInfo: "[JP] If you encounter access issues or the page expires, please contact 94722424@qq.com",
    vipUrlCopiedTitle: "[JP] Copied!",
    vipUrlCopiedDescription: "[JP] The URL has been copied to your clipboard.",
    vipUrlCopyErrorTitle: "[JP] Copy Failed",
    vipUrlCopyErrorDescription: "[JP] Could not copy the URL. Please copy it manually.",
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
