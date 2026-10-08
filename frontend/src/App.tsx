import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ContactPage from "@/pages/ContactPage";
import StayPage from "@/pages/StayPage";
import AdminLayout from "@/admin/layouts/AdminLayout";
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminForgotPassword from "@/admin/pages/AdminForgotPassword";
import Dashboard from "@/admin/pages/Dashboard";
import AdminProfile from "@/admin/pages/AdminProfile";
import AdminUsers from "@/admin/pages/AdminUsers";
import AdminContentSection from "@/admin/pages/AdminContentSection";
import AdminNavbarMenus from "@/admin/pages/AdminNavbarMenus";
import AdminFooter from "@/admin/pages/AdminFooter";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/stay" element={<StayPage />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="homepage" element={<AdminContentSection menuId="homepage" />} />
        <Route path="contact" element={<AdminContentSection menuId="contact" />} />
        <Route path="stay" element={<AdminContentSection menuId="stay" />} />
        <Route path="navbar" element={<AdminNavbarMenus />} />
        <Route path="footer" element={<AdminFooter />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
