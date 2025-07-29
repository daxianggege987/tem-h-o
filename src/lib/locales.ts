
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

  // Source Code Success Page
  sourceCodeSuccessTitle: string;
  sourceCodeSuccessInstructionTitle: string;
  sourceCodeSuccessInstructionBody: string;
  sourceCodeSuccessContactEmail: string;
  sourceCodeSuccessButton: string;

  // Prepare Page
  prepareSincere: string;
  prepareAffectResult: string;

  // Unlock Screen
  unlockFullReadingTitle: string;
  unlockIntro1: string;
  unlockIntro2: string;
  unlockLimitedOfferTitle: string;
  unlockLimitedOfferSubtitle: string;
  unlockOfferEnded: string;
  unlockPricePrefix: string;
  unlockBenefit1: string;
  unlockBenefit2: string;
  unlockBenefit3: string;
  unlockTipTitle: string;
  unlockTipContent: string;
  
  // WeChat Pay Mock
  wechatPayButton: string;
  wechatPayTitle: string;
  wechatPayDescription: string;
  wechatPaySuccessButton: string;

  // VIP Recommend Card
  vipRecommendTitle: string;
  vipRecommendDescription: string;
  vipRecommendReason: string;
  vipFeatureCustomTime: string;
  vipFeatureUnlimited: string;
  vipFeatureDirectAccess: string;
  vipFeatureAdFree: string;
  vipRecommendButton: string;
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
    meditateStart: "Start Divination",
    landingTitle: "Finger-Pinching Divination",
    landingDescription: "Finger-pinching divination (掐指一算) is a high-level predictive art from the I Ching. Ancient Chinese used information such as 'Tiangan' (天干), 'Dizhi' (地支), 'Bagua' (八卦), etc., combined with the time of inquiry, to deduce fortune.",
    landingExamples: "Topics for divination include, but are not limited to:<br/><br/>How to pursue wealth? Where did the lost item go?<br/>Where to find the person? How will official matters proceed?<br/>Will health be restored? Is the marriage compatible?<br/>How will the plan unfold? <span class=\"font-semibold text-foreground\">Get an immediate result!</span>",
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
    sourceCodeSuccessTitle: "Source Code Purchase Successful",
    sourceCodeSuccessInstructionTitle: "Instructions to Receive Your Source Code",
    sourceCodeSuccessInstructionBody: "Please provide your payment email, name, order ID, and the time of payment. Send a screenshot or text of this information to the following email address. After our staff confirms the details, we will send you the source code via email.",
    sourceCodeSuccessContactEmail: "94722424@qq.com",
    sourceCodeSuccessButton: "Return to VIP Page",
    prepareSincere: "Please be sincere and respectful",
    prepareAffectResult: "to avoid affecting the results",
    unlockFullReadingTitle: "Unlock Your Complete Reading",
    unlockIntro1: "Finger-Pinching Divination is a form of Liu Ren calculation, one of the ancient Chinese court divination arts. Liu Ren, along with Tai Yi and Qi Men Dun Jia, are known as the Three Arts. In time-based calculations, both Tai Yi and Qi Men Dun Jia refer to Liu Ren, making it the foremost of the Three Arts.",
    unlockIntro2: "The famous Chinese author Lu Xun was very skilled at finger-pinching divination. He once said, 'With much experience, one can know the consequences from the causes; my predictions are often proven true.'",
    unlockLimitedOfferTitle: "Limited-Time Offer",
    unlockLimitedOfferSubtitle: "The offer will expire after the countdown ends.",
    unlockOfferEnded: "Offer Ended",
    unlockPricePrefix: "Only",
    unlockBenefit1: "After payment, you will unlock the complete interpretation, including both Single and Double Palace readings. If the result is unfavorable, a method to resolve it is provided for free.",
    unlockBenefit2: "This payment unlocks the full reading for 60 minutes. After 60 minutes, a new payment is required.",
    unlockBenefit3: "If you have long-term divination needs, we recommend unlocking the unlimited VIP access.",
    unlockTipTitle: "Helpful Tip",
    unlockTipContent: "The method for resolution is simple. In a quiet moment, read The Original Vows of Ksitigarbha Bodhisattva Sutra once, then dedicate the merit to yourself or the person concerned, praying for the matter to go smoothly.\n\nYou can read the sutra here: <a href='https://www.fgsitc.org/the-original-vows-of-ksitigarbha-bodhisattva-sutra/' target='_blank' rel='noopener noreferrer' class='underline hover:text-primary'>Ksitigarbha Bodhisattva Sutra</a>. If you find an electronic version unsuitable, you can purchase a physical copy.\n\nOn the 1st, 8th, 14th, 15th, 18th, 23rd, 24th, 28th, 29th, and 30th of each month, reading it once a day can, as the sutra says, 'cause the household to be free from all sudden illnesses, and have abundant food and clothing.'\n\nReading the sutra even on just one of these ten days can result in 'no calamities within a hundred yojanas in all directions.'\n\nEven daily reading can bring 'twenty-eight kinds of benefits,' such as 'protection by heavenly dragons and spirits,' 'no harm from thieves,' 'abundant food and clothing,' 'no visitations of epidemics,' and 'all requests being fulfilled.'",
    wechatPayButton: "Pay with WeChat",
    wechatPayTitle: "Scan to Pay with WeChat",
    wechatPayDescription: "Please scan the QR code below to complete the payment.",
    wechatPaySuccessButton: "I have completed the payment",
    vipRecommendTitle: "Lifetime VIP Recommended",
    vipRecommendDescription: "Just $39.99 for a once-and-for-all solution to unlock your full potential.",
    vipRecommendReason: "Designed for high-frequency users, VIP members enjoy the following exclusive privileges:",
    vipFeatureCustomTime: "Custom Time Divination (VIP Exclusive)",
    vipFeatureUnlimited: "Lifetime unlimited access",
    vipFeatureDirectAccess: "Exclusive pages for direct results",
    vipFeatureAdFree: "A pure, ad-free experience",
    vipRecommendButton: "Proceed to Payment",
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
    meditateStart: "立即测算",
    landingTitle: "掐指一算",
    landingDescription: "掐指一算是易经中高层次的预测学，古人根据“天干(Tiangan)”, “地支(Dizhi)”, “八卦(Bagua)”等信息，结合问事时间，推算吉凶祸福。",
    landingExamples: "可以测算的包括但不限于：<br/><br/>求财如何行？失物何处去？<br/>寻人去何方？官事欲如何？<br/>疾病安与康？姻缘合不合？<br/>谋事参几何？ <span class=\"font-semibold text-foreground\">当下有结果！</span>",
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
    vipContactInfo: "如果出现无法访问，或者网页过期问题，请联系94722424@qq.com",
    vipUrlCopiedTitle: "已复制!",
    vipUrlCopiedDescription: "网址已成功复制到您的剪贴板。",
    vipUrlCopyErrorTitle: "复制失败",
    vipUrlCopyErrorDescription: "无法复制网址，请手动复制。",
    sourceCodeSuccessTitle: "源码购买成功",
    sourceCodeSuccessInstructionTitle: "获取源码操作指引",
    sourceCodeSuccessInstructionBody: "请您提供付款的邮箱、姓名、订单号 (order id) 以及付款时间。将这些信息的截图或文字内容发送到以下邮箱地址。我们工作人员确认无误后，会通过邮件把源码发给您。",
    sourceCodeSuccessContactEmail: "94722424@qq.com",
    sourceCodeSuccessButton: "返回VIP专属页面",
    prepareSincere: "请一定要诚心、恭敬",
    prepareAffectResult: "以免影响结果",
    unlockFullReadingTitle: "解锁您的完整解读",
    unlockIntro1: "掐指一算属于六壬算法，是中国古代宫廷占术的一种，六壬与太乙、奇门遁甲合称三式，在时间算法上，太乙、奇门遁甲均参考六壬而来，因此六壬被称为三式之首。",
    unlockIntro2: "中国著名作家鲁迅就非常善于掐指算，他曾说，“经历一多，便能从前因而知后果，我的预测时时有验”。",
    unlockLimitedOfferTitle: "限时优惠",
    unlockLimitedOfferSubtitle: "优惠将在倒计时结束后失效",
    unlockOfferEnded: "优惠已结束",
    unlockPricePrefix: "仅需",
    unlockBenefit1: "支付完成后，会解锁全部的解读内容，包括单宫和双宫的解读。如果测算结果不如意，会免费提供破解方法。",
    unlockBenefit2: "此次付费会解锁全部解读内容时长为60分钟，60分钟后需要重新付费。",
    unlockBenefit3: "如果您有长期测算的需要，建议解锁不限时长的VIP。",
    unlockTipTitle: "温馨提示",
    unlockTipContent: "破解方法其实很简单，安静的时候读一遍《地藏菩萨本愿经》，然后回向给自己或者相关的人，祈求所测算的事情顺利，如意就可以了 。\n\n<a href='https://www.fgsitc.org/the-original-vows-of-ksitigarbha-bodhisattva-sutra/' target='_blank' rel='noopener noreferrer' class='underline hover:text-primary'>在这个网站可以读到这本经书</a>，如果感觉电子版不适合你，可以买一本实体书来读。\n\n每月的初一、初八、十四、十五、十八、二十三、二十四、二十八、二十九、三十，这10天，每天读一遍，按照经中记载：“现世令此居家无诸横病，衣食丰溢”。\n\n这10天中，只有一天读经，也可以“东西南北百由旬内无诸灾难”。\n\n哪怕是日常的读经，也可以“得二十八种利益”，如 “天龙护念、无盗贼厄、衣食丰足、疾疫不临、有求皆从” 等等 。",
    wechatPayButton: "微信支付",
    wechatPayTitle: "微信扫码支付",
    wechatPayDescription: "请使用微信扫描下方二维码完成支付。",
    wechatPaySuccessButton: "我已完成支付",
    vipRecommendTitle: "向您推荐终身VIP",
    vipRecommendDescription: "仅需$39.99，一劳永逸，解锁全部潜能",
    vipRecommendReason: "专为高频使用场景设计，VIP会员将尊享以下特权：",
    vipFeatureCustomTime: "自定义时间测算 (VIP专属)",
    vipFeatureUnlimited: "不限次数，终身有效",
    vipFeatureDirectAccess: "专属页面，结果直达",
    vipFeatureAdFree: "纯净体验，无任何广告",
    vipRecommendButton: "立即支付",
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
    meditateStart: "[JP] Start Divination",
    landingTitle: "[JP] Finger-Pinching Divination",
    landingDescription: "[JP] Finger-pinching divination (掐指一算) is a high-level predictive art from the I Ching. Ancient Chinese used information such as 'Tiangan' (天干), 'Dizhi' (地支), 'Bagua' (八卦), etc., combined with the time of inquiry, to deduce fortune.",
    landingExamples: "[JP] Topics for divination include, but are not limited to:<br/><br/>How to pursue wealth? Where did the lost item go?<br/>Where to find the person? How will official matters proceed?<br/>Will health be restored? Is the marriage compatible?<br/>How will the plan unfold? <span class=\"font-semibold text-foreground\">Get an immediate result!</span>",
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
    sourceCodeSuccessTitle: "[JP] Source Code Purchase Successful",
    sourceCodeSuccessInstructionTitle: "[JP] Instructions to Receive Your Source Code",
    sourceCodeSuccessInstructionBody: "[JP] Please provide your payment email, name, order ID, and the time of payment. Send a screenshot or text of this information to the following email address. After our staff confirms the details, we will send you the source code via email.",
    sourceCodeSuccessContactEmail: "[JP] 94722424@qq.com",
    sourceCodeSuccessButton: "[JP] Return to VIP Page",
    prepareSincere: "[JP] Please be sincere and respectful",
    prepareAffectResult: "[JP] to avoid affecting the results",
    unlockFullReadingTitle: "[JP] Unlock Your Complete Reading",
    unlockIntro1: "[JP] Finger-Pinching Divination is a form of Liu Ren calculation, one of the ancient Chinese court divination arts. Liu Ren, along with Tai Yi and Qi Men Dun Jia, are known as the Three Arts. In time-based calculations, both Tai Yi and Qi Men Dun Jia refer to Liu Ren, making it the foremost of the Three Arts.",
    unlockIntro2: "[JP] The famous Chinese author Lu Xun was very skilled at finger-pinching divination. He once said, 'With much experience, one can know the consequences from the causes; my predictions are often proven true.'",
    unlockLimitedOfferTitle: "[JP] Limited-Time Offer",
    unlockLimitedOfferSubtitle: "[JP] The offer will expire after the countdown ends.",
    unlockOfferEnded: "[JP] Offer Ended",
    unlockPricePrefix: "[JP] Only",
    unlockBenefit1: "[JP] After payment, you will unlock the complete interpretation, including both Single and Double Palace readings. If the result is unfavorable, a method to resolve it is provided for free.",
    unlockBenefit2: "[JP] This payment unlocks the full reading for 60 minutes. After 60 minutes, a new payment is required.",
    unlockBenefit3: "[JP] If you have long-term divination needs, we recommend unlocking the unlimited VIP access.",
    unlockTipTitle: "[JP] Helpful Tip",
    unlockTipContent: "[JP] The method for resolution is simple. In a quiet moment, read The Original Vows of Ksitigarbha Bodhisattva Sutra once, then dedicate the merit to yourself or the person concerned, praying for the matter to go smoothly.<br/><br/>You can read the sutra here: <a href='https://www.fgsitc.org/the-original-vows-of-ksitigarbha-bodhisattva-sutra/' target='_blank' rel='noopener noreferrer' class='underline hover:text-primary'>Ksitigarbha Bodhisattva Sutra</a>. If you find an electronic version unsuitable, you can purchase a physical copy.<br/><br/>On the 1st, 8th, 14th, 15th, 18th, 23rd, 24th, 28th, 29th, and 30th of each month, reading it once a day can, as the sutra says, 'cause the household to be free from all sudden illnesses, and have abundant food and clothing.'<br/><br/>Reading the sutra even on just one of these ten days can result in 'no calamities within a hundred yojanas in all directions.'<br/><br/>Even daily reading can bring 'twenty-eight kinds of benefits,' such as 'protection by heavenly dragons and spirits,' 'no harm from thieves,' 'abundant food and clothing,' 'no visitations of epidemics,' and 'all requests being fulfilled.'",
    wechatPayButton: "[JP] Pay with WeChat",
    wechatPayTitle: "[JP] Scan to Pay with WeChat",
    wechatPayDescription: "[JP] Please scan the QR code below to complete the payment.",
    wechatPaySuccessButton: "[JP] I have completed the payment",
    vipRecommendTitle: "[JP] Lifetime VIP Recommended",
    vipRecommendDescription: "[JP] Just $39.99 for a once-and-for-all solution to unlock your full potential.",
    vipRecommendReason: "[JP] Designed for high-frequency users, VIP members enjoy the following exclusive privileges:",
    vipFeatureCustomTime: "[JP] Custom Time Divination (VIP Exclusive)",
    vipFeatureUnlimited: "[JP] Lifetime unlimited access",
    vipFeatureDirectAccess: "[JP] Exclusive pages for direct results",
    vipFeatureAdFree: "[JP] A pure, ad-free experience",
    vipRecommendButton: "[JP] Proceed to Payment",
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

