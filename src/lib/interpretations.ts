
import type { OracleResultName, SingleInterpretationContent, DoubleInterpretationContent, LocalizedContent } from './types';

export const singlePalaceInterpretations: Readonly<Record<OracleResultName, LocalizedContent<SingleInterpretationContent>>> = {
  "大安": {
    "zh-CN": {
      title: "大安 (Dà Ān)",
      meaning: "身不动时，五行属木，颜色青色，方位东方。临青龙，谋事主一、五、七。有静止、心安。吉祥之含义。",
      advice: "断曰：大安事事昌，求谋在东方，失物去不远，宅舍保安康。行人身未动，病者主无妨。将军回田野，仔细更推详。"
    },
    "en": {
      title: "Great Peace (Dà Ān)",
      meaning: "Body motionless. Wood element, color green, direction East. Governed by the Azure Dragon. Matters relate to numbers 1, 5, 7. Implies stillness, peace of mind. Auspicious meaning.",
      advice: "Verdict: Great Peace brings prosperity in all matters. Seek endeavors in the East. Lost items are not far. Residence is safe and sound. Travelers have not yet departed. The sick will face no harm. Generals return to their fields. Ponder the details carefully."
    }
  },
  "留连": {
    "zh-CN": { 
      title: "留连 (Liú Lián)", 
      meaning: "人未归时，五行属水，颜色黑色，方位北方。临玄武，谋事主二、八、十。有喑味不明，延迟。纠缠。拖延、漫长之含义。",
      advice: "断曰：留连事难成，求谋日未明。官事只宜缓，去者未回程。失物南方见，急讨方称心。更须防口舌，人口且太平。"
    },
    "en": {
      title: "Lingering (Liú Lián)",
      meaning: "Person has not returned. Water element, color black, direction North. Governed by the Black Tortoise. Matters relate to numbers 2, 8, 10. Implies obscurity, delay, entanglement, procrastination, lengthiness.",
      advice: "Verdict: Lingering matters are hard to accomplish, prospects unclear. Official matters should be delayed, the departed has not returned. Lost items found in the South, pursue urgently. Beware of gossip; household remains peaceful."
    }
  },
  "速喜": {
    "zh-CN": {
      title: "速喜 (Sù Xǐ)",
      meaning: "人即至时，五行属火，颜色红色，方位南方。临朱雀，谋事主三、六、九。有快速、喜庆，吉事。及时、喜讯之含义。",
      advice: "断曰：速喜喜来临，求财向南行。失物申未午，逢人路上寻。官事有福德，病者无祸侵。田宅六畜吉，行人有信音。"
    },
    "en": {
      title: "Swift Joy (Sù Xǐ)",
      meaning: "Person arrives soon. Fire element, color red, direction South. Governed by the Vermilion Bird. Matters relate to numbers 3, 6, 9. Implies speed, celebration, auspicious events, timeliness, good news.",
      advice: "Verdict: Swift Joy arrives, seek wealth towards the South. Lost items around Shen, Wei, Wu hours, ask people on the road. Official matters blessed, the sick unharmed. Property and livestock auspicious, travelers bring news."
    }
  },
  "赤口": {
    "zh-CN": {
      title: "赤口 (Chì Kǒu)",
      meaning: "官事凶时，五行属金，颜色白色，方位西方。临白虎，谋事主四、七、十。有不吉、惊恐，凶险。口舌、是非、官讼之含义。",
      advice: "断曰：赤口主口舌，官非切要防。失物急去寻，行人有惊慌。六畜多作怪，病者出西方。更须防诅咒，恐怕染瘟疫。"
    },
    "en": {
      title: "Red Mouth (Chì Kǒu)",
      meaning: "Official matters are inauspicious. Metal element, color white, direction West. Governed by the White Tiger. Matters relate to numbers 4, 7, 10. Implies misfortune, fear, danger, gossip, disputes, lawsuits.",
      advice: "Verdict: Red Mouth indicates gossip, guard against official disputes. Seek lost items urgently, travelers are alarmed. Livestock act strangely, the sick face West. Beware of curses, fear of plague."
    }
  },
  "小吉": {
    "zh-CN": {
      title: "小吉 (Xiǎo Jí)",
      meaning: "人来喜时，五行属木，临六合，谋事主一、五、七。有和合、吉利之含义。",
      advice: "断曰：小吉最吉昌，路上好商量。阴人来报喜，失物在坤方。行人即便至，交易甚是强。凡事皆和合，病者祷上苍。"
    },
    "en": {
      title: "Minor Luck (Xiǎo Jí)",
      meaning: "Person arrives with joy. Wood element. Governed by the Six Harmonies. Matters relate to numbers 1, 5, 7. Implies harmony, auspiciousness.",
      advice: "Verdict: Minor Luck is most auspicious, good for discussions on the way. A woman brings good news, lost items in Kun direction (Southwest). Travelers arrive soon, transactions strong. All matters harmonious, the sick should pray."
    }
  },
  "空亡": {
    "zh-CN": {
      title: "空亡 (Kōng Wáng)",
      meaning: "音信稀时，五行属土，颜色黄色，方位中央。临勾陈。谋事主三、六、九。有不吉、无结果、忧虑。虚无、白忙之含义。",
      advice: "断曰：空亡事不祥，阴人多乖张。求财无利益，行人有灾殃。失物寻不见，官事有刑伤。病人逢暗鬼，禳解保安康。"
    },
    "en": {
      title: "Emptiness (Kōng Wáng)",
      meaning: "News is scarce. Earth element, color yellow, direction Center. Governed by the Hooking Chen. Matters relate to numbers 3, 6, 9. Implies misfortune, no results, worries, emptiness, wasted effort.",
      advice: "Verdict: Emptiness is inauspicious, deceitful people are perverse. No profit in seeking wealth, travelers face disaster. Lost items not found, official matters involve punishment. The sick encounter dark spirits, perform rituals for safety."
    }
  },
};

