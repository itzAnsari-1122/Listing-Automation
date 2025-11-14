import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  FiBell,
  FiCheck,
  FiFilter,
  FiX,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiChevronDown,
} from "react-icons/fi";
import {
  Badge,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ThemeChip from "../components/ui/ThemeChip";
import { useNavigate } from "react-router-dom";
import { CountryOptions } from "../utils";
import ThemeLoader from "../components/ui/ThemeLoader";
import ThemeButton from "../components/ui/ThemeButton";
import { useNotification } from "../context/NotificationContext";
import ThemeSelectField from "../components/ui/ThemeSelectField";

const timeAgo = (date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const dayKey = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const strip = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const delta = (strip(now) - strip(d)) / (24 * 60 * 60 * 1000);
  if (delta === 0) return "Today";
  if (delta === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const groupByDay = (items = []) =>
  items.reduce((acc, n) => {
    const k = dayKey(n.createdAt);
    if (!acc[k]) acc[k] = [];
    acc[k].push(n);
    return acc;
  }, {});

const typeColor = (t) =>
  t === "success"
    ? "#16A34A"
    : t === "warning"
      ? "#F59E0B"
      : t === "error"
        ? "#DC2626"
        : "#3B82F6";

// Custom Chip component that properly uses CSS variables
const CustomChip = ({
  label,
  onDelete,
  tone = "primary",
  variant = "filled",
  size = "sm",
  ...props
}) => {
  const getChipStyles = () => {
    const baseStyles = {
      height: size === "sm" ? "22px" : "24px",
      fontSize: "0.7rem",
      fontWeight: 600,
      borderRadius: "6px",
      border: "1px solid",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "0 8px",
      cursor: onDelete ? "pointer" : "default",
    };

    const toneColors = {
      primary: {
        bg: "var(--color-primary)",
        text: "#ffffff",
        border: "var(--color-primary)",
      },
      success: {
        bg: "var(--color-success)",
        text: "#ffffff",
        border: "var(--color-success)",
      },
      danger: {
        bg: "var(--color-danger)",
        text: "#ffffff",
        border: "var(--color-danger)",
      },
      warning: {
        bg: "var(--color-warning)",
        text: "#ffffff",
        border: "var(--color-warning)",
      },
      neutral: {
        bg: "var(--color-surface-secondary)",
        text: "var(--color-text)",
        border: "var(--color-border)",
      },
    };

    const colors = toneColors[tone] || toneColors.primary;

    if (variant === "outline") {
      return {
        ...baseStyles,
        backgroundColor: "transparent",
        color: colors.border,
        borderColor: colors.border,
      };
    }

    return {
      ...baseStyles,
      backgroundColor: colors.bg,
      color: colors.text,
      borderColor: colors.border,
    };
  };

  return (
    <div style={getChipStyles()} {...props}>
      <span>{label}</span>
      {onDelete && (
        <FiX
          size={12}
          style={{
            cursor: "pointer",
            opacity: 0.8,
          }}
          onClick={onDelete}
        />
      )}
    </div>
  );
};

// Custom Icon Button that uses CSS variables
const CustomIconButton = ({
  children,
  onClick,
  title,
  size = "sm",
  ...props
}) => {
  const buttonSize = size === "sm" ? "32px" : "40px";

  return (
    <Tooltip title={title}>
      <button
        onClick={onClick}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: "8px",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "var(--color-primary-light)";
          e.target.style.borderColor = "var(--color-primary)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "var(--color-surface)";
          e.target.style.borderColor = "var(--color-border)";
        }}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Delete",
  confirmButtonColor = "error",
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-confirmation-dialog"
      PaperProps={{
        sx: {
          borderRadius: "12px",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          minWidth: "400px",
          maxWidth: "500px",
        },
      }}
    >
      <DialogTitle
        id="delete-confirmation-dialog"
        sx={{
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "var(--color-text)",
          borderBottom: "1px solid var(--color-border)",
          pb: 2,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Typography
          sx={{
            color: "var(--color-text)",
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <ThemeButton
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
            "&:hover": {
              borderColor: "var(--color-primary)",
              backgroundColor: "var(--color-primary-light)",
            },
          }}
        >
          Cancel
        </ThemeButton>
        <ThemeButton
          onClick={onConfirm}
          variant="contained"
          color={confirmButtonColor}
          sx={{
            borderRadius: "8px",
            backgroundColor:
              confirmButtonColor === "error"
                ? "var(--color-danger)"
                : "var(--color-primary)",
            "&:hover": {
              backgroundColor:
                confirmButtonColor === "error"
                  ? "var(--color-danger-dark)"
                  : "var(--color-primary-dark)",
            },
          }}
        >
          {confirmButtonText}
        </ThemeButton>
      </DialogActions>
    </Dialog>
  );
};

export default function NotificationSidebar({
  sidebarVisible,
  setSidebarVisible,
}) {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const {
    notifications,
    fetchNotifications,
    markAsReadById,
    markAllAsRead,
    deleteReadNotificationService,
    deleteAllNotificationService,
    setPageSize,
    pageSize,
    selectedCountries,
    setSelectedCountries,
  } = useNotification();

  const state = notifications ?? {
    data: [],
    loading: false,
    hasMore: false,
    page: 1,
    total: 0,
    totalItems: 0,
    totalUnread: 0,
  };

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [resolvedFilter, setResolvedFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [lastRefreshedAt, setLastRefreshedAt] = useState(Date.now());
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filtersAnchorEl, setFiltersAnchorEl] = useState(null);

  const [isInteractingWithFilters, setIsInteractingWithFilters] =
    useState(false);

  // Modal states
  const [deleteReadModalOpen, setDeleteReadModalOpen] = useState(false);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);

  const sidebarWidth = useMemo(() => {
    if (isMobile) return "100vw";
    if (isTablet) return "380px";
    return "400px";
  }, [isMobile, isTablet]);

  useEffect(() => {
    const id = setTimeout(
      () => setDebouncedQuery(query.trim().toLowerCase()),
      250,
    );
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isInteractingWithFilters) {
        setIsInteractingWithFilters(false);
        return;
      }

      if (
        sidebarVisible &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarVisible(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape" && sidebarVisible) setSidebarVisible(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [sidebarVisible, setSidebarVisible, isInteractingWithFilters]);

  useEffect(() => {
    const initialPageSize = 10;
    if (pageSize > initialPageSize) {
      setPageSize(initialPageSize);
    }

    fetchNotifications(1, typeFilter, statusFilter, true, selectedCountries)
      .catch(() => {})
      .finally(() => setLastRefreshedAt(Date.now()));
  }, [typeFilter, statusFilter, selectedCountries]);

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const bottom = scrollHeight - scrollTop <= clientHeight + 50;

      if (bottom && !isLoadingMore && !state.loading && state.hasMore) {
        setIsLoadingMore(true);

        const newPageSize = pageSize + 10;
        setPageSize(newPageSize);

        setTimeout(() => {
          setIsLoadingMore(false);
        }, 1000);
      }
    },
    [isLoadingMore, state.loading, state.hasMore, pageSize, setPageSize],
  );

  const handleNotificationClick = async (n) => {
    try {
      if (n.status === "unread") {
        await markAsReadById(n?._id);
      }
      if (n?.asin && n?.marketplaceId) {
        navigate(`/listing/${n?.asin}?id=${n?.marketplaceId}`);
      }
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {}
  };

  const handleRefresh = async () => {
    setPageSize(10);
    await fetchNotifications(
      1,
      typeFilter,
      statusFilter,
      true,
      selectedCountries,
    )
      .catch(() => {})
      .finally(() => setLastRefreshedAt(Date.now()));
  };

  const handleDeleteReadClick = () => {
    const readCount =
      state?.totalRead ??
      Math.max((totalNotifications || 0) - (totalUnread || 0), 0);
    if (readCount <= 0) return;
    setDeleteReadModalOpen(true);
  };

  const handleDeleteAllClick = () => {
    if ((totalNotifications || 0) === 0) return;
    setDeleteAllModalOpen(true);
  };

  const handleDeleteReadConfirm = async () => {
    try {
      await deleteReadNotificationService();
      await fetchNotifications(
        1,
        typeFilter,
        statusFilter,
        true,
        selectedCountries,
      );
      setDeleteReadModalOpen(false);
    } catch (err) {
    } finally {
      setLastRefreshedAt(Date.now());
    }
  };

  const handleDeleteAllConfirm = async () => {
    try {
      await deleteAllNotificationService();
      await fetchNotifications(
        1,
        typeFilter,
        statusFilter,
        true,
        selectedCountries,
      );
      setDeleteAllModalOpen(false);
    } catch (err) {
    } finally {
      setLastRefreshedAt(Date.now());
    }
  };

  const handleFilterSelect = useCallback((filterType, value) => {
    switch (filterType) {
      case "status":
        setStatusFilter(value);
        break;
      case "type":
        setTypeFilter(value);
        break;
      case "sort":
        setSortOrder(value);
        break;
      case "clear":
        setStatusFilter("all");
        setTypeFilter("all");
        setResolvedFilter("all");
        setSortOrder("desc");
        setQuery("");
        break;
      default:
        break;
    }
    setFiltersAnchorEl(null);
  }, []);

  const totalNotifications =
    state?.totalItems ?? state?.total ?? state?.data?.length ?? 0;
  const totalUnread =
    state?.totalUnread ??
    (Array.isArray(state?.data)
      ? state.data.filter((n) => n.status === "unread").length
      : 0);

  const readCount =
    state?.totalRead ??
    Math.max((totalNotifications || 0) - (totalUnread || 0), 0);

  const locallyFiltered = useMemo(() => {
    let arr = state?.data || [];

    if (statusFilter !== "all") {
      arr = arr.filter((n) => n.status === statusFilter);
    }

    if (resolvedFilter !== "all") {
      const wantResolved = resolvedFilter === "resolved";
      arr = arr.filter((n) => !!n.resolved === wantResolved);
    }

    if (typeFilter !== "all") {
      arr = arr.filter((n) => (n.type || "info") === typeFilter);
    }

    if (debouncedQuery) {
      arr = arr.filter((n) => {
        const t = `${n.title ?? ""}`.toLowerCase();
        const m = `${n.message ?? ""}`.toLowerCase();
        const a = `${n.asin ?? ""}`.toLowerCase();
        return (
          t.includes(debouncedQuery) ||
          m.includes(debouncedQuery) ||
          a.includes(debouncedQuery)
        );
      });
    }

    arr = [...arr].sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt),
    );

    return arr;
  }, [
    state?.data,
    statusFilter,
    resolvedFilter,
    typeFilter,
    debouncedQuery,
    sortOrder,
  ]);

  const grouped = useMemo(() => groupByDay(locallyFiltered), [locallyFiltered]);

  const markDayAsRead = async (items) => {
    const unread = items.filter((n) => n.status === "unread");
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((n) => markAsReadById(n._id)));
    } catch (e) {}
  };

  const shownCount = locallyFiltered.length;

  const handleFilterInteractionStart = () => {
    setIsInteractingWithFilters(true);
  };

  const handleFilterInteractionEnd = () => {
    setTimeout(() => {
      setIsInteractingWithFilters(false);
    }, 100);
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className="fixed right-0 top-0 z-50 h-full transform shadow-2xl transition-transform duration-300"
        style={{
          width: sidebarWidth,
          left: isMobile ? "0" : "auto",
          borderLeft: isMobile ? "none" : "1px solid var(--color-border)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          transform: sidebarVisible ? "translateX(0)" : "translateX(100%)",
        }}
        aria-label="Notifications sidebar"
      >
        {/* Header Section */}
        <div
          className="sticky top-0 z-30 border-b px-3 py-2 shadow-sm"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                badgeContent={totalUnread}
                color={totalUnread > 0 ? "error" : "default"}
                overlap="circular"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "#fff",
                  }}
                >
                  <FiBell size={16} />
                </div>
              </Badge>
              <div>
                <h2
                  className="text-base font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  Notifications
                </h2>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Stay on top of your updates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  aria-label="refresh"
                  onClick={handleRefresh}
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  <FiRefreshCw size={14} />
                </IconButton>
              </Tooltip>
              {!isMobile && (
                <Tooltip
                  title={
                    totalUnread > 0 ? "Mark all as read" : "All caught up!"
                  }
                >
                  <span>
                    <button
                      onClick={handleMarkAllRead}
                      disabled={totalUnread === 0}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-primary)",
                        backgroundColor:
                          totalUnread > 0
                            ? "var(--color-primary)"
                            : "transparent",
                        color:
                          totalUnread > 0 ? "#fff" : "var(--color-primary)",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        cursor: totalUnread > 0 ? "pointer" : "not-allowed",
                        opacity: totalUnread > 0 ? 1 : 0.6,
                      }}
                    >
                      Mark all
                    </button>
                  </span>
                </Tooltip>
              )}

              <Tooltip title="Close">
                <IconButton
                  size="small"
                  aria-label="close"
                  onClick={() => setSidebarVisible(false)}
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  <FiX size={14} />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* Stats Row */}
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              justifyContent: "space-between",
              alignItems: "center",
              pt: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              <CustomChip
                label={`Total: ${totalNotifications}`}
                tone="primary"
                variant="outline"
              />
              <CustomChip
                label={`Unread: ${totalUnread}`}
                tone={totalUnread > 0 ? "danger" : "success"}
                variant={totalUnread > 0 ? "filled" : "outline"}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Delete read notifications">
                <span>
                  <button
                    onClick={handleDeleteReadClick}
                    disabled={readCount <= 0}
                    style={{
                      padding: isMobile ? "4px" : "4px 8px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      height: "24px",
                      minWidth: isMobile ? "32px" : "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: readCount <= 0 ? "not-allowed" : "pointer",
                      opacity: readCount <= 0 ? 0.5 : 1,
                    }}
                  >
                    {isMobile ? <FiTrash2 size={12} /> : "Read"}
                  </button>
                </span>
              </Tooltip>

              <Tooltip title="Delete all notifications">
                <span>
                  <button
                    onClick={handleDeleteAllClick}
                    disabled={(totalNotifications || 0) === 0}
                    style={{
                      padding: isMobile ? "4px" : "4px 8px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-danger)",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-danger)",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      height: "24px",
                      minWidth: isMobile ? "32px" : "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor:
                        (totalNotifications || 0) === 0
                          ? "not-allowed"
                          : "pointer",
                      opacity: (totalNotifications || 0) === 0 ? 0.5 : 1,
                    }}
                  >
                    {isMobile ? <FiTrash2 size={12} /> : "All"}
                  </button>
                </span>
              </Tooltip>
            </Box>
          </Box>

          {/* Country Filter */}
          <Box sx={{ mt: 1 }} onClick={handleFilterInteractionStart}>
            <ThemeSelectField
              countriesFlags
              name="countryFilter"
              multiple
              value={selectedCountries}
              onChange={(values, payload) => {
                setSelectedCountries(values);
                const marketplaceIds = payload.map(
                  (p) => p.marketplaceId || p.value,
                );
              }}
              onOpen={() => handleFilterInteractionStart()}
              onClose={() => handleFilterInteractionEnd()}
              sx={{
                borderRadius: "8px",
                "& .MuiInputBase-root": {
                  height: "32px",
                  fontSize: "0.8rem",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  borderColor: "var(--color-border)",
                },
              }}
              options={CountryOptions}
              placeholder="Select countries"
              width="100%"
              borderRadius={"8px"}
            />
          </Box>

          {/* Search and Filter Row */}
          <Box
            sx={{ mt: 1, display: "flex", gap: 1 }}
            onClick={handleFilterInteractionStart}
          >
            <Paper
              variant="outlined"
              sx={{
                px: 1,
                py: 0.25,
                display: "flex",
                alignItems: "center",
                borderRadius: "8px",
                height: "32px",
                flex: 1,
                minWidth: 0,
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <FiSearch
                className="mx-1 opacity-70"
                size={14}
                style={{ color: "var(--color-muted)" }}
              />
              <InputBase
                placeholder="Search title, message, or ASIN…"
                inputProps={{ "aria-label": "Search notifications" }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleFilterInteractionStart}
                onBlur={handleFilterInteractionEnd}
                sx={{
                  flex: 1,
                  fontSize: "0.8rem",
                  color: "var(--color-text)",
                  "& input": {
                    padding: "4px 0",
                    "&::placeholder": {
                      color: "var(--color-muted)",
                      opacity: 1,
                    },
                  },
                }}
              />
              {query && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setQuery("");
                    handleFilterInteractionEnd();
                  }}
                  aria-label="clear search"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  <FiX size={14} />
                </IconButton>
              )}
            </Paper>

            <CustomIconButton
              onClick={(e) => {
                handleFilterInteractionStart();
                setFiltersAnchorEl(e.currentTarget);
              }}
              title="Filter options"
            >
              <FiFilter size={14} />
            </CustomIconButton>

            <Menu
              anchorEl={filtersAnchorEl}
              open={Boolean(filtersAnchorEl)}
              onClose={() => {
                setFiltersAnchorEl(null);
                handleFilterInteractionEnd();
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleFilterInteractionStart}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: "8px",
                  minWidth: 160,
                  maxWidth: isMobile ? "280px" : "none",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  "& .MuiMenuItem-root": {
                    fontSize: "0.8rem",
                    color: "var(--color-text)",
                    "&:hover": {
                      backgroundColor: "var(--color-primary-light)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "var(--color-primary-light)",
                    },
                  },
                },
              }}
            >
              <MenuItem
                disabled
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-muted)",
                }}
              >
                Status
              </MenuItem>
              {["all", "unread", "read"].map((status) => (
                <MenuItem
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFilterSelect("status", status);
                    handleFilterInteractionEnd();
                  }}
                  selected={statusFilter === status}
                  sx={{ fontSize: "0.8rem" }}
                >
                  <ListItemText>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </ListItemText>
                  {statusFilter === status && <FiCheck size={14} />}
                </MenuItem>
              ))}

              <Divider />

              <MenuItem
                disabled
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-muted)",
                }}
              >
                Type
              </MenuItem>
              {["all", "success", "error", "info"].map((type) => (
                <MenuItem
                  key={type}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFilterSelect("type", type);
                    handleFilterInteractionEnd();
                  }}
                  selected={typeFilter === type}
                  sx={{ fontSize: "0.8rem" }}
                >
                  <ListItemText>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </ListItemText>
                  {typeFilter === type && <FiCheck size={14} />}
                </MenuItem>
              ))}

              <Divider />

              <MenuItem
                disabled
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-muted)",
                }}
              >
                Sort
              </MenuItem>
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterSelect(
                    "sort",
                    sortOrder === "desc" ? "asc" : "desc",
                  );
                  handleFilterInteractionEnd();
                }}
                sx={{ fontSize: "0.8rem" }}
              >
                <ListItemText>
                  {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                </ListItemText>
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterSelect("clear");
                  handleFilterInteractionEnd();
                }}
                sx={{ fontSize: "0.8rem", color: "var(--color-danger)" }}
              >
                <ListItemText>Clear All Filters</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </div>

        {/* Active filters and Date grouping section */}
        <Box
          sx={{
            px: 2,
            py: 1,
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {/* Active Filters */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1">
              <span
                className="text-xs font-medium opacity-80"
                style={{ color: "var(--color-muted)" }}
              >
                Active:
              </span>
              {statusFilter !== "all" && (
                <CustomChip
                  label={`Status: ${statusFilter}`}
                  tone="primary"
                  variant="filled"
                  onDelete={() => {
                    setStatusFilter("all");
                    handleFilterInteractionStart();
                    setTimeout(handleFilterInteractionEnd, 100);
                  }}
                />
              )}
              {typeFilter !== "all" && (
                <CustomChip
                  label={`Type: ${typeFilter}`}
                  tone={
                    typeFilter === "success"
                      ? "success"
                      : typeFilter === "error"
                        ? "danger"
                        : "primary"
                  }
                  variant="filled"
                  onDelete={() => {
                    setTypeFilter("all");
                    handleFilterInteractionStart();
                    setTimeout(handleFilterInteractionEnd, 100);
                  }}
                />
              )}
              {sortOrder !== "desc" && (
                <CustomChip
                  label="Oldest First"
                  tone="neutral"
                  variant="filled"
                  onDelete={() => {
                    setSortOrder("desc");
                    handleFilterInteractionStart();
                    setTimeout(handleFilterInteractionEnd, 100);
                  }}
                />
              )}
              {query && (
                <CustomChip
                  label={`Search: ${query}`}
                  tone="warning"
                  variant="filled"
                  onDelete={() => {
                    setQuery("");
                    handleFilterInteractionStart();
                    setTimeout(handleFilterInteractionEnd, 100);
                  }}
                />
              )}
              {statusFilter === "all" &&
                typeFilter === "all" &&
                sortOrder === "desc" &&
                !query && (
                  <span
                    className="text-xs italic"
                    style={{ color: "var(--color-muted)" }}
                  >
                    No filters active
                  </span>
                )}
            </div>
          </div>

          {/* Date Grouping Headers */}
          {!state.loading && locallyFiltered.length > 0 && (
            <div>
              {Object.entries(grouped).map(([label, items]) => {
                const anyUnread = items.some((i) => i.status === "unread");
                const isTodayChip = label === "Today";
                return (
                  <Box
                    key={label}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        display: "inline-block",
                        borderRadius: isTodayChip ? "16px" : "4px",
                        backgroundColor: isTodayChip
                          ? "var(--color-primary-light)"
                          : "var(--color-surface-secondary)",
                        color: isTodayChip
                          ? "var(--color-primary)"
                          : "var(--color-text-secondary)",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        border: isTodayChip
                          ? "1px solid var(--color-primary-light)"
                          : "1px solid var(--color-border)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      {label}
                    </Typography>
                    <div>
                      <Tooltip
                        title={anyUnread ? "Mark day as read" : "All read"}
                      >
                        <span>
                          <CustomChip
                            label="Mark day"
                            onClick={() => markDayAsRead(items)}
                            disabled={!anyUnread}
                            variant="outline"
                            tone={anyUnread ? "primary" : "neutral"}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  </Box>
                );
              })}
            </div>
          )}
        </Box>

        {/* Notification list */}
        <div
          className="h-[calc(100%-180px)] space-y-3 overflow-y-auto scroll-smooth p-3"
          onScroll={handleScroll}
          role="list"
          aria-label="Notification list"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          {state.loading && !state.data.length && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Box key={i} sx={{ p: 1.5, mx: 1 }}>
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={18}
                    sx={{ bgcolor: "var(--color-surface-secondary)" }}
                  />
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={14}
                    sx={{ bgcolor: "var(--color-surface-secondary)" }}
                  />
                  <Skeleton
                    variant="rectangular"
                    height={1}
                    sx={{ bgcolor: "var(--color-border)" }}
                  />
                </Box>
              ))}
            </div>
          )}

          {!state.loading && locallyFiltered.length === 0 && (
            <div
              className="flex h-full flex-col items-center justify-center py-16 text-center"
              style={{ color: "var(--color-muted)" }}
            >
              <div className="mb-3 text-5xl">🔔</div>
              <p className="text-lg font-medium">No matches</p>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                Try clearing filters or adjusting your search.
              </p>
            </div>
          )}

          {!state.loading && locallyFiltered.length > 0 && (
            <>
              {Object.entries(grouped).map(([label, items]) => (
                <div key={label}>
                  {items.map((n) => {
                    const isUnread = n.status === "unread";
                    const stripe = typeColor(n.type || "info");

                    return (
                      <Box
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        role="listitem"
                        aria-live={isUnread ? "assertive" : "polite"}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          p: 1.5,
                          mx: 1,
                          mb: 1.25,
                          borderRadius: "8px",
                          position: "relative",
                          cursor: "pointer",
                          bgcolor: isUnread
                            ? "var(--color-primary-light)"
                            : "transparent",
                          borderLeft: `3px solid ${stripe}`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 18px var(--color-shadow)",
                          },
                        }}
                      >
                        {isUnread && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 12,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: stripe,
                              boxShadow: `0 0 0 0 ${stripe}`,
                              animation: "pulseDot 1.8s ease-out infinite",
                              "@keyframes pulseDot": {
                                "0%": { boxShadow: `0 0 0 0 ${stripe}` },
                                "70%": { boxShadow: "0 0 0 8px rgba(0,0,0,0)" },
                                "100%": { boxShadow: "0 0 0 0 rgba(0,0,0,0)" },
                              },
                            }}
                          />
                        )}

                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: "1rem",
                            backgroundColor: stripe,
                            color: "#fff",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                          }}
                        >
                          <FiBell />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "var(--color-text)",
                              mb: 0.25,
                              fontSize: "0.9rem",
                              pr: 5,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={n.title}
                          >
                            {n.title}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "0.78rem",
                              color: "var(--color-muted)",
                              lineHeight: 1.35,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                            title={n.message}
                          >
                            {n.message}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "0.68rem",
                              color: "var(--color-muted)",
                              mt: 0.5,
                              fontStyle: "italic",
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <span>{timeAgo(n.createdAt)}</span>
                            <span>•</span>
                            <span>
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                            {n.source ? <span>• {n.source}</span> : null}
                            {n.marketplaceId && n.asin ? (
                              <span>
                                • {n.marketplaceId} / {n.asin}
                              </span>
                            ) : null}
                          </Typography>
                        </Box>

                        {isUnread && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              size="small"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await markAsReadById(n?._id);
                                } catch (err) {}
                              }}
                              sx={{
                                position: "absolute",
                                top: 6,
                                right: 22,
                                color: "var(--color-text)",
                                backgroundColor: "var(--color-surface)",
                              }}
                              aria-label="mark notification as read"
                            >
                              <FiCheck size={14} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  })}
                </div>
              ))}

              {(isLoadingMore || state.loading) && (
                <div className="z-100 flex justify-center py-4">
                  <CircularProgress
                    size={24}
                    sx={{ color: "var(--color-primary)" }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 2,
                      color: "var(--color-muted)",
                      fontSize: "0.8rem",
                    }}
                  >
                    Loading more notifications...
                  </Typography>
                </div>
              )}

              {!state.hasMore && state.data.length > 0 && (
                <div className=" z-100 flex justify-center py-4">
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.7rem",
                      color: "var(--color-muted)",
                    }}
                  >
                    No more notifications to load
                  </Typography>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 z-10 border-t px-3 py-1 text-[10px]"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-muted)",
          }}
        >
          <div className="flex items-center justify-between">
            <span>
              Showing <strong>{shownCount}</strong> of{" "}
              <strong>{totalNotifications}</strong>
              {state.hasMore && " (scroll for more)"}
            </span>
            <span>
              Size: <strong>{pageSize}</strong> •{" "}
              {new Date(lastRefreshedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Read Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteReadModalOpen}
        onClose={() => setDeleteReadModalOpen(false)}
        onConfirm={handleDeleteReadConfirm}
        title="Delete Read Notifications"
        message={`Are you sure you want to delete ${readCount} read notification${readCount !== 1 ? "s" : ""}?`}
        confirmButtonText="Delete Read"
        confirmButtonColor="error"
      />

      {/* Delete All Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteAllModalOpen}
        onClose={() => setDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAllConfirm}
        title="Delete All Notifications"
        message={`Are you sure you want to delete all ${totalNotifications} notification${totalNotifications !== 1 ? "s" : ""}?`}
        confirmButtonText="Delete All"
        confirmButtonColor="error"
      />
    </>
  );
}
