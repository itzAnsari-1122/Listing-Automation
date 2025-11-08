import React from "react";
import AppRoutes from "./routes/Index";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import JobConfigProvider from "./context/JobConfigContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeToaster } from "./components/ui/ThemeToaster";

function App() {
  return (
    <div>
      <BrowserRouter>
        <NotificationProvider>
          <JobConfigProvider>
            <AuthProvider>
              <ThemeProvider>
                <ThemeToaster />
                <AppRoutes />
              </ThemeProvider>
            </AuthProvider>
          </JobConfigProvider>
        </NotificationProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
