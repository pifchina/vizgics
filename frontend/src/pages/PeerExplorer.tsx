import { useState, useEffect } from "react";
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import IndustryView from "./IndustryView";
import CompanyView from "./CompanyView";
import { useNavigate, useLocation } from "react-router-dom";

// Color palette based on the reference image
const COLORS = {
  deepBlue: "#0A1931", // Deep blue background
  orange: "#FF9900", // Orange for focus/active
  card: "#122347", // Card/graph box background
  white: "#fff",
  radioUnchecked: "#bbb",
  radioChecked: "#FF9900", // Orange for checked radio
  glow: "0 0 16px 4px rgba(255,255,255,0.25)", // White glow
};

// These should match the card width in Controls.tsx
const CARD_WIDTH = { xs: "100%", md: "60vw", lg: "46vw" };
const CARD_MIN_WIDTH = 420;
const CARD_MAX_WIDTH = 900;

export default function PeerExplorer() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"industry" | "company">("industry");
  const [range, setRange] = useState<"1Y" | "3Y" | "5Y">("1Y");

  useEffect(() => {
    if (location.pathname === "/company" && mode !== "company") {
      setMode("company");
    } else if (location.pathname === "/" && mode !== "industry") {
      setMode("industry");
    }
  }, [location.pathname]);

  return (
    <Box
      sx={{
        bgcolor: COLORS.deepBlue,
        color: COLORS.white,
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        px: { xs: 1, sm: 4 },
        py: 3,
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    >
      {/* Left-aligned, but with margin from top and left to match card */}
      <Box
        sx={{
          width: CARD_WIDTH,
          minWidth: CARD_MIN_WIDTH,
          maxWidth: CARD_MAX_WIDTH,
          ml: { xs: 0, sm: 6, md: 8 }, // left margin for desktop
          mt: { xs: 2, sm: 4 }, // top margin
          mb: 2,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          mb={1}
          sx={{
            color: COLORS.white,
            letterSpacing: 1,
            textAlign: "left",
            width: "100%",
          }}
        >
          Industry Leaders Analytics
        </Typography>

        <RadioGroup
          row
          value={mode}
          onChange={(e) => {
            const newMode = e.target.value as "industry" | "company";
            setMode(newMode);
            if (newMode === "industry" && location.pathname !== "/") {
              navigate("/");
            }
            if (newMode === "company" && location.pathname !== "/company") {
              navigate("/company");
            }
          }}
        >
          <FormControlLabel
            value="industry"
            control={
              <Radio
                sx={{
                  color: COLORS.radioUnchecked,
                  "&.Mui-checked": { color: COLORS.radioChecked },
                  "& .MuiSvgIcon-root": { fontSize: 28 },
                }}
              />
            }
            label={<span style={{ color: COLORS.white }}>By Industry</span>}
          />
          <FormControlLabel
            value="company"
            control={
              <Radio
                sx={{
                  color: COLORS.radioUnchecked,
                  "&.Mui-checked": { color: COLORS.radioChecked },
                  "& .MuiSvgIcon-root": { fontSize: 28 },
                }}
              />
            }
            label={<span style={{ color: COLORS.white }}>By Company</span>}
          />
        </RadioGroup>
      </Box>

      <Box
        mt={4}
        sx={{
          width: "100%",
          maxWidth: "1400px",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowX: "hidden",
          boxSizing: "border-box",
          px: { xs: 1, sm: 2 },
        }}
      >
        {mode === "industry" && (
          <IndustryView
            range={range}
            setRange={setRange}
            cardColor={COLORS.card}
            cardGlow={COLORS.glow}
            inputFocusColor={COLORS.orange}
            backgroundColor={COLORS.deepBlue}
          />
        )}
        {mode === "company" && (
          <CompanyView
            range={range}
            setRange={setRange}
            cardColor={COLORS.card}
            cardGlow={COLORS.glow}
            inputFocusColor={COLORS.orange}
            backgroundColor={COLORS.deepBlue}
          />
        )}
      </Box>
    </Box>
  );
}
