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

export function getWorkspace(workspaceId) {
  return apiRequest(`/pdf/${workspaceId}`, { auth: true });
}

