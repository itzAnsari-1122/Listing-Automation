import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Popover,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { FiBell } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ sidebarOpen, setSidebarVisible }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);

  const handleBellClick = (e) => {
    console.log("notification clicked");
  };

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const currentY = window.scrollY || 0;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setHidden(currentY > lastYRef.current && currentY > 50);
          lastYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"} ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
        sx={{
          background: "var(--navbar-bg)",
          color: "var(--navbar-text)",
          width: `calc(100% - ${sidebarOpen ? "16rem" : "4rem"})`,
          transition: "margin-left 0.3s ease, width 0.3s ease",
          zIndex: 7,
        }}
      >
        <Toolbar className="flex justify-between">
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "var(--navbar-text)" }}
          >
            Listing Automation
          </Typography>

          <div className="flex items-center gap-2">
            <IconButton
              aria-label="Open notifications"
              onClick={handleBellClick}
              sx={{ color: "var(--navbar-icon)", p: 1.25 }}
            >
              <Badge badgeContent={0} color="error">
                <MdOutlineNotificationsNone size={24} />
              </Badge>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
}
