// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { theme } from "./theme";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { ThemeToaster } from "./components/ui/ThemeToaster";
import { ThemeProvider } from "./context/ThemeContext";
import { ListingProvider } from "./context/ListingContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AsinProvider } from "./context/AsinContext";
import { RestrictedWordProvider } from "./context/RestrictedWordContext";
import JobConfigProvider from "./context/JobConfigContext";
import AppRoutes from "./routes/index";

export default function App() {
  const { getProfileService } = useAuth();
  // ✅ INIT
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      getProfileService()
        .catch(() => logout())
        .finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, [token]);
  return (
    <BrowserRouter>
      <AuthProvider>
        <ListingProvider>
          <NotificationProvider>
            <AsinProvider>
              <RestrictedWordProvider>
                <JobConfigProvider>
                  <ThemeToaster />
                  <ThemeProvider>
                    <MuiThemeProvider theme={theme}>
                      <AppRoutes />
                    </MuiThemeProvider>
                  </ThemeProvider>
                </JobConfigProvider>
              </RestrictedWordProvider>
            </AsinProvider>
          </NotificationProvider>
        </ListingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
