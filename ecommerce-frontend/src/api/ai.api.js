import api from "./api";

export const sendChatMessage = (messages) =>
  api.post("/ai/chat", { messages });

export const translateSearchQuery = (query) =>
  api.post("/ai/search-translate", { query });
