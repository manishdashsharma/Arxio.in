import { apiRequest } from "./client";

export function uploadPdf(file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("/pdf/upload", {
    method: "POST",
    body: formData,
    auth: true,
  });
}

export function processWorkspace(workspaceId) {
  return apiRequest(`/pdf/${workspaceId}/process`, {
    method: "POST",
    auth: true,
  });
}

export function getWorkspaceStatus(workspaceId) {
  return apiRequest(`/pdf/${workspaceId}/status`, { auth: true });
}

export async function getWorkspace(workspaceId) {
  const data = await apiRequest(`/pdf/${workspaceId}`, { auth: true });
  const workspace = data?.workspace;
  if (!workspace || typeof workspace !== "object") {
    throw new Error("Invalid workspace response.");
  }
  return workspace;
}

