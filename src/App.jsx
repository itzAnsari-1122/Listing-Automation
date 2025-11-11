// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { theme } from "./theme";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import AppRoutes from "./routes/Index";
import { ThemeToaster } from "./components/ui/ThemeToaster";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeToaster />
        <MuiThemeProvider theme={theme}>
          <AppRoutes />
        </MuiThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
