import { apiRequest } from "./client";

export function signup(payload) {
  return apiRequest("/auth/signup", { method: "POST", body: payload, auth: false });
}

export function login(payload) {
  return apiRequest("/auth/login", { method: "POST", body: payload, auth: false });
}

export function me() {
  return apiRequest("/auth/me");
}

export function logout(refreshToken) {
  return apiRequest("/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export function verifyEmail(payload) {
  return apiRequest("/auth/verify-email", { method: "POST", body: payload, auth: false });
}

export function resendVerification(payload) {
  return apiRequest("/auth/resend-verification", { method: "POST", body: payload, auth: false });
}
