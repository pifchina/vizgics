import type { PeerData } from "../types/types";
import { removeOutliers } from "./removeOutliers";

export function transformToChartData(
  peerData: PeerData[],
  metric: string,
  isExcluded: boolean
): { [key: string]: string | number }[] {
  const filteredData = isExcluded ? removeOutliers(peerData, metric) : peerData;

  const periodSet = new Set<string>();
  for (const company of filteredData) {
    const entries = company.financials[metric] || [];
    for (const entry of entries) {
      periodSet.add(entry.period);
    }
  }

  const periods = Array.from(periodSet).sort();

  return periods.map((period) => {
    const row: { [key: string]: string | number } = { period };

    for (const company of filteredData) {
      const entry = company.financials[metric]?.find((e) => e.period === period);
      if (entry) {
        row[company.ticker] = entry.value;
      }
    }

    return row;
  });
}