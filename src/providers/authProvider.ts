import type { AuthProvider } from "@refinedev/core";
import api from "../utils/api";
import { safeNotificationError } from "../utils/notify";
import { getErrorMessage } from "../utils/error";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      console.log("🚀 CMS LOGIN ATTEMPT:", {
        email: trimmedEmail,
        hasPassword: !!password,
        timestamp: new Date().toISOString()
      });
      // Use unified login endpoint for all user types (owner, root, manager, customer)
      console.log("📡 Making unified login request to /api/auth/login...");
      const response = await api.post("/api/auth/login", {
        email: trimmedEmail,
        password,
      });
      console.log("📡 Login response:", response.data);
      // Extract tokens from response
      const tokens = response.data?.data?.tokens;
      const accessToken = tokens?.accessToken;
      const refreshToken = tokens?.refreshToken;
      
      // API returns "Auth Success" for successful authentication
      if (response.data?.success === "Auth Success" || response.data?.success === true || response.data?.success) {
        console.log("✅ Unified login successful - User type:", response.data?.data?.userType);
        // Store both tokens if provided
        if (accessToken) {
          localStorage.setItem("dikafood_access_token", accessToken);
          console.log("💾 Access token stored");
        }
        if (refreshToken) {
          localStorage.setItem("dikafood_refresh_token", refreshToken);
          console.log("💾 Refresh token stored");
        }
        return {
          success: true,
          redirectTo: "/",
        };
      }
      return {
        success: false,
        error: {
          name: "LoginError",
          message: response.data?.error || "Login failed",
        },
      };
    } catch (error: any) {
      console.log("💥 LOGIN ERROR:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      safeNotificationError({
        message: "Login failed",
        description: getErrorMessage(error),
      });
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error.response?.data?.error || error.message || "Login failed",
        },
      };
    }
  },
  logout: async () => {
    try {
      await api.post("/api/auth/logout", {
        agentType: "manager",
      });
      localStorage.removeItem("dikafood_access_token");
      localStorage.removeItem("dikafood_refresh_token");
      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (error: any) {
      safeNotificationError({
        message: "Logout failed",
        description: getErrorMessage(error),
      });
      return {
        success: false,
        error: {
          name: "LogoutError",
          message: error.response?.data?.error || "Logout failed",
        },
      };
    }
  },
  check: async () => {
    try {
      console.log("🔐 Auth check called by Refine...");
      // Use /api/auth/me endpoint for all user types
      const response = await api.get("/api/auth/me");
      console.log("✅ Auth check response:", response.data);
      const user = response.data?.data?.user;
      if (user && user.role) {
        // Allow manager, root, and owner users to access CMS
        if (["manager", "root", "owner"].includes(user.role)) {
          console.log(`✅ ${user.role.toUpperCase()} user authenticated - allowing access`);
          return { authenticated: true };
        } else {
          console.log(`❌ User role '${user.role}' not allowed in CMS`);
          return { authenticated: false, redirectTo: "/login" };
        }
      }
      console.log("❌ User not authenticated or insufficient permissions - redirecting to login");
      return { authenticated: false, redirectTo: "/login" };
    } catch (error: any) {
      console.error("❌ Auth check failed:", error.response?.data || error.message);
      safeNotificationError({
        message: "Auth check failed",
        description: getErrorMessage(error),
      });
      return { authenticated: false, redirectTo: "/login" };
    }
  },
  getPermissions: async () => {
    try {
      const response = await api.get("/api/auth/me");
      const user = response.data?.data?.user;
      if (user && user.role) {
        if (user.role === "root") {
          return { permissions: ["admin", "root", "manager", "customer", "owner"], role: "root" };
        } else if (user.role === "owner") {
          return { permissions: ["admin", "root", "manager", "customer", "owner"], role: "owner" };
        } else if (user.role === "manager") {
          return { permissions: ["admin", "manager", "customer"], role: "manager" };
        }
      }
      return { permissions: ["admin"], role: "manager" };
    } catch (error: any) {
      console.error("Error getting permissions:", error);
      safeNotificationError({
        message: "Permission error",
        description: getErrorMessage(error),
      });
      return { permissions: ["admin"], role: "manager" };
    }
  },
  getIdentity: async () => {
    try {
      const response = await api.get("/api/auth/me");
      const user = response.data?.data?.user;
      if (user && user.role) {
        return {
          id: user.id || "user",
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.role === "root" ? "Root Administrator" : user.role === "owner" ? "Business Owner" : "Manager",
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.role === "root" ? "Root Admin" : user.role === "owner" ? "Business Owner" : "Manager")}&background=${user.role === "owner" ? "ff7a00" : "1890ff"}&color=fff`,
          email: user.email || "",
          role: user.role || "manager",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          isVerified: user.isVerified || false,
          createdAt: user.createdAt || "",
        };
      }
      return null;
    } catch (error: any) {
      console.error("Error getting identity:", error);
      safeNotificationError({
        message: "Identity error",
        description: getErrorMessage(error),
      });
      return null;
    }
  },
  onError: async (error) => {
    console.error("Auth error:", error);
    if (error.response?.status === 401) {
      // Clear tokens on auth error
      localStorage.removeItem("dikafood_access_token");
      localStorage.removeItem("dikafood_refresh_token");
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return { error };
  },
};
// No need to restore token on app load, handled by api utility 