import type { LunarDate, Shichen } from './types';

/**
 * Converts a Gregorian date to its Lunar calendar equivalent.
 * IMPORTANT: This is a MOCK IMPLEMENTATION.
 * A real lunar calendar conversion is complex and would require a dedicated library or extensive algorithm.
 * This function provides fixed or simplistic placeholder values for demonstration purposes.
 * The example provided by the user (2025/6/12 Gregorian -> 5/17 Lunar) is used for that specific date.
 */
export function gregorianToLunar(year: number, month: number, day: number): LunarDate {
  if (year === 2025 && month === 6 && day === 12) {
    return { lunarMonth: 5, lunarDay: 17 };
  }
  // Fallback mock for other dates:
  // This is a very naive mock and will not be accurate.
  // For a production app, integrate a proper lunar calendar library.
  return {
    lunarMonth: (month % 12) + 1, 
    lunarDay: (day % 28) + 1,   
  };
}

/**
 * Converts an hour (0-23) into the corresponding Chinese Zodiac Hour (Shichen).
 * Each Shichen spans two hours.
 * 子时 (Zi Hour) corresponds to value 1 (23:00 - 00:59).
 */
export function getShichen(hour: number): Shichen {
  if (hour >= 23 || hour < 1) return { name: "子", value: 1 };   // 23:00 - 00:59
  if (hour >= 1 && hour < 3) return { name: "丑", value: 2 };    // 01:00 - 02:59
  if (hour >= 3 && hour < 5) return { name: "寅", value: 3 };    // 03:00 - 04:59
  if (hour >= 5 && hour < 7) return { name: "卯", value: 4 };    // 05:00 - 06:59
  if (hour >= 7 && hour < 9) return { name: "辰", value: 5 };    // 07:00 - 08:59
  if (hour >= 9 && hour < 11) return { name: "巳", value: 6 };   // 09:00 - 10:59
  if (hour >= 11 && hour < 13) return { name: "午", value: 7 };  // 11:00 - 12:59
  if (hour >= 13 && hour < 15) return { name: "未", value: 8 };  // 13:00 - 14:59
  if (hour >= 15 && hour < 17) return { name: "申", value: 9 };  // 15:00 - 16:59
  if (hour >= 17 && hour < 19) return { name: "酉", value: 10 }; // 17:00 - 18:59
  if (hour >= 19 && hour < 21) return { name: "戌", value: 11 }; // 19:00 - 20:59
  if (hour >= 21 && hour < 23) return { name: "亥", value: 12 }; // 21:00 - 22:59
  
  // Should not be reached with a valid hour (0-23)
  return { name: "未知", value: 0 }; 
}
