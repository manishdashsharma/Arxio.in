import { apiRequest } from "./client";

export function getSubscription() {
  return apiRequest("/subscription/");
}

export function listWorkspaces(page = 1, limit = 6) {
  return apiRequest(`/pdf/?page=${page}&limit=${limit}`);
}
