import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { AudioItem, AudioData } from '../types';
import { isAudioData } from '../types';
import { AudioPlayer, type AudioPlayerRef } from '../components/AudioPlayer';
import { ContentDisplay } from '../components/ContentDisplay';
import { Logo } from '../components/Logo';
import { UserSelector } from '../components/UserSelector';
import { useUser } from '../hooks/useUser';
import { getMOSSStorageKey, loadProgress, saveProgressHybrid } from '../utils/storage';

// MOS Score type (1-5 scale)
type MOSScore = 1 | 2 | 3 | 4 | 5 | null;

// Scores type: { [uuid:variantKey]: score }
type ScoresState = Record<string, MOSScore>;

interface MOSPageProps {
  expName: string;
}

// MOS scale labels
const mosLabels: Record<number, { label: string; description: string; color: string }> = {
  5: { label: 'Excellent', description: 'Perfect quality, imperceptible distortion', color: 'bg-emerald-500' },
  4: { label: 'Good', description: 'Good quality, perceptible but not annoying distortion', color: 'bg-emerald-400' },
  3: { label: 'Fair', description: 'Fair quality, slightly annoying distortion', color: 'bg-amber-400' },
  2: { label: 'Poor', description: 'Poor quality, annoying distortion', color: 'bg-orange-400' },
  1: { label: 'Bad', description: 'Bad quality, very annoying distortion', color: 'bg-rose-500' },
};

// Generate a stable random ID from key (deterministic based on key)
const generateStableId = (key: string): string => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  const absHash = Math.abs(hash);
  for (let i = 0; i < 6; i++) {
    id += chars.charAt((absHash >> i) % chars.length);
  }
  return `ID-${id}`;
};

// MOS Rating row component
interface MOSRowProps {
  item: AudioItem;
  index: number;
  scores: Record<string, MOSScore>;
  onScoreChange: (variantKey: string, score: MOSScore) => void;
}

