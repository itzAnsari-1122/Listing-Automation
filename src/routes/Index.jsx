import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layout/MainLayout";

import ListingReport from "../pages/listingReport/ListingReport";
import ListingDetail from "../pages/listing/listingDetails/ListingDetail";
import Listing from "../pages/listing/Listing";
import Users from "../pages/user/Users";
import JobConfig from "../layout/JobConfig";
import Login from "../pages/auth/Login";
import Profile from "../pages/profile/Profile";
import { useAuth } from "../context/AuthContext";
import ThemeLoader from "../components/ui/ThemeLoader";

export default function AppRoutes() {
  const { user, refreshLoading } = useAuth();

  if (refreshLoading) {
    return <ThemeLoader type="fullpage" message="Authenticating..." />;
  }

  return (
    <Routes>
      {/* --- Public Routes (Before Login) --- */}
      {!user && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* --- User Role Routes --- */}
      {user?.role === "user" && (
        <>
          <Route
            path="/listingReport"
            element={
              <MainLayout>
                <ListingReport />
              </MainLayout>
            }
          />
          <Route
            path="/listing/:asin"
            element={
              <MainLayout>
                <ListingDetail />
              </MainLayout>
            }
          />
          <Route
            path="/listing"
            element={
              <MainLayout>
                <Listing />
              </MainLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <MainLayout>
                <Profile />
              </MainLayout>
            }
          />
          <Route
            path="/users"
            element={
              <MainLayout>
                <Users />
              </MainLayout>
            }
          />
          <Route path="*" element={<Navigate to="/listing" replace />} />
        </>
      )}

      {/* --- Admin Role Routes --- */}
      {user?.role === "admin" && (
        <>
          <Route
            path="/listingReport"
            element={
              <MainLayout>
                <ListingReport />
              </MainLayout>
            }
          />
          <Route
            path="/listing/:asin"
            element={
              <MainLayout>
                <ListingDetail />
              </MainLayout>
            }
          />
          <Route
            path="/listing"
            element={
              <MainLayout>
                <Listing />
              </MainLayout>
            }
          />
          <Route
            path="/users"
            element={
              <MainLayout>
                <Users />
              </MainLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <MainLayout>
                <Profile />
              </MainLayout>
            }
          />
          <Route
            path="/job-config"
            element={
              <MainLayout>
                <JobConfig />
              </MainLayout>
            }
          />
          {/* <Route
            path="/settings"
            element={
              <MainLayout>
                <Settings />
              </MainLayout>
            }
          /> */}
          <Route path="*" element={<Navigate to="/listing" replace />} />
        </>
      )}
    </Routes>
  );
}
