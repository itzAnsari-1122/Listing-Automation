import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/auth/Login";
import ListingReport from "../pages/listingReport/ListingReport";
import ListingDetail from "../pages/listing/detail/ListingDetail";
import Listing from "../pages/listing/Listing";
import Profile from "../pages/profile/Profile";
import Users from "../pages/user/Users";
import MainLayout from "../layout/MainLayout";
import JobConfig from "../layout/JobConfig";

export default function AppRoutes() {
  const { user, refreshLoading } = useAuth();
  if (refreshLoading) {
    return <ThemeLoader type="fullpage" message="Authenticating..." />;
  }

  return (
    <Routes>
      {!user && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* --- user role --- */}
      {user?.role === "user" && (
        <>
          <Route
            path="/listing-report"
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
          <Route
            path="/listing-report"
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
          <Route path="*" element={<Navigate to="/listing" replace />} />
        </>
      )}
    </Routes>
  );
}
