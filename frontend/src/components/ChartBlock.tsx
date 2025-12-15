import { useEffect, useRef } from "react";
import {
  Paper,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import * as echarts from "echarts";
import { useNavigate } from "react-router-dom";
import { transformToChartData } from "../utils/transformToChartData";
import type { PeerData } from "../types/types";
import { formatter } from "../utils/formatter";

interface Props {
  metric: string;
  data: PeerData[];
  range: "1Y" | "3Y" | "5Y";
  selectedTickers: string[];
  isExcluded: boolean;
  toggleOutlier: (metric: string) => void;
  chartType?: "line" | "bar";
  cardColor: string;
  // cardGlow: string;
  tickerColors: Record<string, string>;
}

export default function ChartBlock({
  metric,
  data,
  range,
  selectedTickers,
  isExcluded,
  toggleOutlier,
  chartType = "line",
  cardColor,
  // cardGlow,
  tickerColors,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const chartData = transformToChartData(data, metric, isExcluded);
  const navigate = useNavigate();

  const tickers = data.map((d) => d.ticker);
  const hasData =
    chartData.length > 0 &&
    tickers.some((ticker) =>
      chartData.some((row) => typeof row[ticker] === "number")
    );

  useEffect(() => {
    if (!chartRef.current || !hasData) {
      if (chartInstance.current) {
        chartInstance.current.clear();
      }
      return;
    }

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const periods = chartData.map((d) => d.period);

    const option: echarts.EChartsOption = {
      color:
        selectedTickers.length === 0
          ? tickers.map((ticker) => tickerColors[ticker] || "#ccc")
          : tickers.map((ticker) =>
              selectedTickers.includes(ticker)
                ? tickerColors[ticker] || "#ccc"
                : "#444"
            ),

      backgroundColor: cardColor,
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const label = params[0]?.axisValue;
          const lines = params
            .map((p: any) => {
              const val = p.data ?? "n/a";
              return `${p.marker} ${p.seriesName}: ${
                val !== "n/a" ? formatter.format(val) : val
              }`;
            })
            .join("<br/>");
          return `<strong>${label}</strong><br/>${lines}`;
        },
      },
      legend: {
        data: tickers,
        textStyle: { color: "#fff" },
        type: "scroll",
        top: 10,
      },
      xAxis: {
        type: "category",
        data: periods,
        axisLabel: { color: "#ccc", rotate: 45 },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (val: number) => formatter.format(val),
          color: "#ccc",
        },
      },
      series: tickers.map((ticker) => ({
        name: ticker,
        type: chartType,
        data: chartData.map((entry) => entry[ticker] ?? null),
        stack: chartType === "bar" ? "total" : undefined,
        smooth: true,
        lineStyle: {
          width: selectedTickers.includes(ticker) ? 3 : 1.5,
        },
        itemStyle: {
          opacity:
            selectedTickers.length === 0
              ? 1
              : selectedTickers.includes(ticker)
              ? 1
              : 0.2,
        },
      })),
    };

    chartInstance.current.setOption(option);

    chartInstance.current.on("legendselectchanged", (params: any) => {
      const ticker = params.name;
      if (data.find((d) => d.ticker === ticker)) {
        navigate(`/company?ticker=${ticker}&range=${range}`);
      }
    });
  }, [chartData, selectedTickers, chartType, tickerColors]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      width="100%"
      sx={{ backgroundColor: "#111" }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 3,
          bgcolor: cardColor,
          borderRadius: 3,
          // minHeight: 480,
          display: "flex",
          flexDirection: "column",
          // boxShadow: cardGlow,
          border: "1.5px solid #fff2",
          width: "100%",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography color="#fff" variant="h6">
            {
              metric
                .replace(/([A-Z])/g, " $1") // split before uppercase letters
                .replace(/^./, (str) => str.toUpperCase()) // capitalize first letter
            }
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={isExcluded}
                onChange={() => toggleOutlier(metric)}
                sx={{ color: "#fff" }}
              />
            }
            label="Exclude Outliers"
            sx={{ color: "#fff" }}
          />
        </Box>
        <Box
          ref={chartRef}
          sx={{ width: "100%", height: 400, minWidth: 500 }}
        />
      </Paper>
    </Box>
  );
}
