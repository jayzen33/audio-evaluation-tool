# AGENTS.md - Agentic Coding Guidelines

This file provides guidelines for agentic coding agents working in this repository.

## Project Overview

Audio Evaluation Tools is a web-based application for comparing audio model outputs (TTS, SVS). It consists of:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Python Flask + SQLite (optional, for persistence)

## Build/Lint/Test Commands

### Frontend (Node.js)

```bash
# Install dependencies
npm install

# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Build for GitHub Pages deployment
npm run build:gh-pages

# Deploy to GitHub Pages
npm run deploy

# Run ESLint (required before committing)
npm run lint

# Preview production build locally
npm run preview

# Copy audio files to public directory
npm run copy-audio
```

### Running a Single Test

No test framework is currently configured. To add tests, install Vitest:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to package.json scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

Run a single test file:
```bash
npm test run src/components/AudioPlayer.test.tsx
```

### Backend (Python)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run Flask backend (port 5000)
python app.py

# Or use the run script
./run.sh
```

## Code Style Guidelines

### TypeScript

- **Use TypeScript for all new code** (required per CONTRIBUTING.md)
- Enable `strict: true` in tsconfig
- Prefer `interface` over `type` for public APIs
- Use `import type` for type-only imports to improve performance

### React Components

- Use functional components with hooks (React 19)
- Use named exports for components: `export const AudioPlayer: React.FC<Props> = (...)`
- Use default exports for page components: `export default function ComparisonPage(...)`
- Define prop interfaces in the same file, above the component
- Use `useCallback`, `useMemo`, and `useRef` for performance optimization
- Always include `key` prop when mapping arrays
- Prefer early returns for loading/error states

### Naming Conventions

- **Components**: PascalCase (e.g., `AudioPlayer`, `ComparisonPage`)
- **Variables/functions**: camelCase (e.g., `handleTagChange`, `tagStats`)
- **Interfaces**: PascalCase with descriptive names (e.g., `AudioItem`, `AudioData`)
- **Constants**: SCREAMING_SNAKE_CASE for config values
- **Files**: kebab-case for components/pages (e.g., `audio-player.tsx`, `comparison-page.tsx`)

### Imports

Order imports consistently:
1. React/built-in imports
2. External libraries (react-router-dom, etc.)
3. Type imports (`import type {...}`)
4. Component imports
5. Hook imports
6. Utils/services imports

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { AudioItem, AudioData } from '../types';
import { AudioComparisonRow } from '../components/AudioComparisonRow';
import { useUser } from '../hooks/useUser';
import { loadProgress, saveProgress } from '../utils/storage';
```

### Error Handling

- Use try/catch for async operations
- Log errors with `console.error()` including descriptive messages
- Set error state in React components to display user-friendly messages
- Validate data in backend endpoints, return appropriate HTTP status codes

```typescript
try {
  const data = await fetchData();
  setData(data);
} catch (err) {
  console.error('Failed to load data:', err);
  setError('Failed to load data. Please try again.');
}
```

### Styling (Tailwind CSS)

- Use Tailwind utility classes for all styling
- Use consistent color palette (slate, indigo, emerald, amber, rose)
- Use responsive breakpoints: `md:`, `lg:`, `xl:`
- Group related classes: layout → spacing → sizing → colors → states

```tsx
<div className="flex items-center justify-between gap-4 px-6 py-4 bg-white border-b border-slate-200">
```

### Python Backend (Flask)

- Use type hints for function parameters and return types
- Use `sqlite3.Row` factory for dictionary-like row access
- Validate all input data in endpoints
- Return JSON responses with appropriate HTTP status codes
- Use connection pooling via Flask's `g` object for database

```python
from typing import Any

@app.route("/api/users/<user_id>", methods=["GET"])
def get_user(user_id: str):
    db = get_db()
    user = db.execute(
        "SELECT id, name, created_at FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    
    if user is None:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({"id": user["id"], "name": user["name"]})
```

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/          # Route-level page components
├── hooks/         # Custom React hooks
├── contexts/      # React context providers
├── utils/         # Utility functions
└── types.ts       # Shared TypeScript types
```

### Git Conventions

- **Always seek user approval before performing any Git operations that modify the repository state** (commit, push, pull, branch, reset, rebase, etc.)
- Read-only operations (status, log, diff, show, etc.) do not require approval
- Create feature branches: `git checkout -b feature/your-feature`
- Use clear, descriptive commit messages
- Run `npm run lint` before committing
- Follow conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`

## Additional Notes

- Audio files are stored in `public/audio/` and data JSON in `public/data/`
- The app supports multiple experiments (e.g., `/compare/exp1`, `/abtest/exp1`)
- User progress can be stored locally (localStorage) or in the Flask backend
- Use `requestAnimationFrame` to avoid React cascading renders warnings