function MOSRow({ item, index, scores, onScoreChange }: MOSRowProps) {
  const { uuid, ...variants } = item;

  // Generate stable random IDs for all variant keys
  const randomIds = useMemo(() => {
    const ids: Record<string, string> = {};
    Object.keys(variants).forEach(key => {
      ids[key] = generateStableId(key);
    });
    return ids;
  }, [variants]);

  const gtData = variants['GT'];
  const gtContentText = isAudioData(gtData) 
    ? gtData.content
    : undefined;

  // Get all variant keys (including ground truth if present)
  const variantKeys = Object.keys(variants);
  
  // Generate stable random order for variants (GT first)
  const sortedKeys = useMemo(() => {
    const nonGtKeys = variantKeys.filter(k => k !== 'GT');
    // Use hash-based shuffle for stable random order
    const shuffled = [...nonGtKeys].sort((a, b) => {
      const hashA = generateStableId(a).charCodeAt(3);
      const hashB = generateStableId(b).charCodeAt(3);
      return hashA - hashB;
    });
    return ['GT', ...shuffled].filter(k => variantKeys.includes(k));
  }, [variantKeys]);

  // Calculate completion for this item
  const scoredCount = sortedKeys.filter(key => {
    const scoreKey = `${uuid}:${key}`;
    return scores[scoreKey] !== undefined && scores[scoreKey] !== null;
  }).length;
  const isComplete = scoredCount === sortedKeys.length;

  const audioPlayerRefs = useRef<Record<string, AudioPlayerRef>>({});

  const handleCardClick = (audioSrc: string) => {
    const playerRef = audioPlayerRefs.current[audioSrc];
    if (playerRef) {
      playerRef.toggle();
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 ${
      isComplete ? 'border-emerald-200' : 'border-slate-200'
    }`}>
      {/* Header with ID and completion status */}
      <div className={`px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between ${
        isComplete ? 'from-emerald-50/50' : ''
      }`}>
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold">
            #{index + 1}
          </span>
          <h3 className="text-base font-semibold text-slate-800 font-mono">{uuid}</h3>
        </div>
        <div className="flex items-center gap-3">
          {isComplete ? (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
              ✓ Complete ({scoredCount}/{sortedKeys.length})
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium">
              {scoredCount}/{sortedKeys.length} rated
            </span>
          )}
        </div>
      </div>

      {/* Variants with MOS rating */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedKeys.map((key) => {
            const data = variants[key];
            if (!isAudioData(data)) return null;

            const audioSrc = data.wav;
            const contentText = data.content;
            const isGt = key === 'GT';
            const scoreKey = `${uuid}:${key}`;
            const currentScore = scores[scoreKey] || null;
            const audioKey = `${uuid}:${key}`;

            return (
              <div 
                key={key}
                className={`rounded-xl p-4 transition-all duration-200 ${
                  isGt 
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200' 
                    : 'bg-slate-50 border border-slate-200'
                }`}
                onClick={() => handleCardClick(audioKey)}
              >
                {/* Label */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    isGt 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm' 
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    {isGt && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isGt ? 'Ground Truth' : randomIds[key]}
                  </span>
                  {currentScore !== null && !isGt && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${mosLabels[currentScore].color}`}>
                      {currentScore} - {mosLabels[currentScore].label}
                    </span>
                  )}
                </div>
                
                {/* Audio Player */}
                <AudioPlayer 
                  ref={(el) => { audioPlayerRefs.current[audioKey] = el!; }} 
                  src={audioSrc} 
                  isGt={isGt} 
                />

                {/* MOS Rating - directly below audio */}
                {!isGt && (
                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => onScoreChange(scoreKey, currentScore === score ? null : (score as MOSScore))}
                          title={`${score} - ${mosLabels[score].label}: ${mosLabels[score].description}`}
                          className={`flex-1 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                            currentScore === score
                              ? `${mosLabels[score].color} text-white shadow-md`
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    {currentScore !== null && (
                      <div className="mt-1.5 text-xs text-slate-500">
                        <span className="font-medium">{mosLabels[currentScore].label}:</span>{' '}
                        {mosLabels[currentScore].description}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                  <ContentDisplay 
                    text={contentText} 
                    originalText={isGt ? undefined : gtContentText}
                    className="h-20 overflow-y-auto"
                    isGt={isGt}
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

export default function MOSPage({ expName }: MOSPageProps) {
  const [data, setData] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<ScoresState>({});
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

  // Load scores from backend/localStorage when expName or currentUser changes
  useEffect(() => {
    setIsInitialized(false);
    hasLoadedOnce.current = false;
    const frameId = requestAnimationFrame(async () => {
      try {
        const storageKey = getMOSSStorageKey(expName, currentUser?.id || null);
        const savedScores = await loadProgress<ScoresState>('mos', expName, currentUser?.id || null, storageKey);
        setScores(savedScores || {});
        hasLoadedOnce.current = true;
      } catch (err) {
        console.error('Failed to load scores:', err);
        setScores({});
        hasLoadedOnce.current = true;
      } finally {
        setIsInitialized(true);
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [expName, currentUser?.id]);

  // Save scores to backend/localStorage whenever they change (but not during initial load)
  useEffect(() => {
    if (!isInitialized || !hasLoadedOnce.current) return;
    
    const saveData = async () => {
      try {
        const storageKey = getMOSSStorageKey(currentExpRef.current, currentUserRef.current);
        await saveProgressHybrid('mos', currentExpRef.current, currentUserRef.current, storageKey, scores);
      } catch (err) {
        console.error('Failed to save scores:', err);
      }
    };
    saveData();
  }, [scores, isInitialized]);

  // Handle score change
  const handleScoreChange = useCallback((scoreKey: string, score: MOSScore) => {
    setScores(prev => ({
      ...prev,
      [scoreKey]: score
    }));
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = data.reduce((acc, item) => acc + Object.keys(item).length - 1, 0); // -1 for uuid
    const completed = Object.values(scores).filter(s => s !== null).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate MOS scores per variant type
    const variantScores: Record<string, number[]> = {};
    Object.entries(scores).forEach(([key, score]) => {
      if (score !== null) {
        const variantKey = key.split(':')[1];
        if (!variantScores[variantKey]) variantScores[variantKey] = [];
        variantScores[variantKey].push(score);
      }
    });
    
    const mosByVariant = Object.entries(variantScores).map(([variant, scores]) => ({
      variant,
      count: scores.length,
      mos: scores.reduce((a, b) => a + b, 0) / scores.length
    }));

    return { total, completed, progress, mosByVariant };
  }, [data, scores]);

  // Export scores as JSON
  const handleExport = useCallback(() => {
    const exportData = {
      experiment: expName,
      user: currentUser?.id || 'anonymous',
      testType: 'mos',
      exportedAt: new Date().toISOString(),
      scores: scores,
      summary: {
        total: stats.total,
        completed: stats.completed,
        completionRate: `${stats.progress}%`,
        mosByVariant: stats.mosByVariant
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mos_${expName}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scores, expName, stats, currentUser?.id]);

  // Clear all scores
  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all scores? This cannot be undone.')) {
      setScores({});
    }
  }, []);

  // Load data based on experiment name
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setLoading(true);
      setError(null);
      
      const baseUrl = import.meta.env.BASE_URL || '/';
      const dataUrl = `${baseUrl}data/mos/${expName}/data.json`;
      
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
          setError(`Failed to load MOS data for experiment "${expName}". Make sure the data file exists at ${dataUrl}.`);
        })
        .finally(() => setLoading(false));
    });
    return () => cancelAnimationFrame(frameId);
  }, [expName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-500">Loading MOS evaluation data...</div>
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
                MOS Evaluation
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

      {/* MOS Scale Reference */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-700">MOS Scale:</span>
            <div className="flex items-center gap-1">
              {[5, 4, 3, 2, 1].map((score) => (
                <span key={score} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs">
                  <span className={`w-3 h-3 rounded-full ${mosLabels[score].color}`} />
                  <span className="font-medium">{score}</span>
                  <span className="text-slate-500">- {mosLabels[score].label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="space-y-6">
          {data.map((item, index) => (
            <MOSRow 
              key={item.uuid} 
              item={item} 
              index={index}
              scores={scores}
              onScoreChange={(scoreKey, score) => handleScoreChange(scoreKey, score)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
