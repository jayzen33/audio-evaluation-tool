import { createContext } from 'react';
import type { User } from '../types';

export interface UserContextType {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  login: (userId: string, name?: string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  hasUsers: boolean;
  backendAvailable: boolean;
}

export const UserContext = createContext<UserContextType | null>(null);
