import type { PeerData } from "../types/types";

export function removeOutliers(data: PeerData[], metric: string): PeerData[] {
  const totals = data.map((d) => {
    const entries = d.financials[metric] || [];
    return entries.reduce((sum, e) => sum + (e.value || 0), 0);
  });

  const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
  const stdDev = Math.sqrt(
    totals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / totals.length
  );

  return data.filter((_, i) => Math.abs(totals[i] - mean) <= 2 * stdDev);
}