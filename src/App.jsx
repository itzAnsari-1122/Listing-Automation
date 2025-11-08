// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./Routes";
import { ThemeProvider } from "./context/ThemeContext";
import { CatalogProvider } from "./context/CatalogContext";
import { ListingProvider } from "./context/ListingContext";
import { NotificationProvider } from "./context/NotificationContext";
import { theme } from "./theme";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { AsinProvider } from "./context/AsinContext";
import { ThemeToaster } from "./components/Ui/ThemeToaster";
import { RestrictedWordProvider } from "./context/RestrictedWordContext";
import JobConfigProvider from "./context/jobConfigContext";

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
