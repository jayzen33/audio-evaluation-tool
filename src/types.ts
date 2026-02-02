export interface AudioData {
  wav: string;
  content: string;
}

export interface AudioItem {
  uuid: string;
  [key: string]: string | AudioData; // Allow dynamic keys like melody_GT, rebuild_01, rebuild_02, rebuild_03
}

export function isAudioData(value: unknown): value is AudioData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'wav' in value &&
    'content' in value
  );
}

// User types for multi-user support
export interface User {
  id: string;           // unique identifier (user input)
  name: string;         // display name
  createdAt: string;    // ISO timestamp
}

export interface UserStorage {
  users: User[];
  currentUserId: string | null;
}

// User-scoped storage key generator
export function getUserScopedKey(baseKey: string, userId: string | null): string {
  const effectiveUserId = userId || 'anonymous';
  return `${baseKey}_${effectiveUserId}`;
}
