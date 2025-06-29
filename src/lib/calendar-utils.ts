
import type { LunarDate, Shichen } from './types';

/**
 * Converts a Gregorian date to its Lunar calendar equivalent using the built-in Intl API.
 * This is a robust, dependency-free method.
 */
export function gregorianToLunar(year: number, month: number, day: number): LunarDate {
  const date = new Date(year, month - 1, day);
  
  // Create a formatter for the Chinese lunar calendar.
  // We request numeric month and day, which typically returns in "M/D" format.
  const formatter = new Intl.DateTimeFormat('zh-Hans-CN-u-ca-chinese', {
    month: 'numeric',
    day: 'numeric'
  });

  try {
    const parts = formatter.format(date).split('/');
    if (parts.length === 2) {
      const lunarMonth = parseInt(parts[0], 10);
      const lunarDay = parseInt(parts[1], 10);

      if (!isNaN(lunarMonth) && !isNaN(lunarDay)) {
        return { lunarMonth, lunarDay };
      }
    }
    // If parsing fails, throw an error to be caught by the calling function.
    throw new Error('Intl.DateTimeFormat returned an unexpected format.');
  } catch (error) {
    console.error("Lunar conversion with Intl API failed:", error);
    // Re-throw the error so the UI can display a user-friendly message.
    throw new Error("Failed to convert date to lunar calendar.");
  }
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
