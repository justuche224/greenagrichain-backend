import { authenticator } from "otplib";

// OTP generation
export function generateOTP() {
  return authenticator.generate("super-secret");
}

// OTP validation
export function isOTPValid(storedOTP, expires, inputOTP) {
  const now = new Date();
  return storedOTP === inputOTP && now < new Date(expires);
}
