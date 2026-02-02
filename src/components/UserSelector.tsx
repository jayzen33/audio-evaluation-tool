import { useState, useRef, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { UserLogin } from './UserLogin';

export function UserSelector() {
  const { currentUser, users, logout, switchUser } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const handleSwitchUser = (userId: string) => {
    switchUser(userId);
    setIsDropdownOpen(false);
  };

  // Get other users for switching
  const otherUsers = users.filter(u => u.id !== currentUser?.id);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {currentUser ? (
          // Logged in state
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-indigo-900 max-w-[120px] truncate hidden sm:inline">
              {currentUser.name}
            </span>
            <svg 
              className={`w-4 h-4 text-indigo-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          // Anonymous state
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">Sign In</span>
          </button>
        )}

        {/* Dropdown Menu */}
        {isDropdownOpen && currentUser && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
            {/* Current User Info */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate">{currentUser.name}</div>
                  <div className="text-xs text-slate-500 truncate">ID: {currentUser.id}</div>
                </div>
              </div>
            </div>

            {/* Other Users - Switch to */}
            {otherUsers.length > 0 && (
              <div className="py-1">
                <div className="px-4 py-1 text-xs font-medium text-slate-400 uppercase">
                  Switch to
                </div>
                {otherUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleSwitchUser(user.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{user.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-slate-100 pt-1 mt-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setShowLoginModal(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add new user
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <UserLogin 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}
