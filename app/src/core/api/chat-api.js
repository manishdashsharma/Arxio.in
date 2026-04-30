import { apiRequest } from "./client";

export function getChatHistory(workspaceId, { page = 1, limit = 50 } = {}) {
  return apiRequest(`/chat/${workspaceId}/history?page=${page}&limit=${limit}`, { auth: true });
}

export function sendChatMessage(body) {
  return apiRequest("/chat/message", {
    method: "POST",
    body,
    auth: true,
  });
}
