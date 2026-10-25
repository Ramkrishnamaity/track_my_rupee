// Small helpers shared by several validator files.

/** 1500, 1500.5, 1500.55 → true; 1500.555 → false (tolerates float noise like 0.1 + 0.2). */
export const hasAtMostTwoDecimals = (value: number) => {
  const paise = value * 100
  return Math.abs(paise - Math.round(paise)) < 1e-6
}
