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
