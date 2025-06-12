import type { OracleResultName } from './types';

export const singlePalaceInterpretations: Readonly<Record<OracleResultName, { title: string; meaning: string; advice?: string }>> = {
  "大安": {
    title: "大安 (Dà Ān)",
    meaning: "身不動時，五行屬木，顏色青色，方位東方。臨青龍，謀事主一、五、七。有靜止、心安。吉祥之含義。",
    advice: "斷曰：大安事事昌，求謀在東方，失物去不遠，宅舍保安康。行人身未動，病者主無妨。將軍回田野，仔細更推詳。"
  },
  "留连": { 
    title: "留連 (Liú Lián)", 
    meaning: "人未歸時，五行屬水，顏色黑色，方位北方。臨玄武，謀事主二、八、十。有喑味不明，延遲。糾纏。拖延、漫長之含義。",
    advice: "斷曰：留連事難成，求謀日未明。官事只宜緩，去者未回程。失物南方見，急討方稱心。更須防口舌，人口且太平。"
  },
  "速喜": {
    title: "速喜 (Sù Xǐ)",
    meaning: "人即至時，五行屬火，顏色紅色，方位南方。臨朱雀，謀事主三、六、九。有快速、喜慶，吉事。及時、喜訊之含義。",
    advice: "斷曰：速喜喜來臨，求財向南行。失物申未午，逢人路上尋。官事有福德，病者無禍侵。田宅六畜吉，行人有信音。"
  },
  "赤口": {
    title: "赤口 (Chì Kǒu)",
    meaning: "官事凶時，五行屬金，顏色白色，方位西方。臨白虎，謀事主四、七、十。有不吉、驚恐，凶險。口舌、是非、官訟之含義。",
    advice: "斷曰：赤口主口舌，官非切要防。失物急去尋，行人有驚慌。六畜多作怪，病者出西方。更須防詛咒，恐怕染瘟疫。"
  },
  "小吉": {
    title: "小吉 (Xiǎo Jí)",
    meaning: "人來喜時，五行屬木，臨六合，謀事主一、五、七。有和合、吉利之含義。",
    advice: "斷曰：小吉最吉昌，路上好商量。陰人來報喜，失物在坤方。行人即便至，交易甚是強。凡事皆和合，病者禱上蒼。"
  },
  "空亡": {
    title: "空亡 (Kōng Wáng)",
    meaning: "音信稀時，五行屬土，顏色黃色，方位中央。臨勾陳。謀事主三、六、九。有不吉、無結果、憂慮。虛無、白忙之含義。",
    advice: "斷曰：空亡事不祥，陰人多乖張。求財無利益，行人有災殃。失物尋不見，官事有刑傷。病人逢暗鬼，禳解保安康。"
  },
};

export const doublePalaceInterpretations: Readonly<Record<OracleResultName, Partial<Readonly<Record<OracleResultName, { title: string; poem: string; explanation: string }>>>>> = {
  "大安": {
    "留连": {
      title: "大安宮 配 留連宮",
      poem: "船遲又遇打頭風，財帛營求事未豐，更被盜賊多阻隔，婚姻 πληροφορία पहुंचाएगा。",
      explanation: "解：此卦為先吉後凶。為人謀事，自以為穩陣，其實先勞後倦。求財不遂，婚姻不合，本身有阻，凡事不可托人，亦不可信人，防口舌、防盜賊。問病恐加，問訟不好，求官不大吉，失物尋不見，行人有阻，萬事無憑准，空手做人情，占此卦者，謀望皆不如意，需謹慎。"
    },
    "速喜": {
      title: "大安宮 配 速喜宮",
      poem: "夫婦相關重相伴，陰陽和合福無邊，庶人占此財源旺，官員占此得高遷。",
      explanation: "解：此卦為先吉後吉。謀事稱心，百般吉利，萬事如意。問求財大吉，婚姻可成，自身平安，家庭和合。問病即愈，求官高升，失物可尋，行人即至。占此卦者，凡事大吉，不用懷疑，放心去做，喜事重重。"
    },
     "赤口": {
      title: "大安宮 配 赤口宮",
      poem: "門外事來終不實，提防小口莫相隨，雷聲大雨點小，口舌官非免不了。",
      explanation: "解：此卦為吉中藏凶。為人謀事，似穩實不穩，始終無結局。求財有阻，婚姻有變，自身不吉，提防小人，官事宜解，病者星移，失物東北方尋，行人有口舌。占此卦者，凡事不可信人，免生是非。"
    },
    "小吉": {
        title: "大安宮 配 小吉宮",
        poem: "門前懸掛敕書牌，官事無妨解釋來，婚姻合夥皆如意，病人出入定無災。",
        explanation: "解：此卦為吉上加吉。凡事大吉，謀為稱意。求財九分，婚姻成就，官事和解，病人痊愈，失物可尋，行人即至。占此卦者，百事大吉。"
    },
    "空亡": {
        title: "大安宮 配 空亡宮",
        poem: "安居樂業，名利雙收，出入有喜，吉無不利。",
        explanation: "解：此卦為半吉半凶。主凡事以靜為佳，妄動則招災，謀事可成，但恐日後有變。求財七分，婚姻可成，但有口舌，求官得位，但日後難保，病者無妨，失物可尋，行人未至。占此卦者，成中有破，吉中有凶，凡事須謹慎。"
    }
    // NOTE: Add other combinations like 大安-赤口, 大安-小吉, 大安-空亡
    // And then for 留连 as the first palace, etc.
  },
  "留连": {
    "大安": {
        title: "留連宮 配 大安宮",
        poem: "欲行不止，徘徊不已，藏玉懷珠，寸心千里。",
        explanation: "解：此卦為先凶後吉。求財、婚姻，皆主先難後易，病久方愈，訟事可解，失物緩尋，行人未至。占此卦者，凡事宜遲，不可太急，耐心等待，自有好音。"
    },
    // NOTE: Add other combinations for 留连
  },
  // ... And so on for 速喜, 赤口, 小吉, 空亡 as the first palace
};

export function getSinglePalaceInterpretation(name: OracleResultName): { title: string; meaning: string; advice?: string } | null {
  return singlePalaceInterpretations[name] || null;
}

export function getDoublePalaceInterpretation(name1: OracleResultName, name2: OracleResultName): { title: string; poem: string; explanation: string } | null {
  const firstPalaceGroup = doublePalaceInterpretations[name1];
  if (!firstPalaceGroup) return null;
  return firstPalaceGroup[name2] || null;
}