import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import type { PeerData } from "../types/types";

export function getCompanyData(
  ticker: string, 
  range: "1Y" | "3Y" | "5Y",
limit:number,
offset: number) {
  return useQuery<PeerData[]>({
    queryKey: ["companyData", ticker, range, limit, offset],
    queryFn: async () => {
      const { data } = await axios.get("http://127.0.0.1:5000/api/competitors", {
        params: { ticker, range, limit, offset }
      });
      return data;
    },
    enabled: false, 
    staleTime: 1000 * 60 * 5,
  });
}