export const doublePalaceInterpretations: Readonly<Record<OracleResultName, Partial<Readonly<Record<OracleResultName, LocalizedContent<DoubleInterpretationContent>>>>>> = {
  "大安": {
    "留连": {
      "zh-CN": {
        title: "大安宫 配 留连宫",
        poem: "船迟又遇打头风，财帛营求事未丰，更被盗贼多阻隔，婚姻信息费周章。", // Adjusted from original '婚姻 πληροφορία पहुंचाएगा' to something more fitting
        explanation: "解：此卦为先吉后凶。为人谋事，自以为稳阵，其实先劳后倦。求财不遂，婚姻不合，本身有阻，凡事不可托人，亦不可信人，防口舌、防盗贼。问病恐加，问讼不好，求官不大吉，失物寻不见，行人有阻，万事无凭准，空手做人情，占此卦者，谋望皆不如意，需谨慎。"
      },
      "en": {
        title: "Great Peace Palace with Lingering Palace",
        poem: "Boat delayed, meets headwind again, wealth seeking yields little, further blocked by thieves, marriage matters cause much trouble.",
        explanation: "Explanation: This hexagram is auspicious first, then inauspicious. Planning for others seems stable but leads to toil then fatigue. Wealth seeking is unsuccessful, marriage unsuitable, self has obstacles. Do not entrust matters or people, beware of gossip and thieves. Sickness may worsen, lawsuits unfavorable, official career not very auspicious, lost items not found, travelers obstructed. All things unreliable, empty favors. Those who draw this hexagram will find their aspirations unfulfilled; caution is needed."
      }
    },
    "速喜": {
      "zh-CN": {
        title: "大安宫 配 速喜宫",
        poem: "夫妇相关重相伴，阴阳和合福无边，庶人占此财源旺，官员占此得高迁。",
        explanation: "解：此卦为先吉后吉。谋事称心，百般吉利，万事如意。问求财大吉，婚姻可成，自身平安，家庭和合。问病即愈，求官高升，失物可寻，行人即至。占此卦者，凡事大吉，不用怀疑，放心去做，喜事重重。"
      },
      "en": {
        title: "Great Peace Palace with Swift Joy Palace",
        poem: "Husband and wife, deeply connected, accompany each other anew; Yin and Yang harmonize, boundless blessings ensue. Commoners drawing this find wealth sources flourish; Officials drawing this attain high promotion.",
        explanation: "Explanation: This hexagram is auspicious followed by more auspiciousness. Matters proceed as desired, everything is favorable, all wishes come true. Seeking wealth is very auspicious, marriage can be achieved, self is safe, family harmonious. Sickness heals quickly, official career leads to promotion, lost items can be found, travelers arrive soon. For those who draw this hexagram, all matters are greatly auspicious; no need for doubt, proceed with confidence, joyous events abound."
      }
    },
     "赤口": {
      "zh-CN": {
        title: "大安宫 配 赤口宫",
        poem: "门外事来终不实，提防小口莫相随，雷声大雨点小，口舌官非免不了。",
        explanation: "解：此卦为吉中藏凶。为人谋事，似稳实不稳，始终无结局。求财有阻，婚姻有变，自身不吉，提防小人，官事宜解，病者星移，失物东北方寻，行人有口舌。占此卦者，凡事不可信人，免生是非。"
      },
      "en": {
        title: "Great Peace Palace with Red Mouth Palace",
        poem: "Matters from outside the door are ultimately unreal; Beware of petty mouths, do not follow. Thunder loud, raindrops small; Gossip and official disputes are unavoidable.",
        explanation: "Explanation: This hexagram has hidden inauspiciousness within auspiciousness. Planning for others seems stable but is not, ultimately without resolution. Obstacles in seeking wealth, changes in marriage, self is inauspicious, beware of petty people. Official matters should be resolved, the sick's stars shift. Seek lost items in the Northeast. Travelers experience gossip. Those who draw this hexagram should not trust others in any matter to avoid disputes."
      }
    },
    "小吉": {
        "zh-CN": {
            title: "大安宫 配 小吉宫",
            poem: "门前悬挂敕书牌，官事无妨解释来，婚姻合伙皆如意，病人出入定无灾。",
            explanation: "解：此卦为吉上加吉。凡事大吉，谋为称意。求财九分，婚姻成就，官事和解，病人痊愈，失物可寻，行人即至。占此卦者，百事大吉。"
        },
        "en": {
            title: "Great Peace Palace with Minor Luck Palace",
            poem: "An imperial edict plaque hangs before the door; Official matters are unhindered, explanations come. Marriage and partnerships are all as desired; The sick entering and leaving will surely have no disaster.",
            explanation: "Explanation: This hexagram is auspiciousness upon auspiciousness. All matters are greatly auspicious, plans proceed as desired. Wealth seeking is nine-tenths successful, marriage is achieved, official matters are resolved, the sick recover fully, lost items can be found, travelers arrive soon. For those who draw this hexagram, all hundred matters are greatly auspicious."
        }
    },
    "空亡": {
        "zh-CN": {
            title: "大安宫 配 空亡宫",
            poem: "安居乐业，名利双收，出入有喜，吉无不利。", // Note: This poem seems very positive for 空亡, might be a general statement from the site or specific context.
            explanation: "解：此卦为半吉半凶。主凡事以静为佳，妄动则招灾，谋事可成，但恐日后有变。求财七分，婚姻可成，但有口舌，求官得位，但日后难保，病者无妨，失物可寻，行人未至。占此卦者，成中有破，吉中有凶，凡事须谨慎。"
        },
        "en": {
            title: "Great Peace Palace with Emptiness Palace",
            poem: "Live and work in peace and contentment; Fame and fortune both received. Joy in comings and goings; Auspicious without disadvantage.",
            explanation: "Explanation: This hexagram is half auspicious, half inauspicious. It indicates that stillness is best for all matters; rash actions invite disaster. Plans can succeed, but fear changes later. Wealth seeking is seven-tenths successful. Marriage can be achieved, but with gossip. Official position obtained, but hard to maintain later. The sick are unharmed. Lost items can be found. Travelers have not yet arrived. Those who draw this hexagram find breaks within success, inauspiciousness within auspiciousness; caution is needed in all matters."
        }
    }
  },
  "留连": {
    "大安": {
        "zh-CN": {
            title: "留连宫 配 大安宫",
            poem: "欲行不止，徘徊不已，藏玉怀珠，寸心千里。",
            explanation: "解：此卦为先凶后吉。求财、婚姻，皆主先难后易，病久方愈，讼事可解，失物缓寻，行人未至。占此卦者，凡事宜迟，不可太急，耐心等待，自有好音。"
        },
        "en": {
            title: "Lingering Palace with Great Peace Palace",
            poem: "Desiring to go but not stopping; Pacing back and forth, unceasing. Hiding jade, cherishing pearls; A small heart travels a thousand miles.",
            explanation: "Explanation: This hexagram is inauspicious first, then auspicious. Seeking wealth and marriage are both difficult first, then easy. Sickness heals after a long time. Lawsuits can be resolved. Seek lost items slowly. Travelers have not yet arrived. Those who draw this hexagram should delay all matters, not be too hasty; wait patiently for good news."
        }
    },
    "速喜": {
      "zh-CN": {
          title: "留连宫 配 速喜宫",
          poem: "路遥人行，财利丰盈，不宜守旧，必有喜庆。",
          explanation: "解：此卦为苦尽甘来。为人谋事，似难实易，只宜出外，不可守旧，求财七分，婚姻成就，官事宜和，病者先凶后吉，失物西方寻，行人即至。占此卦者，主有喜事，但有反复。"
      },
      "en": {
          title: "Lingering Palace with Swift Joy Palace",
          poem: "The road is long, the traveler walks; Wealth and profit are abundant. It is not advisable to stick to the old ways; There will surely be joyous celebrations.",
          explanation: "Explanation: This hexagram signifies that bitterness ends and sweetness begins. Planning matters for others seems difficult but is actually easy. It is only suitable to go out, not to cling to old ways. Wealth seeking is seven-tenths successful. Marriage is achieved. Official matters should be harmonized. The sick experience inauspiciousness first, then auspiciousness. Seek lost items in the West. Travelers arrive soon. Those who draw this hexagram will mainly have joyous events, but with some reversals."
      }
    },
    "赤口": {
      "zh-CN": {
          title: "留连宫 配 赤口宫",
          poem: "蜘蛛结网，网住蚊虫，坐守自稳，必不落空。",
          explanation: "解：此卦为有凶有吉。主求财、求官、求势，皆主有贵人扶助，始虽艰难，终必成功，婚姻可就，病者渐愈，失物可寻，行人将至，官事和解。占此卦者，先否后泰。"
      },
      "en": {
          title: "Lingering Palace with Red Mouth Palace",
          poem: "A spider spins its web, trapping mosquitoes and insects; Sit and guard, remaining stable, and you will surely not fail.",
          explanation: "Explanation: This hexagram has both inauspicious and auspicious aspects. For seeking wealth, official position, or power, it indicates assistance from a benefactor. Though difficult at first, success will eventually be achieved. Marriage can be accomplished. The sick gradually recover. Lost items can be found. Travelers are about to arrive. Official matters are resolved. Those who draw this hexagram will experience denial first, then peace (i.e., adversity followed by prosperity)."
      }
    },
    "小吉": {
      "zh-CN": {
          title: "留连宫 配 小吉宫",
          poem: "万里晴空，鸟鹊飞鸣，花开结果，诸事皆成。",
          explanation: "解：此卦为先难后易。凡事皆吉，求财十分，婚姻成就，官事得理，病者安，失物可寻，行人即至。占此卦者，主先忧后喜，诸事如意。"
      },
      "en": {
          title: "Lingering Palace with Minor Luck Palace",
          poem: "Ten thousand miles of clear sky, magpies fly and sing; Flowers bloom and bear fruit, all matters are accomplished.",
          explanation: "Explanation: This hexagram indicates difficulty first, then ease. All matters are auspicious. Wealth seeking is ten-tenths successful. Marriage is achieved. Official matters are justified. The sick are well. Lost items can be found. Travelers arrive soon. Those who draw this hexagram will experience worry first, then joy; all matters will go as wished."
      }
    },
    "空亡": {
      "zh-CN": {
          title: "留连宫 配 空亡宫",
          poem: "镜中看花，水中望月，饥人画饼，渴者描梅。",
          explanation: "解：此卦为诸事不成。凡事不吉，求财无，婚姻不成，官事失败，病者不安，失物难寻，行人不至。占此卦者，主虚花无实，百事不利。"
      },
      "en": {
          title: "Lingering Palace with Emptiness Palace",
          poem: "Viewing flowers in a mirror, gazing at the moon in water; A hungry person draws a cake, a thirsty one sketches a plum.",
          explanation: "Explanation: This hexagram indicates that no matters will succeed. All affairs are inauspicious. No wealth to be sought. Marriage will not be achieved. Official matters will fail. The sick are unwell. Lost items are hard to find. Travelers do not arrive. Those who draw this hexagram will find illusion without substance; all hundred matters are unfavorable."
      }
    }
  },
  "速喜": {
    "小吉": {
      "zh-CN": {
        title: "速喜宫 配 小吉宫",
        poem: "速喜又加小吉昌，进人口，产女郎。婚姻大好，求财亦有，行人即至，六甲生香。",
        explanation: "官吏有好音信，常人有好喜事至。谋财十分，病者即愈，行人即至，婚姻和合，百事大吉。" // Simplified from the original which had more fragmented lines
      },
      "en": {
        title: "Swift Joy Palace with Minor Luck Palace",
        poem: "Swift Joy adds to Minor Luck's prosperity. Population increases, a girl is born. Marriage is excellent, wealth can be sought, travelers arrive soon, the pregnant will have a fragrant (smooth) birth.",
        explanation: "Officials receive good news. Commoners experience joyous events. Wealth seeking is very favorable (10/10). The sick recover quickly. Travelers arrive soon. Marriage is harmonious. All matters are greatly auspicious."
      }
    }
    // Other combinations for 速喜 (大安, 留连, 赤口, 空亡) would go here
  },
  "小吉": {
    "赤口": {
      "zh-CN": {
        title: "小吉宫 配 赤口宫",
        poem: "官事缠讼，功名难求，私来自暗，口舌忧愁。",
        explanation: "解：此卦为吉中带凶。凡事迟滞，谋望不顺，求财利益稀薄，讼事忧愁，病者犯鬼，婚姻不合，行人有阻。占此卦者，守之为高，妄动招灾。"
      },
      "en": {
        title: "Minor Luck Palace with Red Mouth Palace",
        poem: "Official matters lead to lawsuits, fame and achievement are hard to seek; Private affairs come from darkness, gossip causes sorrow.",
        explanation: "Explanation: This hexagram is auspicious with underlying inauspiciousness. All matters are delayed, aspirations are not smooth, profits from wealth-seeking are meager, lawsuits bring sorrow, the sick are afflicted by spirits, marriage is unsuitable, travelers are obstructed. For those who draw this hexagram, it is best to maintain the status quo; rash actions invite disaster."
      }
    }
    // Other combinations for 小吉 (大安, 留连, 速喜, 空亡) would go here
  }
  // Stubs for other primary oracle results
  // "赤口": { ... }
  // "空亡": { ... }
};

const DEFAULT_LANG = 'en';
const FALLBACK_LANG = 'zh-CN';

export function getSinglePalaceInterpretation(name: OracleResultName, lang: string): SingleInterpretationContent | null {
  const localizedEntry = singlePalaceInterpretations[name];
  if (!localizedEntry) return null;
  return localizedEntry[lang] || localizedEntry[DEFAULT_LANG] || localizedEntry[FALLBACK_LANG] || Object.values(localizedEntry)[0] || null;
}

export function getDoublePalaceInterpretation(name1: OracleResultName, name2: OracleResultName, lang: string): DoubleInterpretationContent | null {
  const firstPalaceGroup = doublePalaceInterpretations[name1];
  if (!firstPalaceGroup) return null;
  const localizedEntry = firstPalaceGroup[name2];
  if (!localizedEntry) return null;
  return localizedEntry[lang] || localizedEntry[DEFAULT_LANG] || localizedEntry[FALLBACK_LANG] || Object.values(localizedEntry)[0] || null;
}


    