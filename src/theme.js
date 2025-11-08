// theme.js
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light", // this won’t matter; you control with data-theme
    primary: { main: "#3b82f6" }, // fallback color
    secondary: { main: "#3b82f6" },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    info: { main: "#0284c7" },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#475569",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
          transition: "background-color 0.3s ease, color 0.3s ease",
        },
        "*": { transition: "color 0.3s ease, background-color 0.3s ease" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          boxShadow: "0 4px 12px var(--color-shadow-light)",
          borderColor: "var(--color-border)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: "var(--color-primary)",
          color: "#fff",
          "&:hover": {
            backgroundColor:
              "color-mix(in oklab, var(--color-primary) 80%, black)",
          },
        },
        outlinedPrimary: {
          borderColor: "var(--color-primary)",
          color: "var(--color-primary)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor:
            "color-mix(in oklab, var(--color-primary) 8%, transparent)",
          color: "var(--color-primary)",
          "&.MuiChip-filled": {
            backgroundColor: "var(--color-primary)",
            color: "#fff",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
          "& fieldset": { borderColor: "var(--color-border)" },
          "&:hover fieldset": { borderColor: "var(--color-primary)" },
          "&.Mui-focused fieldset": { borderColor: "var(--color-primary)" },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "var(--color-text-secondary)",
          "&.Mui-focused": { color: "var(--color-primary)" },
        },
      },
    },
  },
});
