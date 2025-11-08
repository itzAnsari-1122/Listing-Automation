import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    if (typeof window !== "undefined" && localStorage.theme) {
      return localStorage.theme;
    }
    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.theme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
