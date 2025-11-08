// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { theme } from "./theme";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import AppRoutes from "./routes/Index";
import { ThemeToaster } from "./components/Ui/ThemeToaster";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeToaster />
        <ThemeProvider>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <AppRoutes />
          </MuiThemeProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
