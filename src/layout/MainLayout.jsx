import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import NotificationSidebar from "./NotificationSidebar";
import { useNotification } from "../context/NotificationContext";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [sidebarVisible, setSidebarVisible] = useState(false);

  const {
    notifications,
    fetchNotifications,
    markAllAsRead,
    pageSize,
    setPageSize,
    markAsReadById,
  } = useNotification();

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;

    if (bottom) {
      setPageSize(pageSize + 10);
      fetchNotifications();
    }
  };

  return (
    <div className="relative flex">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarVisible={setSidebarVisible}
        />

        <main className="flex-1 px-4 pt-16 md:px-6">{children}</main>
      </div>

      <NotificationSidebar
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        visibleNotifications={notifications.data || []}
        handleScroll={handleScroll}
        handleMarkAllRead={markAllAsRead}
        loadingMore={notifications.loadingMore}
        pageSize={pageSize}
        setPageSize={setPageSize}
        markAsReadById={markAsReadById}
      />
    </div>
  );
}
