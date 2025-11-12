import { createContext, useContext, useEffect, useState } from "react";
import { loginCallApi, getProfileCallApi } from "../helpers/BackendHelper";
import { useNavigate } from "react-router-dom";
import ThemeLoader from "../components/ui/ThemeLoader";
import { themeToast } from "../components/ui/ThemeToaster";
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();

  // ✅ LOGIN
  const loginService = async (credentials) => {
    try {
      setRefreshLoading(true);
      const { data, token } = await loginCallApi(credentials);
      setUser(data);
      if (token) localStorage.setItem("token", token);
      themeToast.success("Login successful!");
      navigate("/listing", { replace: true });
      return { data, token };
    } catch (error) {
      themeToast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setRefreshLoading(false);
    }
  };

  // ✅ PROFILE
  const getProfileService = async () => {
    try {
      setUserLoading(true);
      const { data } = await getProfileCallApi();
      setUser(data);
      return data;
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message ||
          "Session expired. Please log in again.",
      );
      logout();
    } finally {
      setUserLoading(false);
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    themeToast.info("Logged out");
    navigate("/auth/login", { replace: true });
  };

  // ✅ INIT
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      getProfileService()
        .catch(() => logout())
        .finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, [token]);

  if (initializing) {
    return <ThemeLoader type="fullpage" message="Loading..." />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginService,
        logout,
        refreshLoading,
        userLoading,
        getProfileService,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
