import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest, getAuthToken, setAuthToken } from "../api/client";
import { ROLES, type MenuId } from "../admin/data/permissions";

export type AuthUser = {
  id: number;
  name: string;
  username?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  permissions: string[];
  active: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (
    login: string,
    password: string,
  ) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (menuId: MenuId) => boolean;
  sendChangePasswordOtp: (
    currentPassword: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<{
    success: boolean;
    verificationToken?: string;
    email?: string;
    testMode?: boolean;
    expiresIn?: number;
    error?: string;
  }>;
  verifyChangePasswordOtp: (
    verificationToken: string,
    otp: string,
  ) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await apiRequest<{ user: AuthUser }>("/auth/me");
      setUser(res.user);
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = useCallback(async (loginId: string, password: string) => {
    try {
      const res = await apiRequest<{
        token: string;
        user: AuthUser;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ login: loginId, password }),
      });
      setAuthToken(res.token);
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (e) {
      const err = e as { message?: string };
      return {
        success: false,
        error: err.message || "Invalid username/email or password.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setAuthToken(null);
    setUser(null);
  }, []);

  const isSuperAdmin = user?.role === ROLES.SUPERADMIN;

  const hasPermission = useCallback(
    (menuId: MenuId) => {
      if (!user) return false;
      if (user.role === ROLES.SUPERADMIN) return true;
      return (user.permissions || []).includes(menuId);
    },
    [user],
  );

  const sendChangePasswordOtp = useCallback(
    async (
      currentPassword: string,
      password: string,
      passwordConfirmation: string,
    ) => {
      try {
        const res = await apiRequest<{
          verification_token: string;
          email: string;
          test_mode?: boolean;
          expires_in?: number;
        }>("/auth/change-password/otp/send", {
          method: "POST",
          body: JSON.stringify({
            current_password: currentPassword,
            password,
            password_confirmation: passwordConfirmation,
          }),
        });
        return {
          success: true,
          verificationToken: res.verification_token,
          email: res.email,
          testMode: res.test_mode,
          expiresIn: res.expires_in,
        };
      } catch (e) {
        const err = e as { message?: string };
        return { success: false, error: err.message };
      }
    },
    [],
  );

  const verifyChangePasswordOtp = useCallback(
    async (verificationToken: string, otp: string) => {
      try {
        await apiRequest("/auth/change-password/otp/verify", {
          method: "POST",
          body: JSON.stringify({
            verification_token: verificationToken,
            otp,
          }),
        });
        return { success: true };
      } catch (e) {
        const err = e as { message?: string };
        return { success: false, error: err.message };
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isSuperAdmin,
      login,
      logout,
      hasPermission,
      sendChangePasswordOtp,
      verifyChangePasswordOtp,
    }),
    [
      user,
      loading,
      isSuperAdmin,
      login,
      logout,
      hasPermission,
      sendChangePasswordOtp,
      verifyChangePasswordOtp,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
