// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { theme } from "./theme";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import AppRoutes from "./routes/Index";
import { ThemeToaster } from "./components/ui/ThemeToaster";
import { ThemeProvider } from "./context/ThemeContext";
import { ListingProvider } from "./context/ListingContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ListingProvider>
          <ThemeToaster />
          <ThemeProvider>
            <MuiThemeProvider theme={theme}>
              <AppRoutes />
            </MuiThemeProvider>
          </ThemeProvider>
        </ListingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
