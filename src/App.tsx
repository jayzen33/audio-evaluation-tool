import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import ComparisonPage from './pages/ComparisonPage';
import ABTestPage from './pages/ABTestPage';
import MOSPage from './pages/MOSPage';
import HomePage from './pages/HomePage';

// Wrapper components to extract route params
function ComparisonPageWrapper() {
  const { expName } = useParams<{ expName: string }>();
  return <ComparisonPage expName={expName || 'default'} />;
}

function ABTestPageWrapper() {
  const { expName } = useParams<{ expName: string }>();
  return <ABTestPage expName={expName || 'default'} />;
}

function MOSPageWrapper() {
  const { expName } = useParams<{ expName: string }>();
  return <MOSPage expName={expName || 'default'} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Comparison tool routes */}
        <Route path="/compare/:expName" element={<ComparisonPageWrapper />} />
        <Route path="/compare" element={<Navigate to="/compare/default" replace />} />
        
        {/* AB Test routes */}
        <Route path="/abtest/:expName" element={<ABTestPageWrapper />} />
        <Route path="/abtest" element={<Navigate to="/abtest/default" replace />} />
        
        {/* MOS routes */}
        <Route path="/mos/:expName" element={<MOSPageWrapper />} />
        <Route path="/mos" element={<Navigate to="/mos/default" replace />} />
        
        {/* Legacy routes for backward compatibility (redirect old /exp1 style URLs) */}
        <Route path="/:expName" element={<LegacyRedirectWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

// Handles legacy URL format /expName -> redirects to /compare/expName
function LegacyRedirectWrapper() {
  const { expName } = useParams<{ expName: string }>();
  
  // Don't redirect if it looks like a file path
  if (expName?.includes('.') || expName?.startsWith('assets')) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Not found</div>;
  }
  
  return <Navigate to={`/compare/${expName}`} replace />;
}

export default App;
