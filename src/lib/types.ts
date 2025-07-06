
export interface LunarDate {
  lunarMonth: number;
  lunarDay: number;
}

export interface Shichen {
  name: string; 
  value: number; 
}

export type OracleResultName = "大安" | "留连" | "速喜" | "赤口" | "小吉" | "空亡";

// Types for localized interpretations
export interface SingleInterpretationContent {
  title: string;
  pinyin?: string;
  meaning: string;
  advice?: string;
}

export interface DoubleInterpretationContent {
  title: string;
  poem: string;
  explanation: string;
}

export type LocalizedContent<T> = Record<string, T>; // e.g. { "en": T, "zh-CN": T }
