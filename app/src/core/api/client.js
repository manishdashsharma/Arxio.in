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
const inflightRequests = new Map();
const responseCache = new Map();
const DEFAULT_GET_CACHE_TTL_MS = 5000;

function serializeBody(body) {
  if (body === undefined || body === null) return "";
  if (body instanceof FormData) return "__formdata__";
  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
}

function requestKey(path, { method = "GET", body, auth = true } = {}) {
  return `${method.toUpperCase()}|${auth ? "auth" : "public"}|${path}|${serializeBody(body)}`;
}

function clearApiCache() {
  responseCache.clear();
}

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

async function fetchWithAuth(path, { method = "GET", body, auth = true, retry = true } = {}) {
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
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
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
      return fetchWithAuth(path, { method, body, auth, retry: false });
    }
    clearTokens();
  }
  return response;
}

export async function apiRequest(path, options) {
  const method = (options?.method || "GET").toUpperCase();
  const cache = options?.cache !== false;
  const cacheTtlMs = Number(options?.cacheTtlMs) > 0 ? Number(options.cacheTtlMs) : DEFAULT_GET_CACHE_TTL_MS;
  const key = requestKey(path, options);
  const now = Date.now();

  if (method === "GET" && cache) {
    const cached = responseCache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }
  }

  if (inflightRequests.has(key)) {
    return inflightRequests.get(key);
  }

  const requestPromise = (async () => {
    const response = await fetchWithAuth(path, options);
    const data = await parseEnvelope(response);
    if (method === "GET" && cache) {
      responseCache.set(key, { data, expiresAt: Date.now() + cacheTtlMs });
    } else if (method !== "GET") {
      clearApiCache();
    }
    return data;
  })();

  inflightRequests.set(key, requestPromise);
  try {
    return await requestPromise;
  } finally {
    inflightRequests.delete(key);
  }
}

/**
 * Authenticated GET returning a Blob (e.g. file export). Parses JSON error bodies when status is not OK.
 */
export async function apiBinaryRequest(path, { auth = true, retry = true } = {}) {
  const response = await fetchWithAuth(path, { method: "GET", body: undefined, auth, retry });
  if (response.ok) {
    return response.blob();
  }
  const raw = await response.text();
  let message = `HTTP ${response.status}`;
  try {
    const data = JSON.parse(raw);
    message = data?.message || data?.detail || message;
  } catch {
    if (raw) message = raw.slice(0, 200);
  }
  const err = new Error(message);
  err.status = response.status;
  throw err;
}

export { clearApiCache };
