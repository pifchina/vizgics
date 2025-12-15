import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface ControlsProps {
  mode: "industry" | "company";
  mainValue: string;
  setMainValue: (val: string) => void;
  range: string;
  setRange: (val: "1Y" | "3Y" | "5Y") => void;
  onFetch: () => void;

  showHighlight?: boolean;
  selectedTickers?: string[];
  setSelectedTickers?: (val: string[]) => void;
  availableTickers?: string[];

  showCompetitorToggle?: boolean;
  showCompetitors?: boolean;
  setShowCompetitors?: (val: boolean) => void;

  loading?: boolean;
  hasChartData?: boolean;
  inputFocusColor: string;
  backgroundColor: string;
}

export default function Controls({
  mode,
  mainValue,
  setMainValue,
  range,
  setRange,
  onFetch,
  showHighlight,
  selectedTickers,
  setSelectedTickers,
  availableTickers,
  showCompetitorToggle,
  showCompetitors,
  setShowCompetitors,
  loading = false,
  hasChartData = false,
  backgroundColor,
}: ControlsProps) {
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [rangeFocused, setRangeFocused] = useState(false);

  // Style constants
  const cardBg = "#0D0D0D";
  const cardShadow =
    "0px 12px 48px 0px rgba(80,80,80,0.32), 0px 2px 8px 0px #232347";
  const cardRadius = 18;
  const orange = "#ff9900";
  const faintGray = "#888";
  const white = "#fff";
  const descriptionGray = "#B0B8C1";
  const gradient =
    "linear-gradient(90deg, #a259ff 0%, #f24e1e 50%, #ff9900 100%)";

  const handleFetchClick = () => {
    if (!mainValue.trim()) {
      setError(
        mode === "industry"
          ? "Please enter an industry."
          : "Please enter a ticker."
      );
      return;
    }
    setError(null);
    onFetch();
  };

  // Helper for placeholder/hint
  const inputHint =
    mode === "industry"
      ? "Type an industry (e.g. Technology)"
      : "Type a ticker (e.g. AAPL)";

  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      sx={{
        background: backgroundColor,
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: { xs: "100%", md: "60vw", lg: "46vw" },
          minWidth: 420,
          maxWidth: 900,
          bgcolor: cardBg,
          borderRadius: `${cardRadius}px`,
          boxShadow: cardShadow,
          px: { xs: 2, sm: 5 },
          py: { xs: 3, sm: 5 },
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            color: white,
            fontSize: 22,
            letterSpacing: 0.2,
            mb: 1,
            lineHeight: 1.2,
          }}
        >
          {mode === "industry"
            ? "Industry Peer Comparison"
            : "Company Peer Comparison"}
        </Typography>
        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: descriptionGray,
            fontSize: 16,
            lineHeight: 1.6,
            mb: 3,
            fontWeight: 400,
          }}
        >
          {mode === "industry"
            ? "Compare key metrics across industries. Enter an industry and select a time range to see analytics for industry leaders. You can highlight specific companies after fetching data."
            : "Compare a company with its peers. Enter a ticker and select a time range to view comparative analytics. You can highlight specific companies after fetching data."}
        </Typography>

        {/* Input fields and button */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          alignItems="flex-end"
          justifyContent="center"
          width="100%"
          sx={{
            mb: 1,
          }}
        >
          <TextField
            label={mode === "industry" ? "Industry" : "Ticker"}
            value={mainValue}
            onChange={(e) => {
              setMainValue(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            size="small"
            error={!!error}
            placeholder={!inputFocused && !mainValue ? inputHint : ""}
            sx={{
              width: 220,
              input: { color: white, background: cardBg },
              label: {
                color: error ? "#ff1744" : inputFocused ? orange : faintGray,
                background: cardBg,
                px: 0.5,
                left: "-4px",
                zIndex: 2,
                transition: "color 0.2s",
                "&.Mui-focused": {
                  color: orange,
                },
              },
              "& .MuiOutlinedInput-root": {
                background: cardBg,
                "& fieldset": {
                  borderColor: error
                    ? "#ff1744"
                    : inputFocused
                    ? orange
                    : faintGray,
                  borderWidth: 2,
                  borderRadius: "8px",
                  transition: "border-color 0.2s",
                },
                "&:hover fieldset": {
                  borderColor: error ? "#ff1744" : white,
                },
                "&.Mui-focused fieldset": {
                  borderColor: error ? "#ff1744" : orange,
                  boxShadow: error
                    ? "0 0 0 2px #ff174444"
                    : `0 0 0 2px ${orange}44`,
                },
              },
              "& .MuiInputLabel-root": {
                background: cardBg,
                px: 0.5,
                left: "-4px",
                zIndex: 2,
                color: error ? "#ff1744" : inputFocused ? orange : faintGray,
                transition: "color 0.2s",
                "&.Mui-focused": {
                  color: orange,
                },
              },
            }}
            InputLabelProps={{
              shrink: inputFocused || !!mainValue,
            }}
            helperText={error}
            FormHelperTextProps={{
              sx: { color: "#ff1744", fontWeight: 600, mt: 0.5 },
            }}
          />

          <FormControl
            size="small"
            sx={{ minWidth: 120 }}
            onFocus={() => setRangeFocused(true)}
            onBlur={() => setRangeFocused(false)}
          >
            <InputLabel
              id="range-label"
              sx={{
                color: rangeFocused ? orange : faintGray,
                background: cardBg,
                px: 0.5,
                left: "-4px",
                zIndex: 2,
                transition: "color 0.2s",
                "&.Mui-focused": {
                  color: orange,
                },
              }}
            >
              Range
            </InputLabel>
            <Select
              labelId="range-label"
              value={range}
              label="Range"
              onChange={(e: SelectChangeEvent) =>
                setRange(e.target.value as "1Y" | "3Y" | "5Y")
              }
              sx={{
                color: white,
                background: cardBg,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: faintGray,
                  borderWidth: 2,
                  borderRadius: "8px",
                  transition: "border-color 0.2s",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: white,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: orange,
                },
                "& .MuiSelect-icon": {
                  color: white,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: cardBg,
                    color: white,
                    "& .MuiMenuItem-root": {
                      color: white,
                      "&.Mui-selected": {
                        background: "#333",
                      },
                      "&:hover": {
                        background: "#444",
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="1Y">1Y</MenuItem>
              <MenuItem value="3Y">3Y</MenuItem>
              <MenuItem value="5Y">5Y</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleFetchClick}
            disabled={loading}
            sx={{
              minWidth: 120,
              height: 40,
              fontWeight: 700,
              fontSize: 16,
              borderRadius: "6px", // minimal radius
              background: gradient,
              color: "#fff",
              boxShadow: "0 2px 8px 0 #a259ff44",
              // No transition, no hover, no loader, no animation
              transition: "none",
              "&:hover": {
                background: gradient,
                boxShadow: "0 2px 8px 0 #a259ff44",
              },
            }}
          >
            Fetch
          </Button>
        </Box>

        {/* Optional highlight combobox and competitor toggle */}
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mt={1}>
          {showHighlight &&
            hasChartData &&
            selectedTickers &&
            setSelectedTickers && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel
                  id="highlight-label"
                  sx={{
                    color: faintGray,
                    background: cardBg,
                    px: 0.5,
                    left: "-4px",
                    zIndex: 2,
                    transition: "color 0.2s",
                  }}
                >
                  Highlight
                </InputLabel>
                <Select
                  labelId="highlight-label"
                  multiple
                  value={selectedTickers}
                  onChange={(e) =>
                    setSelectedTickers(e.target.value as string[])
                  }
                  renderValue={(selected) => selected.join(", ")}
                  sx={{
                    color: white,
                    background: cardBg,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: faintGray,
                      borderWidth: 2,
                      borderRadius: "8px",
                      transition: "border-color 0.2s",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: white,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: orange,
                    },
                    "& .MuiSelect-icon": {
                      color: white,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: cardBg,
                        color: white,
                        "& .MuiMenuItem-root": {
                          color: white,
                          "&.Mui-selected": {
                            background: "#333",
                          },
                          "&:hover": {
                            background: "#444",
                          },
                        },
                      },
                    },
                  }}
                >
                  {availableTickers?.map((ticker) => (
                    <MenuItem key={ticker} value={ticker}>
                      {ticker}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

          {showCompetitorToggle &&
            showCompetitors !== undefined &&
            setShowCompetitors && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showCompetitors}
                    onChange={(e) => setShowCompetitors(e.target.checked)}
                    sx={{ color: white }}
                  />
                }
                label="Show Competitors"
                sx={{ color: white }}
              />
            )}
        </Box>
      </Paper>
    </Box>
  );
}
