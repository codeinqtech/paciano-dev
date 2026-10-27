import { Outlet, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getMenuIdFromPath } from "../data/permissions";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

export default function AdminLayout() {
  const location = useLocation();
  const { loading, isAuthenticated, hasPermission, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="admin-shell flex items-center justify-center min-h-screen">
        <div className="text-[#8A8177]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuId = getMenuIdFromPath(location.pathname);

  // Unknown admin paths fall through to nested <Route path="*" /> → NotFound
  if (menuId === "users" && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (
    menuId &&
    menuId !== "profile" &&
    menuId !== "dashboard" &&
    !hasPermission(menuId)
  ) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <motion.main
        className="min-h-screen p-4 sm:p-6 lg:ml-64 lg:p-10 lg:pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AdminHeader />
        <Outlet />
      </motion.main>
    </div>
  );
}
