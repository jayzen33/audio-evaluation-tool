import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, UserStorage } from '../types';
import { UserContext } from './UserContextDefinition';
import { listUsers, createUser, healthCheck } from '../utils/api';

const USERS_STORAGE_KEY = 'audio_eval_users';
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND !== 'false'; // Default to true

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Check backend availability
  useEffect(() => {
    if (USE_BACKEND) {
      healthCheck()
        .then(() => setBackendAvailable(true))
        .catch(() => setBackendAvailable(false));
    }
  }, []);

  // Load users and current user
  useEffect(() => {
    const frameId = requestAnimationFrame(async () => {
      try {
        let loadedUsers: User[] = [];

        if (backendAvailable && USE_BACKEND) {
          // Load from backend
          try {
            loadedUsers = await listUsers();
          } catch (err) {
            console.error('Failed to load users from backend:', err);
          }
        }

        // Also load from localStorage for offline/local users
        const usersData = localStorage.getItem(USERS_STORAGE_KEY);
        if (usersData) {
          const parsed: UserStorage = JSON.parse(usersData);
          const localUsers = parsed.users || [];
          
          // Merge backend and local users (local takes precedence for same ID)
          const userMap = new Map<string, User>();
          loadedUsers.forEach(u => userMap.set(u.id, u));
          localUsers.forEach(u => userMap.set(u.id, u));
          loadedUsers = Array.from(userMap.values());
        }

        setUsers(loadedUsers);

        // Load current user if exists
        const savedStorage = localStorage.getItem(USERS_STORAGE_KEY);
        if (savedStorage) {
          const parsed: UserStorage = JSON.parse(savedStorage);
          if (parsed.currentUserId) {
            const user = loadedUsers.find(u => u.id === parsed.currentUserId);
            if (user) {
              setCurrentUser(user);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setIsLoading(false);
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [backendAvailable]);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        const storage: UserStorage = {
          users,
          currentUserId: currentUser?.id || null,
        };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storage));
      } catch (err) {
        console.error('Failed to save user data:', err);
      }
    }
  }, [users, currentUser, isLoading]);

  const login = useCallback(async (userId: string, name?: string) => {
    const trimmedId = userId.trim();
    if (!trimmedId) return;

    const trimmedName = (name || userId).trim();
    
    // Check if user already exists locally
    const existingUser = users.find(u => u.id === trimmedId);
    
    if (existingUser) {
      // Update name if changed
      if (existingUser.name !== trimmedName) {
        setUsers(prev => prev.map(u => 
          u.id === trimmedId ? { ...u, name: trimmedName } : u
        ));
      }
      setCurrentUser({ ...existingUser, name: trimmedName });
    } else {
      // Create new user
      const newUser: User = {
        id: trimmedId,
        name: trimmedName,
        createdAt: new Date().toISOString(),
      };

      // Sync to backend if available
      if (backendAvailable && USE_BACKEND) {
        try {
          await createUser(trimmedId, trimmedName);
        } catch (err) {
          console.error('Failed to create user on backend:', err);
        }
      }

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    }
  }, [users, backendAvailable]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const switchUser = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  }, [users]);

  const value = {
    users,
    currentUser,
    isLoading,
    login,
    logout,
    switchUser,
    hasUsers: users.length > 0,
    backendAvailable,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
