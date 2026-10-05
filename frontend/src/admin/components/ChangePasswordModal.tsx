import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "form" | "otp";

export default function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  const { user, sendChangePasswordOtp, verifyChangePasswordOtp } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
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
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const reset = () => {
    setStep("form");
    setForm({ current: "", next: "", confirm: "" });
    setShowCurrent(false);
    setShowNext(false);
    setShowConfirm(false);
    setOtpCode("");
    setVerificationToken(null);
    setOtpEmail("");
    setTestMode(false);
    setOtpExpiresIn(0);
    setResendCooldown(0);
  };

  const handleClose = () => {
    if (saving || verifying) return;
    reset();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      setOtpExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const requestOtp = async () => {
    if (form.next !== form.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.next.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setSaving(true);
    const result = await sendChangePasswordOtp(form.current, form.next);
    setSaving(false);

    if (!result.success || !result.verificationToken) {
      toast.error(result.error ?? "Could not send OTP");
      return;
    }

    setVerificationToken(result.verificationToken);
    setOtpEmail(result.email || user?.email || "");
    setTestMode(Boolean(result.testMode));
    setOtpExpiresIn(result.expiresIn ?? 600);
    setResendCooldown(30);
    setOtpCode("");
    setStep("otp");
    toast.success(
      result.testMode
        ? "Test OTP ready. Use 999999 to verify."
        : `OTP sent to ${result.email || "your email"}.`,
    );
  };

  const handleSubmitForm = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await requestOtp();
  };

  const handleVerifyOtp = async (e?: React.SyntheticEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!verificationToken || otpCode.trim().length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    setVerifying(true);
    const result = await verifyChangePasswordOtp(
      verificationToken,
      otpCode.trim(),
    );
    setVerifying(false);

    if (result.success) {
      toast.success("Password updated successfully");
      reset();
      onClose();
    } else {
      toast.error(result.error ?? "OTP verification failed");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || saving) return;
    await requestOtp();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center admin-modal-overlay p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md p-8 rounded-2xl admin-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#2A211C]">
                {step === "form" ? "Change Password" : "Verify Email OTP"}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-[#8A8177] hover:text-[#332C26]"
                disabled={saving || verifying}
              >
                <X />
              </button>
            </div>

            {step === "form" ? (
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-[#6E655C]">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={form.current}
                      onChange={(e) =>
                        setForm({ ...form, current: e.target.value })
                      }
                      className="w-full px-4 py-2.5 pr-11 rounded-lg admin-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#8A8177] hover:text-[#C4973B] hover:bg-[#FAF7F2] transition-colors"
                      aria-label={
                        showCurrent ? "Hide password" : "Show password"
                      }
                      tabIndex={-1}
                    >
                      {showCurrent ? (
                        <EyeOff className="w-[18px] h-[18px]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[#6E655C]">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNext ? "text" : "password"}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={form.next}
                      onChange={(e) =>
                        setForm({ ...form, next: e.target.value })
                      }
                      className="w-full px-4 py-2.5 pr-11 rounded-lg admin-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNext((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#8A8177] hover:text-[#C4973B] hover:bg-[#FAF7F2] transition-colors"
                      aria-label={showNext ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showNext ? (
                        <EyeOff className="w-[18px] h-[18px]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[#6E655C]">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={form.confirm}
                      onChange={(e) =>
                        setForm({ ...form, confirm: e.target.value })
                      }
                      className="w-full px-4 py-2.5 pr-11 rounded-lg admin-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#8A8177] hover:text-[#C4973B] hover:bg-[#FAF7F2] transition-colors"
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
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
                  An OTP will be sent to{" "}
                  <span className="text-[#332C26]">{user?.email}</span> to
                  confirm this change.
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl admin-btn-gold font-medium disabled:opacity-60"
                >
                  {saving ? "Sending OTP…" : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-sm text-[#6E655C]">
                  We sent a 6-digit OTP to{" "}
                  <span className="text-[#332C26] font-medium">
                    {otpEmail || user?.email}
                  </span>
                  . Enter it below to update your password.
                </p>
                {otpExpiresIn > 0 && (
                  <p className="text-xs text-[#8A8177]">
                    OTP expires in {Math.max(1, Math.ceil(otpExpiresIn / 60))}{" "}
                    minutes.
                  </p>
                )}
                {testMode && (
                  <p className="text-xs text-[#8A8177]">
                    Temporary OTP for testing:{" "}
                    <span className="text-[#C4973B] font-medium">999999</span>
                  </p>
                )}
                <div>
                  <label className="block text-sm mb-1 text-[#6E655C]">
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
                    className="w-full px-4 py-2.5 rounded-lg admin-input tracking-[0.35em] text-center text-lg"
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
                  className="w-full py-3 rounded-xl admin-btn-gold font-medium disabled:opacity-60"
                >
                  {verifying ? "Verifying…" : "Verify & Update Password"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
