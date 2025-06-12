import type { OracleResultName } from './types';

const ORACLE_RESULTS_MAP: OracleResultName[] = ["空亡", "大安", "留连", "速喜", "赤口", "小吉"];
// Index 0: 空亡 (Remainder 0 or 6)
// Index 1: 大安 (Remainder 1)
// Index 2: 留连 (Remainder 2)
// Index 3: 速喜 (Remainder 3)
// Index 4: 赤口 (Remainder 4)
// Index 5: 小吉 (Remainder 5)

/**
 * Calculates the oracle result based on the given parameters and type.
 * @param lunarMonth - The lunar month number. Ignored if type is "second".
 * @param lunarDay - The lunar day number.
 * @param shichenValue - The numerical value of the Shichen (1-12).
 * @param type - Specifies which oracle calculation to perform ("first" or "second").
 * @returns The name of the oracle result.
 */
export function calculateOracle(
  lunarMonth: number,
  lunarDay: number,
  shichenValue: number,
  type: "first" | "second"
): OracleResultName {
  let sum: number;

  if (type === "first") {
    // First Oracle: (Lunar Month + Lunar Day + Shichen - 2) mod 6
    sum = lunarMonth + lunarDay + shichenValue - 2;
  } else { 
    // Second Oracle: (Lunar Day + Shichen - 1) mod 6
    sum = lunarDay + shichenValue - 1;
  }

  let remainder = sum % 6;

  // JavaScript's % operator can return negative results if the dividend is negative.
  // Ensure the remainder is always non-negative (0-5).
  if (remainder < 0) {
    remainder += 6;
  }
  
  return ORACLE_RESULTS_MAP[remainder];
}
