import React from "react";
import { FaChevronLeft, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import { HiOutlineViewList } from "react-icons/hi";
import { PiUserSwitch } from "react-icons/pi";

import { FaUserGroup } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { RiFileList3Fill } from "react-icons/ri";
import Logo from "../assets/logo.png";
import Profile from "../pages/profile/Profile";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      to: "/Listing",
      icon: <RiFileList3Fill />,
      label: "Listing",
      roles: ["user", "admin"],
    },
    {
      to: "/ListingReport",
      icon: <HiOutlineViewList />,
      label: "Listing Report",
      roles: ["user", "admin"],
    },
    {
      to: "/users",
      icon: <FaUserGroup />,
      label: "Users",
      roles: ["user", "admin"],
    },
    {
      to: "/job-config",
      icon: <PiUserSwitch />,
      label: "Job Config",
      roles: ["user", "admin"],
    },
    // {
    //   to: "/Settings",
    //   icon: <LuSettings />,
    //   label: "Settings",
    //   roles: ["admin"],
    // },
  ];

  return (
    <div
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col justify-between text-white shadow-lg ${
        isOpen ? "w-64" : "w-16"
      }`}
      style={{
        background: "var(--sidebar-bg)",
        transition: "width 420ms ease-in-out, background 300ms ease",
        willChange: "width, background",
        overflow: "hidden",
      }}
    >
      <div>
        <div className="px-2 py-4">
          <div
            className={`flex ${
              isOpen
                ? "flex-row items-center justify-between"
                : "flex-col items-center"
            } gap-2`}
          >
            {/* Logo Circle */}
            <div className={`flex items-center ${isOpen ? "gap-3" : ""}`}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  backgroundColor: "#e6f6ff", // light bluish circle
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #bfe9ff",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
                title="App Logo"
              >
                <img
                  src={Logo}
                  alt="Logo"
                  style={{
                    width: "32px",
                    height: "32px",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>

            {/* Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center bg-white p-2 shadow transition hover:bg-gray-200"
              style={{
                width: 36,
                height: 36,
                borderRadius: "6px",
              }}
            >
              {isOpen ? (
                <FaChevronLeft size={14} className="text-gray-800" />
              ) : (
                <FaChevronRight size={14} className="text-gray-800" />
              )}
            </button>
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-2 px-2">
          {menuItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item, index) => (
              <li key={index} className="group relative">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 transition-all duration-150 ${
                      isActive
                        ? "bg-white px-4 py-2 text-black"
                        : "px-3 py-2 text-white/85 hover:bg-white/10"
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className="select-none"
                    style={{
                      display: isOpen ? "inline-block" : "inline-block",
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateX(0)" : "translateX(-8px)",
                      transition: "opacity 360ms ease, transform 360ms ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                </NavLink>

                {!isOpen && (
                  <span
                    className="absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap bg-white px-3 py-2 text-sm font-semibold text-black shadow-md group-hover:flex"
                    style={{ transform: "translateX(6px)" }}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-transparent px-1 py-3">
        {isOpen ? (
          <div className="hover:bg-white/8 mx-1 bg-white/5 p-3 shadow-sm transition">
            <Profile compact />
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <img
              src={user?.profilePic || user?.avatar || "/default-avatar.png"}
              alt="Profile"
              className="h-8 w-8 border-2 border-white/10 object-cover"
            />
          </div>
        )}

        <div
          onClick={logout}
          className="group relative flex cursor-pointer items-center gap-3 px-3 py-2 text-sm font-medium transition hover:bg-red-600/80"
        >
          <FaSignOutAlt size={18} />
          {isOpen && <span className="select-none">Logout</span>}

          {!isOpen && (
            <span
              className="absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap bg-white px-3 py-2 text-sm font-semibold text-black shadow-md group-hover:flex"
              style={{ transform: "translateX(6px)" }}
            >
              Logout
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
