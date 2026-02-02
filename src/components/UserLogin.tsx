import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../hooks/useUser';

interface UserLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserLogin({ isOpen, onClose }: UserLoginProps) {
  const { login } = useUser();
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedId = userId.trim();
    if (!trimmedId) {
      setError('Please enter a user ID');
      return;
    }

    login(trimmedId, userName.trim() || trimmedId);
    setUserId('');
    setUserName('');
    onClose();
  };

  const handleContinueAnonymous = () => {
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleContinueAnonymous}
        />
        {/* Modal Content */}
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto pointer-events-auto"
          style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '28rem',
            maxHeight: '90vh',
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="px-6 py-4"
            style={{
              background: 'linear-gradient(to right, #6366f1, #a855f7)',
              padding: '1rem 1.5rem',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
            }}
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Select User
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Sign in to save your progress across sessions
            </p>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Create New User Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    User ID <span className="text-slate-400">(used to identify you)</span>
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g., evaluator001"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Display Name <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={userId || 'Your name'}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-md transition-all"
                  >
                    Create User
                  </button>
                </div>
              </form>

            {/* Continue as Anonymous */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={handleContinueAnonymous}
                className="w-full px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-sm"
              >
                Continue without signing in
              </button>
              <p className="text-xs text-slate-400 text-center mt-2">
                Your progress will only be saved on this device
              </p>
            </div>
          </div>
        </div>
      </>
    </div>,
    document.body
  );
}
