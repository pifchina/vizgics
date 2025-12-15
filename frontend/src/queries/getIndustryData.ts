import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import type { PeerData } from "../types/types";

const FIVE_MINUTES = 1000 * 60 * 5;

export function getIndustryData(
  industry: string,
  range: "1Y" | "3Y" | "5Y",
  limit: number,
  offset: number
) {
  return useQuery<PeerData[]>({
    queryKey: ["industryData", industry, range, limit, offset],
    queryFn: async () => {
      const { data } = await axios.get("http://127.0.0.1:5000/api/fmp-data", {
        params: { industry, range, limit, offset }
      });
      return data;
    },
    enabled: false,
    staleTime: FIVE_MINUTES,
  });
}

