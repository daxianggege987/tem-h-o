import type { OracleResultName } from './types';

export const ORACLE_RESULTS_MAP: OracleResultName[] = ["空亡", "大安", "留连", "速喜", "赤口", "小吉"];
// Index 0: 空亡 (Remainder 0 - Mapped from original text as first element)
// Index 1: 大安 (Remainder 1)
// Index 2: 留连 (Remainder 2)
// Index 3: 速喜 (Remainder 3)
// Index 4: 赤口 (Remainder 4)
// Index 5: 小吉 (Remainder 5)

// The calculateOracle function has been removed as its logic 
// is now handled directly in OracleDisplay.tsx for improved clarity 
// regarding the two distinct calculation steps.
