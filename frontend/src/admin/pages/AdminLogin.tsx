import { useCallback, useState } from "react";
import logo from "@/images/paciano-logo.png";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../data/permissions";
const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCaptcha(length = 5): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return out;
}

export default function AdminLogin() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginId.trim()) {
      toast.error("Enter your username or email");
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      toast.error("Captcha does not match. Please try again.");
      refreshCaptcha();
      return;
    }
    setSubmitting(true);
    const result = await login(loginId.trim(), password);
    setSubmitting(false);

    if (result.success) {
      const roleLabel =
        result.user?.role === ROLES.SUPERADMIN ? "Super Admin" : "Admin";
      toast.success(`Welcome, ${roleLabel}!`);
      navigate("/admin", { replace: true });
    } else {
      toast.error(result.error || "Could not sign in");
      refreshCaptcha();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center admin-login-shell">
        <p className="text-[#8A9B82]">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center admin-login-shell relative overflow-hidden px-4">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(143,170,66,0.22), transparent 55%), radial-gradient(circle at 80% 70%, rgba(200,188,130,0.12), transparent 45%)",
        }}
      />

      <Link
        to="/"
        className="absolute top-6 left-6 text-sm text-[#C8BC82]/90 hover:text-[#E8DDAA] transition-colors z-10"
      >
        ← Back to website
      </Link>

      <motion.div
        className="relative w-full max-w-md p-8 sm:p-10 rounded-2xl admin-login-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img
          src={logo}
          alt="Paciano"
          className="h-16 w-auto max-w-[180px] mx-auto mb-6 object-contain"
        />
        <h1 className="font-cormorant text-3xl font-semibold text-center mb-1 text-[#102619]">
          Admin Login
        </h1>
        <p className="text-center text-[#6E7A66] text-sm mb-8 font-manrope">
          Sign in to manage the Paciano website
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-2 text-[#4A5644] font-manrope">
              Username or email
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl admin-input"
              placeholder="Username or email"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#4A5644] font-manrope">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl admin-input"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#8A9B82] hover:text-[#8FAA42]"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link
                to="/admin/forgot-password"
                className="text-sm text-[#6B7F38] hover:underline font-manrope"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#4A5644] font-manrope">
              Captcha
            </label>
            <div className="flex items-stretch gap-2 mb-2">
              <div
                className="flex-1 flex items-center justify-center select-none rounded-xl border border-[#D5CA9A]/35 bg-[#F8F5EE] px-3 py-2.5 tracking-[0.35em] font-bold text-lg text-[#102619]"
                style={{
                  fontFamily: "'Courier New', monospace",
                  backgroundImage:
                    "repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(143,170,66,0.08) 8px, rgba(143,170,66,0.08) 16px)",
                }}
                aria-hidden
              >
                {captchaCode}
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="px-3 rounded-xl border border-[#D5CA9A]/35 text-[#8A9B82] hover:text-[#8FAA42] hover:bg-[#F8F5EE]"
                aria-label="Refresh captcha"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              autoComplete="off"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl admin-input uppercase tracking-widest"
              placeholder="Enter captcha"
              maxLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl admin-btn-gold font-semibold tracking-wide disabled:opacity-60 font-manrope"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
