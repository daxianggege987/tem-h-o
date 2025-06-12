
import type { OracleResultName, SingleInterpretationContent, DoubleInterpretationContent, LocalizedContent } from './types';

export const singlePalaceInterpretations: Readonly<Record<OracleResultName, LocalizedContent<SingleInterpretationContent>>> = {
  "大安": {
    "zh-CN": {
      title: "大安 (Dà Ān)",
      meaning: "身不動時，五行屬木，顏色青色，方位東方。臨青龍，謀事主一、五、七。有靜止、心安。吉祥之含義。",
      advice: "斷曰：大安事事昌，求謀在東方，失物去不遠，宅舍保安康。行人身未動，病者主無妨。將軍回田野，仔細更推詳。"
    },
    "en": {
      title: "Great Peace (Dà Ān)",
      meaning: "Body motionless. Wood element, color green, direction East. Governed by the Azure Dragon. Matters relate to numbers 1, 5, 7. Implies stillness, peace of mind. Auspicious meaning.",
      advice: "Verdict: Great Peace brings prosperity in all matters. Seek endeavors in the East. Lost items are not far. Residence is safe and sound. Travelers have not yet departed. The sick will face no harm. Generals return to their fields. Ponder the details carefully."
    }
  },
  "留连": {
    "zh-CN": { 
      title: "留連 (Liú Lián)", 
      meaning: "人未歸時，五行屬水，顏色黑色，方位北方。臨玄武，謀事主二、八、十。有喑味不明，延遲。糾纏。拖延、漫長之含義。",
      advice: "斷曰：留連事難成，求謀日未明。官事只宜緩，去者未回程。失物南方見，急討方稱心。更須防口舌，人口且太平。"
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
      meaning: "人即至時，五行屬火，顏色紅色，方位南方。臨朱雀，謀事主三、六、九。有快速、喜慶，吉事。及時、喜訊之含義。",
      advice: "斷曰：速喜喜來臨，求財向南行。失物申未午，逢人路上尋。官事有福德，病者無禍侵。田宅六畜吉，行人有信音。"
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
      meaning: "官事凶時，五行屬金，顏色白色，方位西方。臨白虎，謀事主四、七、十。有不吉、驚恐，凶險。口舌、是非、官訟之含義。",
      advice: "斷曰：赤口主口舌，官非切要防。失物急去尋，行人有驚慌。六畜多作怪，病者出西方。更須防詛咒，恐怕染瘟疫。"
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
      meaning: "人來喜時，五行屬木，臨六合，謀事主一、五、七。有和合、吉利之含義。",
      advice: "斷曰：小吉最吉昌，路上好商量。陰人來報喜，失物在坤方。行人即便至，交易甚是強。凡事皆和合，病者禱上蒼。"
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
      meaning: "音信稀時，五行屬土，顏色黃色，方位中央。臨勾陳。謀事主三、六、九。有不吉、無結果、憂慮。虛無、白忙之含義。",
      advice: "斷曰：空亡事不祥，陰人多乖張。求財無利益，行人有災殃。失物尋不見，官事有刑傷。病人逢暗鬼，禳解保安康。"
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
        title: "大安宮 配 留連宮",
        poem: "船遲又遇打頭風，財帛營求事未豐，更被盜賊多阻隔，婚姻 πληροφορία पहुंचाएगा。",
        explanation: "解：此卦為先吉後凶。為人謀事，自以為穩陣，其實先勞後倦。求財不遂，婚姻不合，本身有阻，凡事不可托人，亦不可信人，防口舌、防盜賊。問病恐加，問訟不好，求官不大吉，失物尋不見，行人有阻，萬事無憑准，空手做人情，占此卦者，謀望皆不如意，需謹慎。"
      },
      "en": {
        title: "Great Peace Palace with Lingering Palace",
        poem: "Boat delayed, meets headwind again, wealth seeking yields little, further blocked by thieves, marriage brings (uncertain) information.", // Adjusted translation for the foreign phrase
        explanation: "Explanation: This hexagram is auspicious first, then inauspicious. Planning for others seems stable but leads to toil then fatigue. Wealth seeking is unsuccessful, marriage unsuitable, self has obstacles. Do not entrust matters or people, beware of gossip and thieves. Sickness may worsen, lawsuits unfavorable, official career not very auspicious, lost items not found, travelers obstructed. All things unreliable, empty favors. Those who draw this hexagram will find their aspirations unfulfilled; caution is needed."
      }
    },
    "速喜": {
      "zh-CN": {
        title: "大安宮 配 速喜宮",
        poem: "夫婦相關重相伴，陰陽和合福無邊，庶人占此財源旺，官員占此得高遷。",
        explanation: "解：此卦為先吉後吉。謀事稱心，百般吉利，萬事如意。問求財大吉，婚姻可成，自身平安，家庭和合。問病即愈，求官高升，失物可尋，行人即至。占此卦者，凡事大吉，不用懷疑，放心去做，喜事重重。"
      },
      "en": {
        title: "Great Peace Palace with Swift Joy Palace",
        poem: "Husband and wife, deeply connected, accompany each other anew; Yin and Yang harmonize, boundless blessings ensue. Commoners drawing this find wealth sources flourish; Officials drawing this attain high promotion.",
        explanation: "Explanation: This hexagram is auspicious followed by more auspiciousness. Matters proceed as desired, everything is favorable, all wishes come true. Seeking wealth is very auspicious, marriage can be achieved, self is safe, family harmonious. Sickness heals quickly, official career leads to promotion, lost items can be found, travelers arrive soon. For those who draw this hexagram, all matters are greatly auspicious; no need for doubt, proceed with confidence, joyous events abound."
      }
    },
     "赤口": {
      "zh-CN": {
        title: "大安宮 配 赤口宮",
        poem: "門外事來終不實，提防小口莫相隨，雷聲大雨點小，口舌官非免不了。",
        explanation: "解：此卦為吉中藏凶。為人謀事，似穩實不穩，始終無結局。求財有阻，婚姻有變，自身不吉，提防小人，官事宜解，病者星移，失物東北方尋，行人有口舌。占此卦者，凡事不可信人，免生是非。"
      },
      "en": {
        title: "Great Peace Palace with Red Mouth Palace",
        poem: "Matters from outside the door are ultimately unreal; Beware of petty mouths, do not follow. Thunder loud, raindrops small; Gossip and official disputes are unavoidable.",
        explanation: "Explanation: This hexagram has hidden inauspiciousness within auspiciousness. Planning for others seems stable but is not, ultimately without resolution. Obstacles in seeking wealth, changes in marriage, self is inauspicious, beware of petty people. Official matters should be resolved, the sick's stars shift. Seek lost items in the Northeast. Travelers experience gossip. Those who draw this hexagram should not trust others in any matter to avoid disputes."
      }
    },
    "小吉": {
        "zh-CN": {
            title: "大安宮 配 小吉宮",
            poem: "門前懸掛敕書牌，官事無妨解釋來，婚姻合夥皆如意，病人出入定無災。",
            explanation: "解：此卦為吉上加吉。凡事大吉，謀為稱意。求財九分，婚姻成就，官事和解，病人痊愈，失物可尋，行人即至。占此卦者，百事大吉。"
        },
        "en": {
            title: "Great Peace Palace with Minor Luck Palace",
            poem: "An imperial edict plaque hangs before the door; Official matters are unhindered, explanations come. Marriage and partnerships are all as desired; The sick entering and leaving will surely have no disaster.",
            explanation: "Explanation: This hexagram is auspiciousness upon auspiciousness. All matters are greatly auspicious, plans proceed as desired. Wealth seeking is nine-tenths successful, marriage is achieved, official matters are resolved, the sick recover fully, lost items can be found, travelers arrive soon. For those who draw this hexagram, all hundred matters are greatly auspicious."
        }
    },
    "空亡": {
        "zh-CN": {
            title: "大安宮 配 空亡宮",
            poem: "安居樂業，名利雙收，出入有喜，吉無不利。",
            explanation: "解：此卦為半吉半凶。主凡事以靜為佳，妄動則招災，謀事可成，但恐日後有變。求財七分，婚姻可成，但有口舌，求官得位，但日後難保，病者無妨，失物可尋，行人未至。占此卦者，成中有破，吉中有凶，凡事須謹慎。"
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
            title: "留連宮 配 大安宮",
            poem: "欲行不止，徘徊不已，藏玉懷珠，寸心千里。",
            explanation: "解：此卦為先凶後吉。求財、婚姻，皆主先難後易，病久方愈，訟事可解，失物緩尋，行人未至。占此卦者，凡事宜遲，不可太急，耐心等待，自有好音。"
        },
        "en": {
            title: "Lingering Palace with Great Peace Palace",
            poem: "Desiring to go but not stopping; Pacing back and forth, unceasing. Hiding jade, cherishing pearls; A small heart travels a thousand miles.",
            explanation: "Explanation: This hexagram is inauspicious first, then auspicious. Seeking wealth and marriage are both difficult first, then easy. Sickness heals after a long time. Lawsuits can be resolved. Seek lost items slowly. Travelers have not yet arrived. Those who draw this hexagram should delay all matters, not be too hasty; wait patiently for good news."
        }
    },
  },
  "速喜": {
    "小吉": {
      "zh-CN": {
        title: "速喜宮 配 小吉宮",
        poem: "速喜又加小吉昌。\n進人口。\n產女郎。\n婚姻大好。\n求財亦有。\n行人即至。\n六甲生香。",
        explanation: "官員有好音信。\n常人有好喜事至。\n謀財十分。\n病者即愈。\n行人即至。\n婚姻和合。\n百事大吉。"
      },
      "en": {
        title: "Swift Joy Palace with Minor Luck Palace",
        poem: "Swift Joy adds to Minor Luck's prosperity.\nPopulation increases.\nA girl is born.\nMarriage is excellent.\nWealth can be sought.\nTravelers arrive soon.\nThe pregnant will have a fragrant birth (smooth).",
        explanation: "Officials receive good news.\nCommoners experience joyous events.\nWealth seeking is very favorable (10/10).\nThe sick recover quickly.\nTravelers arrive soon.\nMarriage is harmonious.\nAll matters are greatly auspicious."
      }
    }
  },
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
