import { useEffect, useState, useCallback, useMemo } from 'react';
import type { AudioItem, AudioData } from '../types';
import { AudioComparisonRow } from '../components/AudioComparisonRow';
import type { TagValue } from '../components/TagButton';
import { Logo } from '../components/Logo';

// Tag storage key for localStorage (includes experiment name for isolation)
const getTagsStorageKey = (expName: string) => `audio_comparison_tags_${expName}`;

// Tags type: { [uuid]: { [variantKey]: TagValue } }
export type TagsState = Record<string, Record<string, TagValue>>;

interface ComparisonPageProps {
  expName: string;
}

export default function ComparisonPage({ expName }: ComparisonPageProps) {
  const [data, setData] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<TagsState>({});

  // Load tags from localStorage when expName changes
  useEffect(() => {
    // Use requestAnimationFrame to avoid cascading renders warning
    const frameId = requestAnimationFrame(() => {
      try {
        const savedTags = localStorage.getItem(getTagsStorageKey(expName));
        if (savedTags) {
          setTags(JSON.parse(savedTags));
        } else {
          setTags({});
        }
      } catch (err) {
        console.error('Failed to load tags from localStorage:', err);
        setTags({});
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [expName]);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(getTagsStorageKey(expName), JSON.stringify(tags));
    } catch (err) {
      console.error('Failed to save tags to localStorage:', err);
    }
  }, [tags, expName]);

  // Handle tag change
  const handleTagChange = useCallback((uuid: string, variantKey: string, value: TagValue) => {
    setTags(prev => {
      const newTags = { ...prev };
      if (!newTags[uuid]) {
        newTags[uuid] = {};
      }
      if (value === null) {
        delete newTags[uuid][variantKey];
        // Clean up empty objects
        if (Object.keys(newTags[uuid]).length === 0) {
          delete newTags[uuid];
        }
      } else {
        newTags[uuid][variantKey] = value;
      }
      return newTags;
    });
  }, []);

  // Calculate tag stats with memoization for performance
  const tagStats = useMemo(() => {
    let total = 0;
    let good = 0;
    let maybe = 0;
    let bad = 0;

    for (const variants of Object.values(tags)) {
      for (const value of Object.values(variants)) {
        total++;
        if (value === 'good') good++;
        else if (value === 'maybe') maybe++;
        else if (value === 'bad') bad++;
      }
    }

    return { total, good, maybe, bad };
  }, [tags]);

  // Export tags as JSON - uses memoized tagStats
  const handleExportTags = useCallback(() => {
    const exportData = {
      experiment: expName,
      exportedAt: new Date().toISOString(),
      tags: tags,
      summary: tagStats
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio_tags_${expName}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tags, expName, tagStats]);

  // Clear all tags
  const handleClearTags = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all tags? This cannot be undone.')) {
      setTags({});
    }
  }, []);

  // Load data based on experiment name
  useEffect(() => {
    // Use requestAnimationFrame to avoid cascading renders warning
    const frameId = requestAnimationFrame(() => {
      setLoading(true);
      setError(null);
      
      // Construct data URL based on experiment name
      // e.g., /exp1 -> /data/exp1/data.json
      // e.g., / -> /data/default/data.json
      const baseUrl = import.meta.env.BASE_URL || '/';
      const dataUrl = expName === 'default' 
        ? `${baseUrl}data/default/data.json` 
        : `${baseUrl}data/${expName}/data.json`;
      
      fetch(dataUrl)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load data from ${dataUrl}`);
          return res.json();
        })
        .then((jsonData: Record<string, Array<Record<string, AudioData>>>) => {
          // Transform object format to array format
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
          setError(`Failed to load data for experiment "${expName}". Make sure the data file exists at ${dataUrl}. Use the copy-audio script to set up the data.`);
        })
        .finally(() => setLoading(false));
    });
    return () => cancelAnimationFrame(frameId);
  }, [expName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-500">Loading comparison data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} className="shadow-lg shadow-indigo-200 rounded-xl" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Audio Evaluation Tools
              </h1>
              {expName !== 'default' && (
                <div className="text-xs text-indigo-600 font-medium">
                  Experiment: {expName}
                </div>
              )}
            </div>
            <span className="ml-3 px-2 py-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
              ⏳ Audio loading may take tens of seconds, please wait patiently
            </span>
          </div>
          
          {/* Tag Stats & Actions */}
          <div className="flex items-center gap-4">
            {/* Tag Statistics */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Tagged:</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {tagStats.good}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {tagStats.maybe}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  {tagStats.bad}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTags}
                disabled={tagStats.total === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button
                onClick={handleClearTags}
                disabled={tagStats.total === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
            
            <div className="text-sm text-slate-500">
              {data.length} comparisons
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="space-y-6">
          {data.map((item, index) => (
            <AudioComparisonRow 
              key={item.uuid} 
              item={item} 
              index={index}
              tags={tags[item.uuid] || {}}
              onTagChange={(variantKey, value) => handleTagChange(item.uuid, variantKey, value)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
