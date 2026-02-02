/**
 * API client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== User API ====================

export interface ApiUser {
  id: string;
  name: string;
  createdAt: string;
}

export async function listUsers(): Promise<ApiUser[]> {
  return apiRequest<ApiUser[]>("/api/users");
}

export async function getUser(userId: string): Promise<ApiUser> {
  return apiRequest<ApiUser>(`/api/users/${encodeURIComponent(userId)}`);
}

export async function createUser(userId: string, name?: string): Promise<ApiUser> {
  return apiRequest<ApiUser>("/api/users", {
    method: "POST",
    body: JSON.stringify({ id: userId, name: name || userId }),
  });
}

export async function deleteUser(userId: string): Promise<{ message: string; userId: string }> {
  return apiRequest<{ message: string; userId: string }>(`/api/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

export interface UserProgressSummary {
  tool: string;
  experiment: string;
  itemCount: number;
  updatedAt: string;
}

export async function listUserProgress(userId: string): Promise<{ userId: string; progress: UserProgressSummary[] }> {
  return apiRequest<{ userId: string; progress: UserProgressSummary[] }>(
    `/api/users/${encodeURIComponent(userId)}/progress`
  );
}

// ==================== Progress API ====================

export interface ProgressData {
  userId: string;
  tool: string;
  experiment: string;
  data: unknown;
  updatedAt: string | null;
}

export async function getProgress(
  tool: string,
  experiment: string,
  userId: string
): Promise<ProgressData> {
  return apiRequest<ProgressData>(
    `/api/progress/${encodeURIComponent(tool)}/${encodeURIComponent(experiment)}/${encodeURIComponent(userId)}`
  );
}

export async function saveProgress(
  tool: string,
  experiment: string,
  userId: string,
  data: unknown
): Promise<ProgressData> {
  return apiRequest<ProgressData>(
    `/api/progress/${encodeURIComponent(tool)}/${encodeURIComponent(experiment)}/${encodeURIComponent(userId)}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteProgress(
  tool: string,
  experiment: string,
  userId: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/api/progress/${encodeURIComponent(tool)}/${encodeURIComponent(experiment)}/${encodeURIComponent(userId)}`,
    { method: "DELETE" }
  );
}

export interface ExportedProgress {
  tool: string;
  experiment: string;
  data: unknown;
  updatedAt: string;
}

export async function exportAllProgress(userId: string): Promise<{
  userId: string;
  exportedAt: string;
  progress: ExportedProgress[];
}> {
  return apiRequest<{
    userId: string;
    exportedAt: string;
    progress: ExportedProgress[];
  }>(`/api/progress/export/${encodeURIComponent(userId)}`);
}

// ==================== Health Check ====================

export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return apiRequest<{ status: string; timestamp: string }>("/api/health");
}
