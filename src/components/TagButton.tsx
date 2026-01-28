import React from 'react';

export type TagValue = 'good' | 'bad' | 'maybe' | null;

interface TagButtonProps {
  value: TagValue;
  onChange: (value: TagValue) => void;
  disabled?: boolean;
}

const tagOptions: { value: TagValue; label: string; icon: React.ReactNode; activeClass: string }[] = [
  {
    value: 'good',
    label: 'Good',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
      </svg>
    ),
    activeClass: 'bg-emerald-500 text-white shadow-emerald-200',
  },
  {
    value: 'maybe',
    label: 'Maybe',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    activeClass: 'bg-amber-500 text-white shadow-amber-200',
  },
  {
    value: 'bad',
    label: 'Bad',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
      </svg>
    ),
    activeClass: 'bg-rose-500 text-white shadow-rose-200',
  },
];

export const TagButton: React.FC<TagButtonProps> = ({ value, onChange, disabled }) => {
  const handleClick = (newValue: TagValue) => {
    // Toggle off if clicking the same value
    if (value === newValue) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {tagOptions.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => handleClick(option.value)}
            disabled={disabled}
            title={option.label}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              isActive
                ? `${option.activeClass} shadow-md scale-110`
                : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
};

export const TagBadge: React.FC<{ value: TagValue }> = ({ value }) => {
  if (!value) return null;

  const config = {
    good: { label: 'Good', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    maybe: { label: 'Maybe', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    bad: { label: 'Bad', class: 'bg-rose-100 text-rose-700 border-rose-200' },
  };

  const { label, class: className } = config[value];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
};
