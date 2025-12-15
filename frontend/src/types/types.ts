export type Financials = {
  [key: string]: { period: string; value: number }[];
};

export type PeerData = {
  ticker: string;
  financials: Financials;
};