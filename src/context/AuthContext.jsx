import React, { createContext, useContext, useEffect, useState } from "react";
import {
  loginCallApi,
  getProfileCallApi,
  editProfileCallApi,
  registerCallApi,
  usersCallApi,
  deleteAccountCallApi,
  changePasswordCallApi,
} from "../helpers/BackendHelper";
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
  const [allUsers, setAllUsers] = useState(null);
  const [allUsersLoading, setAllUsersLoading] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

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
      console.error("Login failed", error);
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
      console.error("Get profile failed", error);
      themeToast.error(
        error?.response?.data?.message ||
          "Session expired. Please log in again.",
      );
      logout();
    } finally {
      setUserLoading(false);
    }
  };

  // ✅ USERS
  const allUsersService = async (payload) => {
    try {
      setAllUsersLoading(true);
      const { data } = await usersCallApi(payload);
      setAllUsers(data);
      return data;
    } catch (error) {
      console.error("Get all users failed", error);
      themeToast.error(
        error?.response?.data?.message || "Failed to fetch users",
      );
    } finally {
      setAllUsersLoading(false);
    }
  };

  // ✅ REGISTER
  const registerService = async (payload) => {
    try {
      setUserLoading(true);
      const response = await registerCallApi(payload);
      themeToast.success("User registered successfully!");
      if (response?.data) {
        allUsersService();
      }
      return { success: true, user: response.data };
    } catch (error) {
      console.error("Register failed", error);
      themeToast.error(error?.response?.data?.message || "Register failed");
    } finally {
      setUserLoading(false);
    }
  };

  // ✅ EDIT PROFILE
  const editProfileService = async (id, payload) => {
    try {
      setUserLoading(true);
      const res = await editProfileCallApi(id, payload);
      themeToast.success("Profile updated successfully!");
      if (res?.data) {
        allUsersService();
      }
      return res;
    } catch (error) {
      console.error("Edit profile failed", error);
      themeToast.error(
        error?.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setUserLoading(false);
    }
  };

  // ✅ CHANGE PASSWORD
  const changePasswordService = async (payload) => {
    try {
      setChangePasswordLoading(true);
      const res = await changePasswordCallApi(payload);
      themeToast.success("Password changed successfully!");
      if (res?.data) {
        allUsersService();
      }
      return res;
    } catch (error) {
      console.error("Change password failed", error);
      themeToast.error(
        error?.response?.data?.message || "Change password failed",
      );
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // ✅ DELETE ACCOUNT
  const deleteAccountService = async (payload) => {
    try {
      setUserLoading(true);
      const res = await deleteAccountCallApi(payload);
      themeToast.success("Account deleted successfully!");
      if (res?.data) {
        allUsersService();
      }
      return res;
    } catch (error) {
      console.error("Failed to delete account", error);
      themeToast.error(
        error?.response?.data?.message || "Failed to delete account",
      );
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
        registerService,
        editProfileService,
        allUsersService,
        allUsers,
        allUsersLoading,
        deleteAccountService,
        changePasswordService,
        changePasswordLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
