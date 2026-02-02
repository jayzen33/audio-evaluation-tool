import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { AudioItem, AudioData } from '../types';
import { isAudioData } from '../types';
import { AudioPlayer } from '../components/AudioPlayer';
import { ContentDisplay } from '../components/ContentDisplay';
import { Logo } from '../components/Logo';
import { UserSelector } from '../components/UserSelector';
import { useUser } from '../hooks/useUser';
import { getABTestStorageKey, getABTestBlindModeKey, loadProgress, saveProgressHybrid } from '../utils/storage';

// Selection type: { [uuid]: selectedVariantKey }
type SelectionState = Record<string, string | null>;

interface ABTestPageProps {
  expName: string;
}

// AB Test comparison row component
interface ABTestRowProps {
  item: AudioItem;
  index: number;
  selectedVariant: string | null;
  onSelect: (variantKey: string) => void;
  blindMode: boolean;
}

function ABTestRow({ item, index, selectedVariant, onSelect, blindMode }: ABTestRowProps) {
  const { uuid, ...variants } = item;

  const gtData = variants['melody_GT'];
  const gtContentText = isAudioData(gtData) 
    ? gtData.content
    : undefined;

  // Filter out ground truth from selectable options
  const variantKeys = Object.keys(variants).filter(key => key !== 'melody_GT');
  
  // Deterministic shuffle based on uuid for consistent blind testing
  const shuffledKeys = useMemo(() => {
    const keys = [...variantKeys];
    // Simple deterministic shuffle using uuid as seed
    let seed = 0;
    for (let i = 0; i < uuid.length; i++) {
      seed = ((seed << 5) - seed) + uuid.charCodeAt(i);
      seed = seed & seed; // Convert to 32bit integer
    }
    // Fisher-Yates shuffle with deterministic pseudo-random
    for (let i = keys.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    return keys;
  }, [uuid, variantKeys]);

  const isSelected = selectedVariant !== null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header with ID and selection status */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold">
            #{index + 1}
          </span>
          <h3 className="text-base font-semibold text-slate-800 font-mono">{uuid}</h3>
        </div>
        <div className="flex items-center gap-3">
          {isSelected ? (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
              ✓ Selected: {blindMode ? 'Option ' + String.fromCharCode(65 + shuffledKeys.indexOf(selectedVariant!)) : selectedVariant}
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium">
              Please select one option
            </span>
          )}
        </div>
      </div>

      {/* Ground Truth Section */}
      {isAudioData(gtData) && (
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Reference (Ground Truth)
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AudioPlayer src={gtData.wav} isGt={true} />
            <ContentDisplay 
              text={gtData.content} 
              className="h-24 overflow-y-auto"
              isGt={true}
            />
          </div>
        </div>
      )}

      {/* Selectable Variants Grid */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-slate-600 mb-3">Select your preferred option:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shuffledKeys.map((key, idx) => {
            const data = variants[key];
            if (!isAudioData(data)) return null;

            const audioSrc = data.wav;
            const contentText = data.content;
            const isThisSelected = selectedVariant === key;
            const displayLabel = blindMode 
              ? `Option ${String.fromCharCode(65 + idx)}` // A, B, C, D...
              : key;

            return (
              <div 
                key={key}
                onClick={() => onSelect(key)}
                className={`rounded-xl p-4 cursor-pointer transition-all duration-200 relative ${
                  isThisSelected
                    ? 'bg-emerald-50 border-2 border-emerald-400 shadow-md ring-2 ring-emerald-200'
                    : 'bg-slate-50 border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                {/* Selection indicator */}
                <div className="absolute top-3 right-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isThisSelected
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {isThisSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Variant Label */}
                <div className="mb-3 pr-8">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    isThisSelected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    {displayLabel}
                  </span>
                </div>
                
                {/* Audio Player */}
                <div className="mb-3">
                  <AudioPlayer src={audioSrc} isGt={false} />
                </div>
                
                {/* Content */}
                <div>
                  <ContentDisplay 
                    text={contentText} 
                    originalText={gtContentText}
                    className="h-32 overflow-y-auto"
                    isGt={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ABTestPage({ expName }: ABTestPageProps) {
  const [data, setData] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<SelectionState>({});
  const [blindMode, setBlindMode] = useState(true); // Default to blind mode for unbiased testing
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentUser } = useUser();
  
  // Use refs to track current context for saves
  const currentExpRef = useRef(expName);
  const currentUserRef = useRef(currentUser?.id || null);
  const hasLoadedOnce = useRef(false);
  
  // Update refs when context changes
  useEffect(() => {
    currentExpRef.current = expName;
    currentUserRef.current = currentUser?.id || null;
  }, [expName, currentUser?.id]);

  // Load selections from backend/localStorage when expName or currentUser changes
  useEffect(() => {
    setIsInitialized(false);
    hasLoadedOnce.current = false;
    const frameId = requestAnimationFrame(async () => {
      try {
        const storageKey = getABTestStorageKey(expName, currentUser?.id || null);
        const savedSelections = await loadProgress<SelectionState>('abtest', expName, currentUser?.id || null, storageKey);
        setSelections(savedSelections || {});
        
        // Load blind mode preference (local only)
        const blindModeKey = getABTestBlindModeKey(expName, currentUser?.id || null);
        const blindModePref = localStorage.getItem(blindModeKey);
        if (blindModePref !== null) {
          setBlindMode(JSON.parse(blindModePref));
        }
        hasLoadedOnce.current = true;
      } catch (err) {
        console.error('Failed to load selections:', err);
        setSelections({});
        hasLoadedOnce.current = true;
      } finally {
        setIsInitialized(true);
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [expName, currentUser?.id]);

  // Save selections to backend/localStorage whenever they change (but not during initial load)
  useEffect(() => {
    if (!isInitialized || !hasLoadedOnce.current) return;
    
    const saveData = async () => {
      try {
        const storageKey = getABTestStorageKey(currentExpRef.current, currentUserRef.current);
        await saveProgressHybrid('abtest', currentExpRef.current, currentUserRef.current, storageKey, selections);
      } catch (err) {
        console.error('Failed to save selections:', err);
      }
    };
    saveData();
  }, [selections, isInitialized]);

  // Save blind mode preference
  useEffect(() => {
    const blindModeKey = getABTestBlindModeKey(expName, currentUser?.id || null);
    localStorage.setItem(blindModeKey, JSON.stringify(blindMode));
  }, [blindMode, expName, currentUser?.id]);

  // Handle selection
  const handleSelect = useCallback((uuid: string, variantKey: string) => {
    setSelections(prev => ({
      ...prev,
      [uuid]: variantKey
    }));
  }, []);

  // Calculate progress stats
  const stats = useMemo(() => {
    const total = data.length;
    const completed = Object.values(selections).filter(s => s !== null).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, progress };
  }, [data.length, selections]);

  // Export selections as JSON
  const handleExport = useCallback(() => {
    const exportData = {
      experiment: expName,
      user: currentUser?.id || 'anonymous',
      testType: 'abtest',
      exportedAt: new Date().toISOString(),
      blindMode,
      selections: selections,
      summary: {
        total: stats.total,
        completed: stats.completed,
        completionRate: `${stats.progress}%`
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abtest_${expName}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selections, expName, blindMode, stats, currentUser?.id]);

  // Clear all selections
  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all selections? This cannot be undone.')) {
      setSelections({});
    }
  }, []);

  // Load data based on experiment name
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setLoading(true);
      setError(null);
      
      const baseUrl = import.meta.env.BASE_URL || '/';
      const dataUrl = `${baseUrl}data/abtest/${expName}/data.json`;
      
      fetch(dataUrl)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load data from ${dataUrl}`);
          return res.json();
        })
        .then((jsonData: Record<string, Array<Record<string, AudioData>>>) => {
          const transformedData: AudioItem[] = Object.entries(jsonData).map(([uuid, variants]) => {
            const item: AudioItem = { uuid };
            variants.forEach(variantObj => {
              const [key, value] = Object.entries(variantObj)[0];
              item[key] = value;
            });
            return item;
          });
          setData(transformedData);
        })
        .catch(err => {
          console.error(err);
          setError(`Failed to load AB test data for experiment "${expName}". Make sure the data file exists at ${dataUrl}.`);
        })
        .finally(() => setLoading(false));
    });
    return () => cancelAnimationFrame(frameId);
  }, [expName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-500">Loading AB test data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-500 max-w-2xl text-center px-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Logo size={40} className="shadow-lg shadow-indigo-200 rounded-xl" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                AB Test Evaluation
              </h1>
              <div className="text-xs text-indigo-600 font-medium">
                Experiment: {expName}
              </div>
            </div>
            <span className="ml-3 px-2 py-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
              ⏳ Audio loading may take time, please wait
            </span>
          </div>
          
          {/* User Selector */}
          <UserSelector />
        </div>
      </header>

      {/* Secondary header for Stats & Actions */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          {/* Stats & Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Progress */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Progress:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {stats.completed}/{stats.total}
                </span>
              </div>
            </div>

            {/* Blind Mode Toggle */}
            <button
              onClick={() => setBlindMode(!blindMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                blindMode
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
              title={blindMode ? 'Variant names are hidden' : 'Variant names are visible'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {blindMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
              {blindMode ? 'Blind Mode On' : 'Blind Mode Off'}
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={stats.completed === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button
                onClick={handleClear}
                disabled={stats.completed === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="space-y-6">
          {data.map((item, index) => (
            <ABTestRow 
              key={item.uuid} 
              item={item} 
              index={index}
              selectedVariant={selections[item.uuid] || null}
              onSelect={(variantKey) => handleSelect(item.uuid, variantKey)}
              blindMode={blindMode}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
