import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaCamera } from "react-icons/fa";
import Chip from "@mui/material/Chip";
import ThemeChip from "../../components/ui/ThemeChip";

function Profile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    if (user?.profilePic) {
      setProfilePic(user.profilePic);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-20">
        <div className="mb-2 text-xl font-semibold">No user data found.</div>
        <div className="text-gray-500">Please log in to view your profile.</div>
      </div>
    );
  }
  const roleStyles = {
    admin: { tone: "danger" },
    user: { tone: "primary" },
  };
  const { tone } = roleStyles[user?.role] || roleStyles.user;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-blue-500">
          <img
            src={
              profilePic ||
              user?.profilePic ||
              user?.avatar ||
              "/default-avatar.png"
            }
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold leading-tight">
            {user
              ? (user.name || user.username || "Unknown User")
                  .toString()
                  .trim()
                  .replace(/^([a-z])/, (m) => m.toUpperCase())
              : "Unknown User"}
          </h2>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
