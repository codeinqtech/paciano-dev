import { useState } from "react";
import { Shield, KeyRound, Mail, Phone, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ASSIGNABLE_MENUS } from "../data/permissions";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function AdminProfile() {
  const { user, isSuperAdmin } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);

  if (!user) return null;

  const permissionLabels = isSuperAdmin
    ? ["Full access (all menus)"]
    : (user.permissions || [])
        .map((id) => ASSIGNABLE_MENUS.find((m) => m.id === id)?.label)
        .filter(Boolean);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold admin-page-title mb-8">My Profile</h1>

      <div className="admin-card rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-[#F0E9DF]">
          <div className="w-16 h-16 rounded-full admin-btn-gold flex items-center justify-center text-[#1e1a17] font-bold text-xl">
            {user.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#332C26]">{user.name}</h2>
            <span
              className={`inline-flex items-center gap-1 mt-1 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isSuperAdmin ? "admin-badge-super" : "admin-badge-admin"
              }`}
            >
              {isSuperAdmin && <Shield className="w-3 h-3" />}
              {isSuperAdmin ? "Super Admin" : "Admin"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[#332C26]">
            <User className="w-4 h-4 text-[#8A8177] shrink-0" />
            <span className="text-sm">{user.name}</span>
          </div>
          <div className="flex items-center gap-3 text-[#332C26]">
            <Mail className="w-4 h-4 text-[#8A8177] shrink-0" />
            <span className="text-sm">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 text-[#332C26]">
              <Phone className="w-4 h-4 text-[#8A8177] shrink-0" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#F0E9DF]">
          <h3 className="text-sm font-medium text-[#332C26] mb-3">Allowed pages</h3>
          <div className="flex flex-wrap gap-2">
            {permissionLabels.map((label) => (
              <span
                key={label}
                className="text-xs px-3 py-1 rounded-full bg-[#FAF7F2] text-[#6E655C] border border-[#E8DFD2]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPasswordOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E0D5C8] text-sm text-[#332C26] hover:bg-[#FAF7F2] transition-colors"
        >
          <KeyRound className="w-4 h-4" />
          Change Password
        </button>
      </div>

      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </div>
  );
}
