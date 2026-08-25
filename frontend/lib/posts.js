import api from "./api";

// Realistic placeholder contract — matches FastAPI/Pydantic conventions
// used by your backend elsewhere (snake_case, /api/v1 prefix).
// Swap only the paths/field names below once backend confirms exact spec.

export async function createPost(data) {
  const isRecurring = Boolean(data.recurrence && data.recurrence.frequency);
  const recurrencePattern = isRecurring ? data.recurrence.frequency.toLowerCase() : null;
  const recurrenceEndDate = isRecurring ? data.recurrence.end_date : null;

  const response = await api.post("/api/v1/posts", {
    content: data.content,
    media_urls: data.media_urls || [],
    platforms: data.platforms || [],
    status: data.status || "draft",
    scheduled_at: data.scheduledAt || data.scheduled_at || null,
    campaign_id: data.campaign_id || null,
    is_recurring: isRecurring,
    recurrence_pattern: recurrencePattern,
    recurrence_end_date: recurrenceEndDate,
  });
  return response.data;
}

export async function updatePost(id, data) {
  const isRecurring = Boolean(data.recurrence && data.recurrence.frequency);
  const recurrencePattern = isRecurring ? data.recurrence.frequency.toLowerCase() : null;
  const recurrenceEndDate = isRecurring ? data.recurrence.end_date : null;

  const response = await api.put(`/api/v1/posts/${id}`, {
    content: data.content,
    media_urls: data.media_urls || undefined,
    platforms: data.platforms || undefined,
    status: data.status || undefined,
    scheduled_at: data.scheduledAt || data.scheduled_at || undefined,
    campaign_id: data.campaign_id || undefined,
    is_recurring: isRecurring,
    recurrence_pattern: recurrencePattern,
    recurrence_end_date: recurrenceEndDate,
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