import { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from "@mui/material";
import Controls from "../components/Controls";
import ChartBlock from "../components/ChartBlock";
import { getCompanyData } from "../queries/getCompanyData";
import type { PeerData } from "../types/types";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useLocation } from "react-router-dom";

const LIMIT = 6; // 📌 Dobavljamo 6 metrika po fetchu

export default function CompanyView({
  range,
  setRange,
  cardColor,
  // cardGlow,
  inputFocusColor,
  backgroundColor,
}: {
  range: "1Y" | "3Y" | "5Y";
  setRange: (val: "1Y" | "3Y" | "5Y") => void;
  cardColor: string;
  cardGlow: string;
  inputFocusColor: string;
  backgroundColor: string;
}) {
  const [ticker, setTicker] = useState("");
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [excludedMetrics, setExcludedMetrics] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const [offset, setOffset] = useState(0); // 📌 Offset za paginaciju metrika
  const [companyData, setCompanyData] = useState<PeerData[]>([]);
  const [shouldFetch, setShouldFetch] = useState(false); // 📌 Signal za novi fetch
  const fetchInProgress = useRef(false); // 📌 Blokira paralelne fetcheve
  const [tickerColors, setTickerColors] = useState<Record<string, string>>({});

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlTicker = params.get("ticker");
    const urlRange = params.get("range") as "1Y" | "3Y" | "5Y";

    if (urlTicker && urlTicker !== ticker) {
      setTicker(urlTicker);
    }

    if (urlRange && urlRange !== range) {
      setRange(urlRange);
    }
  }, [location.search]);

  const {
    data = [],
    refetch,
    isFetching,
  } = getCompanyData(ticker, range, LIMIT, offset);

  const validData = useMemo(
    () =>
      (companyData ?? []).filter((d) => Object.keys(d.financials).length > 0),
    [companyData]
  );

  useEffect(() => {
    if (offset === 0 || offset >= 2) return; // 📌 Ograničavamo na dva paginirana fetch-a
    setShouldFetch(true);
  }, [offset]);

  useEffect(() => {
    if (shouldFetch && !isFetching && !fetchInProgress.current) {
      fetchInProgress.current = true;
      refetch().finally(() => {
        fetchInProgress.current = false;
        setShouldFetch(false);
      });
    }
  }, [shouldFetch, isFetching]);

  useEffect(() => {
    if (data.length === 0) return;

    setCompanyData((prev) => {
      const map = new Map(prev.map((d) => [d.ticker, d]));
      for (const d of data) {
        const existing = map.get(d.ticker);
        map.set(d.ticker, {
          ticker: d.ticker,
          financials: {
            ...existing?.financials,
            ...d.financials,
          },
        });
      }
      return Array.from(map.values());
    });
  }, [data]);

  // 🎨 Generisanje boja za tikere
  useEffect(() => {
    const distinctTickers = validData.map((d) => d.ticker);
    const missing = distinctTickers.filter((t) => !(t in tickerColors));

    if (missing.length === 0) return;

    const generated: Record<string, string> = {};
    let index = Object.keys(tickerColors).length;

    for (const t of missing) {
      generated[t] = `hsl(${(index * 67) % 360}, 70%, 60%)`;
      index++;
    }

    setTickerColors((prev) => ({ ...prev, ...generated }));
  }, [validData, tickerColors]);

  // 📦 Lazy-load logika na scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        !isFetching &&
        !fetchInProgress.current &&
        offset < 2
      ) {
        setOffset(1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, offset]);

  const toggleOutlier = (metric: string) => {
    setExcludedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const allMetrics = Array.from(
    new Set(validData.flatMap((d) => Object.keys(d.financials)))
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1400px",
        mx: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: backgroundColor,
      }}
    >
      <Controls
        mode="company"
        mainValue={ticker}
        setMainValue={(val) => {
          setTicker(val);
          setOffset(0); // 📌 Reset pri promeni tickera
          setCompanyData([]);
        }}
        range={range}
        setRange={setRange}
        onFetch={() => {
          setOffset(0);
          setCompanyData([]);
          refetch();
        }}
        showHighlight
        selectedTickers={selectedTickers}
        setSelectedTickers={setSelectedTickers}
        availableTickers={validData.map((d) => d.ticker)}
        loading={isFetching}
        hasChartData={validData.length > 0}
        inputFocusColor={inputFocusColor}
        backgroundColor={backgroundColor}
        showCompetitorToggle={false}
        showCompetitors={true}
        setShowCompetitors={() => {}}
      />

      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        overflow="hidden"
        minHeight={isFetching && offset === 0 ? "60vh" : "auto"}
      >
        {isFetching && offset === 0 && (
          <CircularProgress sx={{ color: "#FF9900", mt: 4 }} />
        )}

        {!isFetching && validData.length > 0 && (
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(_e, val) => {
              if (val === "line" || val === "bar") {
                setChartType(val);
              }
            }}
            sx={{
              mb: 3,
              bgcolor: "#111",
              borderRadius: 2,
              border: "1px solid #555",
            }}
          >
            <ToggleButton value="line" sx={{ color: "#fff" }}>
              <ShowChartIcon sx={{ mr: 1 }} />
              Line
            </ToggleButton>
            <ToggleButton value="bar" sx={{ color: "#fff" }}>
              <BarChartIcon sx={{ mr: 1 }} />
              Bar
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        <Grid container spacing={2}>
          {allMetrics.map((metric: string) => (
            <Grid key={metric} size={{ xs: 12, lg: 6 }}>
              <ChartBlock
                metric={metric}
                data={validData}
                range={range}
                selectedTickers={selectedTickers}
                isExcluded={excludedMetrics.includes(metric)}
                toggleOutlier={toggleOutlier}
                cardColor={cardColor}
                // cardGlow={cardGlow}
                chartType={chartType}
                tickerColors={tickerColors}
              />
            </Grid>
          ))}
        </Grid>

        {(isFetching || shouldFetch) && offset > 0 && (
          <CircularProgress sx={{ color: "#FF9900", mt: 4, mb: 6 }} />
        )}
      </Box>
    </Box>
  );
}
