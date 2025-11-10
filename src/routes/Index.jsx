import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/auth/Login";
import MainLayout from "../layout/MainLayout";
import ComingSoon from "../pages/comingSoon/ComingSoon";
import ThemeLoader from "../components/ui/ThemeLoader";
import Users from "../pages/user/Users";

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
                <ComingSoon />
              </MainLayout>
            }
          />
          <Route
            path="/listing/:asin"
            element={
              <MainLayout>
                <ComingSoon />
              </MainLayout>
            }
          />
          <Route
            path="/listing"
            element={
              <MainLayout>
                <ComingSoon />
              </MainLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <MainLayout>
                <ComingSoon />
              </MainLayout>
            }
          />{" "}
          <Route
            path="/users"
            element={
              <MainLayout>
                <ComingSoon />
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
                <ComingSoon />
              </MainLayout>
            }
          />
          <Route
            path="/listing/:asin"
            element={
              <MainLayout>
                <ComingSoon />
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
                <ComingSoon />
              </MainLayout>
            }
          />
          <Route
            path="/listing"
            element={
              <MainLayout>
                <ComingSoon />
              </MainLayout>
            }
          />

          <Route path="*" element={<Navigate to="/listing" replace />} />
        </>
      )}
    </Routes>
  );
}
