import { apiRequest } from "./client";

export function listPlans() {
  return apiRequest("/subscription/plans");
}

export function activatePlan(body) {
  return apiRequest("/subscription/activate", { method: "POST", body });
}
