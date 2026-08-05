import api from "./api";

// Realistic placeholder contract — matches FastAPI/Pydantic conventions
// used by your backend elsewhere (snake_case, /api/v1 prefix).
// Swap only the paths/field names below once backend confirms exact spec.

export async function createPost(data) {
  const response = await api.post("/api/v1/posts", {
    content: data.content,
    platforms: data.platforms,        // array of connected account IDs
    status: data.status,              // "draft" | "scheduled" | "published"
    scheduled_at: data.scheduledAt || null,
    recurrence: data.recurrence || null,   // { frequency, end_date } or null
  });
  return response.data;
}

export async function updatePost(id, data) {
  const response = await api.put(`/api/v1/posts/${id}`, {
    content: data.content,
    platforms: data.platforms,
    status: data.status,
    scheduled_at: data.scheduledAt || null,
    recurrence: data.recurrence || null,
  });
  return response.data;
}

export async function getPosts(params = {}) {
  const response = await api.get("/api/v1/posts", { params });
  return response.data;
}

export async function getDrafts() {
  return getPosts({ status: "draft" });
}

export async function getQueue(statusFilter) {
  return getPosts(statusFilter ? { status: statusFilter } : {});
}

export async function deletePost(id) {
  const response = await api.delete(`/api/v1/posts/${id}`);
  return response.data;
}

export async function retryPost(id) {
  const response = await api.post(`/api/v1/posts/${id}/retry`);
  return response.data;
}

export async function cancelPost(id) {
  const response = await api.patch(`/api/v1/posts/${id}`, { status: "cancelled" });
  return response.data;
}

export async function getPostById(id) {
  const response = await api.get(`/api/v1/posts/${id}`);
  return response.data;
}