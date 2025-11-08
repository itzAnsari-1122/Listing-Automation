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
import { useNotification } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ sidebarOpen, setSidebarVisible }) {
  const { theme, toggleTheme } = useTheme();
  const { notifications, markAsReadById, unReadNotification } =
    useNotification();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  const latestUnread = useMemo(
    () =>
      Array.isArray(unReadNotification) ? unReadNotification.slice(0, 3) : [],
    [unReadNotification]
  );

  const handleBellClick = (e) => {
    if (latestUnread.length > 0) {
      setAnchorEl(e.currentTarget);
    } else {
      setSidebarVisible(true);
    }
  };
  const handleClose = () => setAnchorEl(null);

  const handleNotificationClick = async (notification) => {
    if (notification?.status === "unread" && notification?._id) {
      try {
        await markAsReadById(notification._id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    navigate(
      `/listing/${notification?.asin}?id=${notification?.marketplaceId}`
    );
  };

  const handleViewAll = () => {
    handleClose();
    setSidebarVisible(true);
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

  const typeColors = {
    success: { main: "#16A34A", light: "rgba(22,163,74,0.08)" },
    warning: { main: "#F59E0B", light: "rgba(245,158,11,0.08)" },
    error: { main: "#DC2626", light: "rgba(220,38,38,0.08)" },
    info: { main: "#3B82F6", light: "rgba(59,130,246,0.08)" },
  };

  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        } ${hidden ? "-translate-y-full" : "translate-y-0"}`}
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
              <Badge
                badgeContent={Number(notifications?.totalUnread || 0)}
                color="error"
              >
                <MdOutlineNotificationsNone size={24} />
              </Badge>
            </IconButton>

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  pb: 1,
                  width: 360,
                  maxHeight: 420,
                  overflowY: "auto",
                  borderRadius: 2,
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  fontWeight: 600,
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                Notifications
              </Box>

              {latestUnread.length === 0 ? (
                <Box
                  sx={{
                    p: 2,
                    textAlign: "center",
                    fontSize: "0.9rem",
                    color: "var(--color-muted)",
                  }}
                >
                  No notifications yet 🚀
                </Box>
              ) : (
                <>
                  {latestUnread.map((n) => {
                    const isUnread = n?.status === "unread";
                    const colors = typeColors[n?.type] || typeColors.info;

                    return (
                      <Box
                        key={n?._id || n?.id}
                        onClick={() => handleNotificationClick(n)}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          p: 1.5,
                          mx: 1,
                          mb: 1,
                          borderRadius: "12px",
                          position: "relative",
                          transition: "all 0.2s ease",
                          backgroundColor: colors.light,
                          borderLeft: `3px solid ${colors.main}`,
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: `0 4px 12px ${colors.main}40`,
                          },
                        }}
                      >
                        {isUnread && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: colors.main,
                            }}
                          />
                        )}

                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: "1rem",
                            backgroundColor: colors.main,
                            color: "#fff",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          <FiBell />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "var(--color-text)",
                              mb: 0.2,
                              fontSize: "0.92rem",
                              lineHeight: 1.2,
                            }}
                          >
                            {n?.title}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              color: "var(--color-muted)",
                              lineHeight: 1.35,
                            }}
                          >
                            {n?.message}
                          </Typography>

                          {n?.createdAt && (
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                color: "var(--color-muted)",
                                mt: 0.4,
                                fontStyle: "italic",
                              }}
                            >
                              {dateFormatter.format(new Date(n.createdAt))}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}

                  <Box sx={{ textAlign: "center", mt: 1.5 }}>
                    <button
                      onClick={handleViewAll}
                      className="mx-auto w-[85%] rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700"
                    >
                      View All Notifications
                    </button>
                  </Box>
                </>
              )}
            </Popover>

            <IconButton
              aria-label="Toggle theme"
              onClick={toggleTheme}
              sx={{ color: "var(--navbar-icon)", p: 1.25 }}
            >
              {theme === "light" ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
}
