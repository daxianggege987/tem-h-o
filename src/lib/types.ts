export interface LunarDate {
  lunarMonth: number;
  lunarDay: number;
  // Note: A real lunar calendar conversion might provide more details like year, leap month etc.
}

export interface Shichen {
  name: string; // e.g., "子"
  value: number; // e.g., 1
}

export type OracleResultName = "大安" | "留连" | "速喜" | "赤口" | "小吉" | "空亡";
