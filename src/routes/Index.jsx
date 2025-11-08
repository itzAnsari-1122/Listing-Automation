import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import ThemeLoader from "../components/Ui/ThemeLoader";
import MainLayout from "../layout/MainLayout";
import Login from "../pages/Auth/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Catalog from "../pages/Catalog/Catalog";
import Users from "../pages/User/Users";
import Listing from "../pages/Listing/Listing";
import Profile from "../pages/Profile/Profile";
import ListingReport from "../pages/ListingReport/ListingReport";
import ListingDetail from "../pages/Listing/Detail/listingDetail";
import JobConfig from "../layout/jobConfig";

export default function AppRoutes() {
  const { user, refreshLoading } = useAuth();
  console.log(user, "user");
  if (refreshLoading) {
    return <ThemeLoader type="fullpage" message="Authenticating..." />;
  }

  return (
    <Routes>
      {!user && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* --- user role --- */}
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
          />{" "}
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

      {/* --- admin role --- */}
      {user?.role === "admin" && (
        <>
          {/* <Route
            path="/listing"
            element={
              <MainLayout>
                <Catalog />
              </MainLayout>
            }
          /> */}
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
            path="/users"
            element={
              <MainLayout>
                <Users />
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
