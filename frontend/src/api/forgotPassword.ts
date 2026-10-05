import { apiRequest } from "./client";

type OtpSendResponse = {
  success: boolean;
  verification_token?: string;
  expires_in?: number;
  email?: string;
  test_mode?: boolean;
  message?: string;
};

export async function sendForgotPasswordOtp(
  username: string,
  password: string,
): Promise<{
  success: boolean;
  verificationToken?: string;
  expiresIn?: number;
  email?: string;
  testMode?: boolean;
  error?: string;
}> {
  try {
    const res = await apiRequest<OtpSendResponse>(
      "/auth/forgot-password/otp/send",
      {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          password_confirmation: password,
        }),
      },
    );
    return {
      success: true,
      verificationToken: res.verification_token,
      expiresIn: res.expires_in,
      email: res.email,
      testMode: res.test_mode,
    };
  } catch (e) {
    const err = e as { message?: string };
    return { success: false, error: err.message || "Could not send OTP" };
  }
}

export async function verifyForgotPasswordOtp(
  verificationToken: string,
  otp: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiRequest("/auth/forgot-password/otp/verify", {
      method: "POST",
      body: JSON.stringify({
        verification_token: verificationToken,
        otp,
      }),
    });
    return { success: true };
  } catch (e) {
    const err = e as { message?: string };
    return { success: false, error: err.message || "Verification failed" };
  }
}
