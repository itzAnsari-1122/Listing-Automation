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

  useEffect(() => {
    const id = setTimeout(
      () => setDebouncedQuery(query.trim().toLowerCase()),
      250,
    );
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
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
  }, [sidebarVisible, setSidebarVisible]);

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
    } catch (err) {
      console.error(err?.message || err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
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
      console.error("Failed to delete read notifications:", err);
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
      console.error("Failed to delete all notifications:", err);
    } finally {
      setLastRefreshedAt(Date.now());
    }
  };

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
    } catch (e) {
      console.error(e);
    }
  };

  const shownCount = locallyFiltered.length;

  return (
    <div
      ref={sidebarRef}
      className={`fixed right-0 top-0 z-10 h-full w-[400px] transform bg-[var(--color-surface)] shadow-2xl transition-transform duration-300 ${
        sidebarVisible ? "translate-x-0" : "translate-x-full"
      }`}
      style={{
        borderLeft: "1px solid var(--color-border)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
      }}
      aria-label="Notifications sidebar"
    >
      {/* Header Section - Made more compact */}
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

        {/* Stats and Actions - Made more compact */}
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            justifyContent: "space-between",
            alignItems: "center",
            pt: 1,
          }}
        >
          <Box sx={{ display: "flex", gap: 0.5 }}>
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
                  buttonType="icon"
                  variant="outline"
                  tone="neutral"
                  aria-label="Delete read notifications"
                  onClick={handleDeleteRead}
                  disabled={
                    (state?.totalRead ?? totalNotifications - totalUnread) <= 0
                  }
                  title="Delete read notifications"
                  size="sm"
                >
                  <FiTrash2 size={12} />
                </ThemeButton>
              </span>
            </Tooltip>

            <Tooltip title="Delete all notifications">
              <span>
                <ThemeButton
                  buttonType="icon"
                  variant="outline"
                  tone="danger"
                  aria-label="Delete all notifications"
                  onClick={handleDeleteAll}
                  disabled={(totalNotifications || 0) === 0}
                  title="Delete all notifications"
                  size="sm"
                >
                  <FiTrash2 size={12} />
                </ThemeButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Country Filter - Made more compact */}
        <Box sx={{ mt: 1 }}>
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
              console.log("Selected marketplace IDs:", marketplaceIds);
            }}
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

        {/* Search - Made more compact */}
        <Box sx={{ mt: 1 }}>
          <Paper
            variant="outlined"
            sx={{
              px: 1,
              py: 0.25,
              display: "flex",
              alignItems: "center",
              borderRadius: "9999px",
              height: "32px",
            }}
          >
            <FiSearch className="mx-1 opacity-70" size={14} />
            <InputBase
              placeholder="Search title, message, or ASIN…"
              inputProps={{ "aria-label": "Search notifications" }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
                onClick={() => setQuery("")}
                aria-label="clear search"
              >
                <FiX size={14} />
              </IconButton>
            )}
          </Paper>
        </Box>
      </div>

      {/* Filters Section - Made much more compact */}
      <div className="sticky top-[118px] z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        {/* Status and Type filters combined in one row */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1">
            <FiFilter className="opacity-70" size={12} />
            <span className="text-xs font-medium text-gray-500 opacity-80">
              Filters
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            {["all", "unread", "read"].map((tab) => (
              <ThemeChip
                key={tab}
                size="sm"
                label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                variant={statusFilter === tab ? "filled" : "outline"}
                tone={statusFilter === tab ? "primary" : "neutral"}
                onClick={() => setStatusFilter(tab)}
                sx={{
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: "24px",
                  minWidth: "auto",
                  px: 1,
                }}
              />
            ))}
          </div>
        </div>

        <Divider sx={{ my: 0.5 }} />

        {/* Type filters and controls in one row */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-0.5">
            {["all", "success", "error", "info"].map((type) => {
              const active = typeFilter === type;
              const tone =
                type === "all"
                  ? "primary"
                  : type === "success"
                    ? "success"
                    : type === "error"
                      ? "danger"
                      : type === "info"
                        ? "primary"
                        : "neutral";
              return (
                <ThemeChip
                  key={type}
                  size="sm"
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  variant={active ? "filled" : "outline"}
                  tone={active ? tone : "neutral"}
                  onClick={() => setTypeFilter(type)}
                  sx={{
                    borderRadius: "9999px",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: "24px",
                    minWidth: "auto",
                    px: 1,
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-0.5">
            <ThemeChip
              size="sm"
              label={sortOrder === "desc" ? "Newest" : "Oldest"}
              onClick={() =>
                setSortOrder((p) => (p === "desc" ? "asc" : "desc"))
              }
              variant="outline"
              tone="neutral"
              sx={{
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: "24px",
                minWidth: "auto",
                px: 1,
              }}
            />
            <ThemeChip
              size="sm"
              label="Clear"
              onClick={() => {
                setStatusFilter("all");
                setTypeFilter("all");
                setResolvedFilter("all");
                setSortOrder("desc");
                setQuery("");
              }}
              variant="outline"
              tone="neutral"
              sx={{
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: "24px",
                minWidth: "auto",
                px: 1,
              }}
            />
          </div>
        </div>
      </div>

      {/* Notifications List - Adjusted height calculation for smaller header */}
      <div
        className="h-[calc(100%-180px)] space-y-3 overflow-y-auto scroll-smooth p-3"
        onScroll={handleScroll}
        role="list"
        aria-label="Notification list"
      >
        {/* Initial loading */}
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

        {/* No results */}
        {!state.loading && locallyFiltered.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center text-gray-400">
            <div className="mb-3 text-5xl">🔔</div>
            <p className="text-lg font-medium">No matches</p>
            <p className="mt-1 text-sm text-gray-500">
              Try clearing filters or adjusting your search.
            </p>
          </div>
        )}

        {/* Notifications list */}
        {!state.loading && locallyFiltered.length > 0 && (
          <>
            {Object.entries(grouped).map(([label, items]) => {
              const anyUnread = items.some((i) => i.status === "unread");
              return (
                <div className="mb-20" key={label}>
                  <div className="sticky right-[0px] top-[0px] z-0 bg-[var(--color-surface)] py-1">
                    <div className="flex items-center justify-between px-2">
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.25,
                          display: "inline-block",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(59,130,246,0.08)",
                          color: "#1f2937",
                          fontWeight: 600,
                          fontSize: "0.7rem",
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
                  </div>

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
                                } catch (err) {
                                  console.error(err);
                                }
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

            {/* Scroll loading indicator */}
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

            {/* No more data indicator */}
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

      {/* Footer - Made more compact */}
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
