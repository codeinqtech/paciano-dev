import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ContactPage from "@/pages/ContactPage";
import StayPage from "@/pages/StayPage";
import IconLibrary from "@/components/common/icons/IconLibrary";


import AdminLayout from "@/admin/layouts/AdminLayout";
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminForgotPassword from "@/admin/pages/AdminForgotPassword";
import Dashboard from "@/admin/pages/Dashboard";
import AdminProfile from "@/admin/pages/AdminProfile";
import AdminUsers from "@/admin/pages/AdminUsers";
import AdminContentSection from "@/admin/pages/AdminContentSection";
import AdminHomepage from "@/admin/pages/AdminHomepage";
import AdminNavbarMenus from "@/admin/pages/AdminNavbarMenus";
import AdminFooter from "@/admin/pages/AdminFooter";
import AdminContactUsSection from "@/admin/pages/AdminContactUsSection";
import AdminGoogleReviews from "@/admin/pages/AdminGoogleReviews";
import {
  AdminAboutSitePage,
  AdminDiningPage,
  AdminExperiencesPage,
  AdminStaysPage,
} from "@/admin/pages/AdminPacianoSectionPages";

import AboutUsPage from "@/pages/AboutUsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/stay" element={<StayPage />} />
      
      {/* Developer Tools */}
      <Route path="/dev/icon-library" element={<IconLibrary />} />
      <Route path="/about" element={<AboutUsPage />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="homepage" element={<AdminHomepage />} />
        <Route
          path="about"
          element={<Navigate to="/admin/about/page" replace />}
        />
        <Route path="about/page" element={<AdminAboutSitePage />} />
        <Route path="about/experiences" element={<AdminExperiencesPage />} />
        <Route
          path="about/story"
          element={<Navigate to="/admin/about/page" replace />}
        />
        <Route
          path="about/our-place"
          element={<Navigate to="/admin/about/page" replace />}
        />
        <Route
          path="experiences"
          element={<Navigate to="/admin/about/experiences" replace />}
        />
        <Route path="stays" element={<AdminStaysPage />} />
        <Route path="dining" element={<AdminDiningPage />} />
        <Route path="contact" element={<AdminContactUsSection />} />
        <Route path="stay" element={<AdminContentSection menuId="stay" />} />
        <Route path="navbar" element={<AdminNavbarMenus />} />
        <Route path="footer" element={<AdminFooter />} />
        <Route path="google-reviews" element={<AdminGoogleReviews />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
