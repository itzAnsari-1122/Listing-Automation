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

  const sidebarWidth = useMemo(() => {
    if (isMobile) return "100vw";
    if (isTablet) return "380px";
    return "400px";
  }, [isMobile, isTablet]);

  const sidebarPosition = useMemo(() => {
    if (isMobile) return "0";
    return "0";
  }, [isMobile]);

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

  const handleDeleteRead = async () => {
    const readCount =
      state?.totalRead ??
      Math.max((totalNotifications || 0) - (totalUnread || 0), 0);
    if (readCount <= 0) return;

    const ok = window.confirm(
      `Delete ${readCount} read notification${readCount > 1 ? "s" : ""}?`,
    );
    if (!ok) return;

    try {
      await deleteReadNotificationService();
      await fetchNotifications(
        1,
        typeFilter,
        statusFilter,
        true,
        selectedCountries,
      );
    } catch (err) {
    } finally {
      setLastRefreshedAt(Date.now());
    }
  };

  const handleDeleteAll = async () => {
    if ((totalNotifications || 0) === 0) return;

    const ok = window.confirm(
      "This will permanently delete ALL notifications. Continue?",
    );
    if (!ok) return;

    try {
      await deleteAllNotificationService();
      await fetchNotifications(
        1,
        typeFilter,
        statusFilter,
        true,
        selectedCountries,
      );
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
    <div
      ref={sidebarRef}
      className={`fixed right-0 top-0 z-50 h-full transform bg-[var(--color-surface)] shadow-2xl transition-transform duration-300 ${
        sidebarVisible ? "translate-x-0" : "translate-x-full"
      }`}
      style={{
        width: sidebarWidth,
        left: isMobile ? "0" : "auto",
        borderLeft: isMobile ? "none" : "1px solid var(--color-border)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
      }}
      aria-label="Notifications sidebar"
    >
      <div className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              badgeContent={totalUnread}
              color={totalUnread > 0 ? "error" : "default"}
              overlap="circular"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FiBell size={16} />
              </div>
            </Badge>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text)]">
                Notifications
              </h2>
              <p className="text-xs text-[var(--color-muted)]">
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
              >
                <FiRefreshCw size={14} />
              </IconButton>
            </Tooltip>
            {!isMobile && (
              <Tooltip
                title={totalUnread > 0 ? "Mark all as read" : "All caught up!"}
              >
                <span>
                  <ThemeButton
                    onClick={handleMarkAllRead}
                    variant="outline"
                    textColor={totalUnread > 0 ? "#3B82F6" : "#9CA3AF"}
                    borderRadius="9999px"
                    size="sm"
                    disabled={totalUnread === 0}
                  >
                    Mark all
                  </ThemeButton>
                </span>
              </Tooltip>
            )}

            <Tooltip title="Close">
              <IconButton
                size="small"
                aria-label="close"
                onClick={() => setSidebarVisible(false)}
              >
                <FiX size={14} />
              </IconButton>
            </Tooltip>
          </div>
        </div>

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
            <ThemeChip
              label={`Total: ${totalNotifications}`}
              tone="primary"
              variant="outline"
              size="sm"
              sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                height: "24px",
              }}
            />
            <ThemeChip
              label={`Unread: ${totalUnread}`}
              tone={totalUnread > 0 ? "danger" : "success"}
              variant={totalUnread > 0 ? "filled" : "outline"}
              size="sm"
              sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                height: "24px",
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Delete read notifications">
              <span>
                <ThemeButton
                  buttonType={isMobile ? "icon" : "default"}
                  variant="outline"
                  tone="neutral"
                  aria-label="Delete read notifications"
                  onClick={handleDeleteRead}
                  disabled={
                    (state?.totalRead ?? totalNotifications - totalUnread) <= 0
                  }
                  title="Delete read notifications"
                  size="sm"
                  startIcon={!isMobile ? <FiTrash2 size={12} /> : null}
                  sx={{
                    borderRadius: "9999px",
                    fontSize: "0.7rem",
                    height: "24px",
                    px: isMobile ? 0.5 : 1,
                    minWidth: isMobile ? "32px" : "auto",
                  }}
                >
                  {isMobile ? <FiTrash2 size={12} /> : "Read"}
                </ThemeButton>
              </span>
            </Tooltip>

            <Tooltip title="Delete all notifications">
              <span>
                <ThemeButton
                  buttonType={isMobile ? "icon" : "default"}
                  variant="outline"
                  tone="danger"
                  aria-label="Delete all notifications"
                  onClick={handleDeleteAll}
                  disabled={(totalNotifications || 0) === 0}
                  title="Delete all notifications"
                  size="sm"
                  startIcon={!isMobile ? <FiTrash2 size={12} /> : null}
                  sx={{
                    borderRadius: "9999px",
                    fontSize: "0.7rem",
                    height: "24px",
                    px: isMobile ? 0.5 : 1,
                    minWidth: isMobile ? "32px" : "auto",
                  }}
                >
                  {isMobile ? <FiTrash2 size={12} /> : "All"}
                </ThemeButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

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
              handleFilterInteractionEnd();
            }}
            onOpen={() => handleFilterInteractionStart()}
            onClose={() => handleFilterInteractionEnd()}
            sx={{
              borderRadius: "40px",
              "& .MuiInputBase-root": {
                height: "32px",
                fontSize: "0.8rem",
              },
            }}
            options={CountryOptions}
            placeholder="Select countries"
            width="100%"
            borderRadius={"30px"}
          />
        </Box>

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
              borderRadius: "9999px",
              height: "32px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <FiSearch className="mx-1 opacity-70" size={14} />
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
                "& input": {
                  padding: "4px 0",
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
              >
                <FiX size={14} />
              </IconButton>
            )}
          </Paper>

          <ThemeButton
            buttonType="icon"
            variant="outline"
            tone="neutral"
            aria-label="Filter options"
            onClick={(e) => {
              handleFilterInteractionStart();
              setFiltersAnchorEl(e.currentTarget);
            }}
            title="Filter options"
            size="sm"
            sx={{
              height: "32px",
              width: "32px",
              borderRadius: "9999px",
              flexShrink: 0,
            }}
          >
            <FiFilter size={14} />
          </ThemeButton>

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
                borderRadius: "12px",
                minWidth: 160,
                maxWidth: isMobile ? "280px" : "none",
                boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              },
            }}
          >
            <MenuItem
              disabled
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "text.secondary",
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
                color: "text.secondary",
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
                color: "text.secondary",
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
              sx={{ fontSize: "0.8rem", color: "error.main" }}
            >
              <ListItemText>Clear All Filters</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </div>

      <div className="sticky top-[118px] z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-medium text-gray-500 opacity-80">
              Active:
            </span>
            {statusFilter !== "all" && (
              <ThemeChip
                size="sm"
                label={`Status: ${statusFilter}`}
                variant="filled"
                tone="primary"
                onDelete={() => {
                  setStatusFilter("all");
                  handleFilterInteractionStart();
                  setTimeout(handleFilterInteractionEnd, 100);
                }}
                sx={{
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: "22px",
                }}
              />
            )}
            {typeFilter !== "all" && (
              <ThemeChip
                size="sm"
                label={`Type: ${typeFilter}`}
                variant="filled"
                tone={
                  typeFilter === "success"
                    ? "success"
                    : typeFilter === "error"
                      ? "danger"
                      : "primary"
                }
                onDelete={() => {
                  setTypeFilter("all");
                  handleFilterInteractionStart();
                  setTimeout(handleFilterInteractionEnd, 100);
                }}
                sx={{
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: "22px",
                }}
              />
            )}
            {sortOrder !== "desc" && (
              <ThemeChip
                size="sm"
                label="Oldest First"
                variant="filled"
                tone="neutral"
                onDelete={() => {
                  setSortOrder("desc");
                  handleFilterInteractionStart();
                  setTimeout(handleFilterInteractionEnd, 100);
                }}
                sx={{
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: "22px",
                }}
              />
            )}
            {query && (
              <ThemeChip
                size="sm"
                label={`Search: ${query}`}
                variant="filled"
                tone="warning"
                onDelete={() => {
                  setQuery("");
                  handleFilterInteractionStart();
                  setTimeout(handleFilterInteractionEnd, 100);
                }}
                sx={{
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: "22px",
                }}
              />
            )}
            {statusFilter === "all" &&
              typeFilter === "all" &&
              sortOrder === "desc" &&
              !query && (
                <span className="text-xs italic text-gray-400">
                  No filters active
                </span>
              )}
          </div>
        </div>
      </div>

      <div
        className="h-[calc(100%-180px)] space-y-3 overflow-y-auto scroll-smooth p-3"
        onScroll={handleScroll}
        role="list"
        aria-label="Notification list"
      >
        {state.loading && !state.data.length && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Box key={i} sx={{ p: 1.5, mx: 1 }}>
                <Skeleton variant="text" width="60%" height={18} />
                <Skeleton variant="text" width="90%" height={14} />
                <Skeleton variant="rectangular" height={1} />
              </Box>
            ))}
          </div>
        )}

        {!state.loading && locallyFiltered.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center text-gray-400">
            <div className="mb-3 text-5xl">🔔</div>
            <p className="text-lg font-medium">No matches</p>
            <p className="mt-1 text-sm text-gray-500">
              Try clearing filters or adjusting your search.
            </p>
          </div>
        )}

        {!state.loading && locallyFiltered.length > 0 && (
          <>
            {Object.entries(grouped).map(([label, items]) => {
              const anyUnread = items.some((i) => i.status === "unread");
              return (
                <div className="mb-20" key={label}>
                  <Box
                    className="sticky right-[0px] top-[0px] z-0 py-1"
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.03)",
                      borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                      borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                      marginLeft: "-12px",
                      marginRight: "-12px",
                      paddingLeft: "12px",
                      paddingRight: "12px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          display: "inline-block",
                          borderRadius: "6px",
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                          color: "#374151",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          border: "1px solid rgba(0, 0, 0, 0.15)",
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
                            <ThemeChip
                              size="sm"
                              label="Mark day"
                              onClick={() => markDayAsRead(items)}
                              disabled={!anyUnread}
                              variant="outline"
                              tone={anyUnread ? "primary" : "neutral"}
                              sx={{
                                borderRadius: "9999px",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                height: "22px",
                                minWidth: "auto",
                                px: 1,
                              }}
                            />
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                  </Box>

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
                          borderRadius: "14px",
                          position: "relative",
                          cursor: "pointer",
                          bgcolor: isUnread
                            ? "rgba(59,130,246,0.06)"
                            : "transparent",
                          borderLeft: `3px solid ${stripe}`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
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
                              sx={{ position: "absolute", top: 6, right: 22 }}
                              aria-label="mark notification as read"
                            >
                              <FiCheck size={14} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  })}
                  {isLoadingMore && <ThemeLoader type="circle" size={20} />}
                </div>
              );
            })}

            {(isLoadingMore || state.loading) && (
              <div className="z-100 flex justify-center py-4">
                <CircularProgress size={24} />
                <Typography
                  variant="body2"
                  sx={{ ml: 2, color: "text.secondary", fontSize: "0.8rem" }}
                >
                  Loading more notifications...
                </Typography>
              </div>
            )}

            {!state.hasMore && state.data.length > 0 && (
              <div className=" z-100 flex justify-center py-4">
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontSize: "0.7rem" }}
                >
                  No more notifications to load
                </Typography>
              </div>
            )}
          </>
        )}
      </div>

      <div className="sticky bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[10px] text-[var(--color-muted)]">
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
  );
}
