import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  DeleteAllNotificationByIdCallApi,
  DeleteAllReadNotificationByIdCallApi,
  NotificationCallApi,
  NotificationMarkAllAsReadCallApi,
  NotificationReadByIdCallApi,
  UnreadNotificationsCAllApi,
} from "../helpers/BackendHelper";
import socket from "../helpers/Socket";

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [unReadNotification, setUnReadNotifications] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [notifications, setNotifications] = useState({
    data: [],
    totalUnread: 0,
    totalRead: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    loadingMore: false,
    hasMore: false,
  });

  const filtersRef = useRef({ type: "all", status: "all" });

  // ✅ Enhanced socket connection management
  const initializeSocket = () => {
    console.log("🔄 Initializing socket connection...");

    // Socket connection events
    const handleConnect = () => {
      console.log("✅ Socket connected in NotificationContext");
      setSocketConnected(true);
    };

    const handleDisconnect = (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setSocketConnected(false);
    };

    const handleConnectError = (error) => {
      console.error("❌ Socket connection error:", error.message);
      setSocketConnected(false);
    };

    const handleReconnect = (attempt) => {
      console.log(`🔄 Socket reconnected after ${attempt} attempts`);
      setSocketConnected(true);
    };

    // ✅ Enhanced notification handler
    const handleNewNotification = (notification) => {
      console.log("📢 New notification received via socket:", notification);

      // Validate notification structure
      if (!notification || !notification._id) {
        console.warn("⚠️ Invalid notification received:", notification);
        return;
      }

      setNotifications((prev) => {
        const { type, status } = filtersRef.current;
        const matchesType = type === "all" || notification.type === type;
        const matchesStatus =
          status === "all" || notification.status === status;

        const next = {
          ...prev,
          totalUnread:
            notification.status === "unread"
              ? (prev.totalUnread || 0) + 1
              : prev.totalUnread,
          totalRead:
            notification.status === "read"
              ? (prev.totalRead || 0) + 1
              : prev.totalRead,
          hasMore: prev.page < prev.totalPages,
        };

        // Add to data if it matches current filters
        if (matchesType && matchesStatus) {
          next.data = [notification, ...prev.data];

          // Limit data to prevent memory issues
          if (next.data.length > 100) {
            next.data = next.data.slice(0, 100);
          }
        }

        return next;
      });

      // Also update unread notifications
      getUnreadNotifications();
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("reconnect", handleReconnect);
    socket.on("new-notification", handleNewNotification);

    // Debug: log all socket events
    socket.onAny((event, ...args) => {
      console.log(`🔍 Socket event [${event}]:`, args);
    });

    // Check initial connection state
    if (socket.connected) {
      setSocketConnected(true);
      console.log("✅ Socket already connected on mount");
    }

    // Return cleanup function
    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("reconnect", handleReconnect);
      socket.off("new-notification", handleNewNotification);
      socket.offAny();
    };
  };

  const fetchNotifications = async (
    page = 1,
    type = undefined,
    status = undefined,
    loading = true,
    marketplaceIds = selectedCountries || [],
  ) => {
    if (typeof type !== "undefined") filtersRef.current.type = type;
    if (typeof status !== "undefined") filtersRef.current.status = status;

    if (page > notifications.totalPages && page !== 1) return;

    const { type: currentType, status: currentStatus } = filtersRef.current;
    setNotifications((prev) => ({
      ...prev,
      [pageSize === 10 ? "loading" : "loadingMore"]: loading,
    }));

    try {
      const res = await NotificationCallApi({
        page: page,
        limit: pageSize,
        type: currentType,
        status: currentStatus,
        marketplaceIds,
      });

      setNotifications((prev) => {
        const totalPages = res.totalPages || 1;
        const page = res.currentPage || page;
        return {
          ...prev,
          data: res.data,
          totalUnread: res.totalUnread || 0,
          totalRead: res.totalRead || 0,
          page,
          totalPages,
          loading: false,
          loadingMore: false,
          totalItems: res.totalItems || 0,
          hasMore: page < totalPages,
        };
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      getUnreadNotifications();
      setNotifications((prev) => ({
        ...prev,
        loading: false,
        loadingMore: false,
      }));
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (
      scrollTop + clientHeight >= scrollHeight - 50 &&
      !notifications.loadingMore &&
      notifications.page < notifications.totalPages
    ) {
      fetchNotifications(notifications.page + 1, undefined, undefined, false);
    }
  };

  const markAsReadById = async (id) => {
    try {
      const res = await NotificationReadByIdCallApi(id);

      setNotifications((prev) => {
        const isFilteringUnread = filtersRef.current.status === "unread";
        const updated = prev.data.map((n) =>
          n._id === id ? { ...n, status: "read" } : n,
        );
        const data = isFilteringUnread
          ? updated.filter((n) => n.status !== "read")
          : updated;

        return {
          ...prev,
          data,
          totalUnread: Math.max((prev.totalUnread || 0) - 1, 0),
          totalRead: (prev.totalRead || 0) + 1,
        };
      });

      await getUnreadNotifications();

      // ✅ Show success message if themeToast exists
      if (typeof themeToast !== "undefined" && themeToast.success) {
        themeToast.success("Notification marked as read successfully!");
      }

      return res;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);

      // ✅ Show error message if themeToast exists
      if (typeof themeToast !== "undefined" && themeToast.error) {
        themeToast.error(
          error?.response?.data?.message ||
            "Failed to mark notification as read",
        );
      }

      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await NotificationMarkAllAsReadCallApi();

      setNotifications((prev) => {
        const isFilteringUnread = filtersRef.current.status === "unread";
        return {
          ...prev,
          data: isFilteringUnread
            ? []
            : prev.data.map((n) => ({ ...n, status: "read" })),
          totalUnread: 0,
          totalRead: (prev.totalRead || 0) + (prev.totalUnread || 0),
          hasMore: false,
        };
      });

      await getUnreadNotifications();

      // ✅ Show success message if themeToast exists
      if (typeof themeToast !== "undefined" && themeToast.success) {
        themeToast.success("All notifications marked as read successfully!");
      }

      return res;
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);

      // ✅ Show error message if themeToast exists
      if (typeof themeToast !== "undefined" && themeToast.error) {
        themeToast.error(
          error?.response?.data?.message ||
            "Failed to mark all notifications as read",
        );
      }

      throw error;
    }
  };

  const getUnreadNotifications = async () => {
    try {
      const res = await UnreadNotificationsCAllApi();
      setUnReadNotifications(res.data || []);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  };

  const deleteReadNotificationService = async () => {
    try {
      await DeleteAllReadNotificationByIdCallApi();
    } catch (error) {
      console.log("Failed to delete read notifications", error);
      throw error;
    }
  };

  const deleteAllNotificationService = async () => {
    try {
      await DeleteAllNotificationByIdCallApi();
    } catch (error) {
      console.log("Failed to delete all notifications", error);
      throw error;
    }
  };

  // ✅ Enhanced useEffect with proper socket initialization
  useEffect(() => {
    fetchNotifications(1);
    getUnreadNotifications();

    const cleanupSocket = initializeSocket();

    return () => {
      cleanupSocket();
    };
  }, [pageSize]);

  const setFilterType = (type) => {
    filtersRef.current.type = type;
    fetchNotifications(1, undefined, undefined, true);
  };

  const setFilterStatus = (status) => {
    filtersRef.current.status = status;
    fetchNotifications(1, undefined, undefined, true);
  };

  // ✅ Manual socket reconnection function
  const reconnectSocket = () => {
    console.log("🔄 Manually reconnecting socket...");
    socket.disconnect();
    socket.connect();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        handleScroll,
        markAsReadById,
        markAllAsRead,
        unReadNotification,
        fetchNotifications,
        setFilterType,
        setFilterStatus,
        pageSize,
        setPageSize,
        deleteReadNotificationService,
        deleteAllNotificationService,
        socketConnected, // ✅ Expose socket status
        reconnectSocket, // ✅ Expose reconnect function
        selectedCountries,
        setSelectedCountries,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
