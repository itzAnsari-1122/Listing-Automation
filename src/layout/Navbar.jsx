import React, { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Badge } from "@mui/material";
import { MdOutlineNotificationsNone } from "react-icons/md";

export default function Navbar({ sidebarOpen }) {
  const [hidden, setHidden] = useState(false);

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
              sx={{ color: "var(--navbar-icon)", p: 1.25 }}
            >
              <Badge badgeContent={Number(0)} color="error">
                <MdOutlineNotificationsNone size={24} />
              </Badge>
            </IconButton>

            {/* <IconButton
              aria-label="Toggle theme"
              onClick={toggleTheme}
              sx={{ color: "var(--navbar-icon)", p: 1.25 }}
            >
              {theme === "light" ? <Brightness4 /> : <Brightness7 />}
            </IconButton> */}
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
}
