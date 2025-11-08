// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CatalogProvider } from "./context/CatalogContext";
import { ListingProvider } from "./context/ListingContext";
import { NotificationProvider } from "./context/NotificationContext";
import { theme } from "./theme";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { AsinProvider } from "./context/AsinContext";
import { RestrictedWordProvider } from "./context/RestrictedWordContext";
import AppRoutes from "./routes/Index";
import JobConfigProvider from "./context/JobConfigContext";
import { ThemeToaster } from "./components/Ui/ThemeToaster";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CatalogProvider>
          <ListingProvider>
            <AsinProvider>
              <NotificationProvider>
                <RestrictedWordProvider>
                  <JobConfigProvider>
                    <ThemeToaster />
                    <ThemeProvider>
                      <MuiThemeProvider theme={theme}>
                        <CssBaseline />
                        <AppRoutes />
                      </MuiThemeProvider>
                    </ThemeProvider>
                  </JobConfigProvider>
                </RestrictedWordProvider>
              </NotificationProvider>
            </AsinProvider>
          </ListingProvider>
        </CatalogProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
