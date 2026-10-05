import { useEffect, useState } from "react";
import logo from "@/images/paciano-logo.png";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from "../../api/forgotPassword";

type Step = "form" | "otp";

export default function AdminForgotPassword() {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null,
  );
  const [otpEmail, setOtpEmail] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setOtpExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const requestOtp = async () => {
    if (!username.trim()) {
      toast.error("Enter your username");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    const result = await sendForgotPasswordOtp(username, password);
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? "Could not send OTP");
      return;
    }

    if (!result.verificationToken) {
      toast.error("Could not start OTP verification. Please try again.");
      return;
    }

    setVerificationToken(result.verificationToken);
    setOtpEmail(result.email || "");
    setTestMode(Boolean(result.testMode));
    setOtpExpiresIn(result.expiresIn ?? 600);
    setResendCooldown(30);
    setOtpCode("");
    setStep("otp");
    toast.success(
      result.testMode
        ? "Test OTP ready. Use the configured test code to verify."
        : `OTP sent to ${result.email || "your email"}.`,
    );
  };

  const handleSubmitForm = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await requestOtp();
  };

  const handleVerifyOtp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!verificationToken || otpCode.trim().length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    setVerifying(true);
    const result = await verifyForgotPasswordOtp(
      verificationToken,
      otpCode.trim(),
    );
    setVerifying(false);

    if (result.success) {
      toast.success(
        result.message ??
          "Password reset successfully. Please sign in with your new password.",
      );
      navigate("/admin/login", { replace: true });
    } else {
      toast.error(result.error ?? "OTP verification failed");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || saving) return;
    await requestOtp();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center admin-login-shell">
        <p className="text-[#8A8177]">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center admin-login-shell relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(143,170,66,0.22), transparent 55%)",
        }}
      />

      <Link
        to="/"
        className="absolute top-6 left-6 text-sm text-[#C8BC82]/90 hover:text-[#E8DDAA] transition-colors z-10"
      >
        ← Back to website
      </Link>

      <motion.div
        className="relative w-full max-w-md mx-4 p-8 rounded-2xl admin-login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img
          src={logo}
          alt="Paciano"
          className="h-16 w-auto max-w-[180px] mx-auto mb-4 object-contain"
        />
        <h1 className="font-cormorant text-3xl font-semibold text-center mb-1 text-[#102619]">
          {step === "form" ? "Forgot Password" : "Verify Email OTP"}
        </h1>
        <p className="text-center text-[#8A8177] text-sm mb-8">
          {step === "form"
            ? "Enter your username and choose a new password"
            : "Enter the OTP sent to your registered email to confirm"}
        </p>

        {step === "form" ? (
          <form onSubmit={handleSubmitForm} className="space-y-5">
            <div>
              <label className="block text-sm mb-2 text-[#6E655C]">
                Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl admin-input"
                placeholder="Username"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-[#6E655C]">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl admin-input"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#8A8177] hover:text-[#C4973B] hover:bg-[#FAF7F2] transition-colors"
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
            </div>

            <div>
              <label className="block text-sm mb-2 text-[#6E655C]">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl admin-input"
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#8A8177] hover:text-[#C4973B] hover:bg-[#FAF7F2] transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-[#8A8177]">
              A 6-digit OTP will be sent to the email linked to this username.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl admin-btn-gold font-semibold tracking-wide disabled:opacity-60"
            >
              {saving ? "Sending OTP…" : "Send OTP"}
            </button>

            <p className="text-center text-sm text-[#8A8177]">
              Remember your password?{" "}
              <Link
                to="/admin/login"
                className="text-[#C4973B] hover:underline font-medium"
              >
                Back to login
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <p className="text-sm text-[#6E655C]">
              We sent a 6-digit OTP to{" "}
              <span className="text-[#332C26] font-medium">{otpEmail}</span>.
              Enter it below to set your new password.
            </p>
            {otpExpiresIn > 0 && (
              <p className="text-xs text-[#8A8177]">
                OTP expires in {Math.max(1, Math.ceil(otpExpiresIn / 60))}{" "}
                minutes.
              </p>
            )}
            {testMode && (
              <p className="text-xs text-[#8A8177]">
                Test mode is enabled — use the OTP from your server
                configuration.
              </p>
            )}
            <div>
              <label className="block text-sm mb-2 text-[#6E655C]">
                Enter OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full px-4 py-3 rounded-xl admin-input tracking-[0.35em] text-center text-lg"
                placeholder="••••••"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("form")}
                disabled={verifying}
                className="flex-1 py-3 rounded-xl border border-[#E0D5C8] text-sm text-[#332C26] hover:bg-[#FAF7F2] disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={resendCooldown > 0 || saving || verifying}
                className="flex-1 py-3 rounded-xl border border-[#E0D5C8] text-sm text-[#332C26] hover:bg-[#FAF7F2] disabled:opacity-60"
              >
                {saving
                  ? "Sending…"
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}
              </button>
            </div>
            <button
              type="submit"
              disabled={verifying || otpCode.length !== 6}
              className="w-full py-3.5 rounded-xl admin-btn-gold font-semibold tracking-wide disabled:opacity-60"
            >
              {verifying ? "Verifying…" : "Verify & set password"}
            </button>
            <p className="text-center text-sm text-[#8A8177]">
              <Link
                to="/admin/login"
                className="text-[#C4973B] hover:underline font-medium"
              >
                Back to login
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
