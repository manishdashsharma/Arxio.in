import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../auth/storage";

function apiBase() {
  const explicit = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  if (explicit) return explicit;
  if (import.meta.env.DEV) return "/api";
  return "http://127.0.0.1:8000";
}

async function parseEnvelope(response) {
  const raw = await response.text();
  if (!raw) {
    const hint = response.ok
      ? "The API returned an empty body."
      : `HTTP ${response.status} ${response.statusText}`.trim();
    throw new Error(`Empty API response (${hint})`);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("API returned a non-JSON response");
  }
  if (data?.success) return data.data;
  const message = data?.message || "Request failed";
  const err = new Error(message);
  err.status = data?.statusCode || response.status;
  throw err;
}

let refreshPromise = null;

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${apiBase()}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await parseEnvelope(response);
      if (!data?.access_token || !data?.refresh_token) return false;
      setTokens(data.access_token, data.refresh_token);
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest(path, { method = "GET", body, auth = true, retry = true } = {}) {
  const isFormData = body instanceof FormData;
  const headers = new Headers();
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const access = getAccessToken();
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }
  let response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot reach API. Make sure backend is running on http://127.0.0.1:8000."
      );
    }
    throw error;
  }
  if (response.status === 401 && auth && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiRequest(path, { method, body, auth, retry: false });
    }
    clearTokens();
  }
  return parseEnvelope(response);
}
