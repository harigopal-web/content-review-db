'use client';

import { useState } from 'react';
import { Upload, Check, X, Edit, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ImportEntry, Medium, ContentType } from '@/lib/types';

const CONTENT_TYPES: ContentType[] = [
  'Movies',
  'Documentary/True Crime',
  'Sports',
  'Drama TV',
  'Comedy TV',
  'Comedy Specials',
  'Reality Competition',
  'Reality Dating',
  'Comic Book Stuff',
  'Home Improvement',
];

interface ParsedEntry extends ImportEntry {
  status: 'pending' | 'processing' | 'ready' | 'error';
  error?: string;
}

export default function BulkImportPage() {
  const [inputText, setInputText] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);

  const parseInput = () => {
    const lines = inputText.trim().split('\n').filter(line => line.trim());
    const entries: ParsedEntry[] = [];

    lines.forEach(line => {
      const match = line.match(/^(.+?)\s*-\s*(\d+(?:\.\d+)?)$/);
      if (match) {
        const title = match[1].trim();
        const score = parseFloat(match[2]);

        if (score >= 0 && score <= 5) {
          entries.push({
            title,
            score,
            status: 'pending',
          });
        }
      }
    });

    setParsedEntries(entries);
  };

  const lookupAll = async () => {
    if (parsedEntries.length === 0) return;

    setProcessing(true);

    // Process entries in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < parsedEntries.length; i += batchSize) {
      const batch = parsedEntries.slice(i, i + batchSize);
      const promises = batch.map(async (entry, batchIndex) => {
        const actualIndex = i + batchIndex;

        // Update status to processing
        setParsedEntries(prev => {
          const updated = [...prev];
          updated[actualIndex] = { ...updated[actualIndex], status: 'processing' };
          return updated;
        });

        try {
          const response = await fetch('/api/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: entry.title, score: entry.score }),
          });

          if (!response.ok) throw new Error('Lookup failed');

          const data = await response.json();

          setParsedEntries(prev => {
            const updated = [...prev];
            updated[actualIndex] = {
              ...updated[actualIndex],
              medium: data.medium,
              type: data.type,
              tags: data.tags,
              poster_url: data.poster_url,
              title: data.title || entry.title, // Use TMDB title if available
              status: 'ready',
            };
            return updated;
          });
        } catch (error) {
          setParsedEntries(prev => {
            const updated = [...prev];
            updated[actualIndex] = {
              ...updated[actualIndex],
              status: 'error',
              error: 'Lookup failed',
            };
            return updated;
          });
        }
      });

      await Promise.all(promises);

      // Small delay between batches
      if (i + batchSize < parsedEntries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setProcessing(false);
  };

  const handleEdit = (index: number, field: string, value: any) => {
    setParsedEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleImport = async () => {
    const readyEntries = parsedEntries.filter(e => e.status === 'ready');
    if (readyEntries.length === 0) return;

    setImporting(true);

    try {
      const entriesToInsert = readyEntries.map(entry => ({
        title: entry.title,
        year: year,
        score: entry.score,
        medium: entry.medium!,
        type: entry.type!,
        tags: entry.tags || [],
        poster_url: entry.poster_url || null,
        hall_of_fame: false,
      }));

      const { error } = await supabase.from('entries').insert(entriesToInsert);

      if (error) throw error;

      alert(`Successfully imported ${entriesToInsert.length} entries!`);
      setInputText('');
      setParsedEntries([]);
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import entries');
    } finally {
      setImporting(false);
    }
  };

  const removeEntry = (index: number) => {
    setParsedEntries(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Bulk Import</h1>

      {/* Step 1: Input */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Step 1: Paste Entries</h2>
        <p className="text-gray-400 mb-4">
          Format: <code className="bg-gray-700 px-2 py-1 rounded">Title - Score</code> (one per line)
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Year
            </label>
            <select
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={2020}>2020</option>
              <option value={2021}>2021</option>
              <option value={2022}>2022</option>
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Entries (one per line)
            </label>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full h-64 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
              placeholder="The Shawshank Redemption - 5&#10;Inception - 4.5&#10;The Matrix - 4&#10;..."
            />
          </div>

          <button
            onClick={parseInput}
            disabled={!inputText.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Parse Entries
          </button>
        </div>
      </div>

      {/* Step 2: Auto-lookup */}
      {parsedEntries.length > 0 && (
        <>
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Step 2: Auto-Lookup Information
            </h2>
            <p className="text-gray-400 mb-4">
              Found {parsedEntries.length} entries. Click below to automatically look up information
              from TMDB.
            </p>

            <button
              onClick={lookupAll}
              disabled={processing || parsedEntries.every(e => e.status !== 'pending')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Looking up...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Auto-Lookup All</span>
                </>
              )}
            </button>
          </div>

          {/* Step 3: Review and Edit */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Step 3: Review & Edit</h2>

            <div className="space-y-4">
              {parsedEntries.map((entry, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    entry.status === 'ready'
                      ? 'border-green-600 bg-green-900/20'
                      : entry.status === 'error'
                      ? 'border-red-600 bg-red-900/20'
                      : entry.status === 'processing'
                      ? 'border-blue-600 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-700'
                  }`}
                >
                  {editingIndex === index ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={entry.title}
                          onChange={e => handleEdit(index, 'title', e.target.value)}
                          className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                          placeholder="Title"
                        />
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.5"
                          value={entry.score}
                          onChange={e => handleEdit(index, 'score', parseFloat(e.target.value))}
                          className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                        />
                        <select
                          value={entry.medium || 'Movie'}
                          onChange={e => handleEdit(index, 'medium', e.target.value)}
                          className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                        >
                          <option value="Movie">Movie</option>
                          <option value="TV">TV</option>
                        </select>
                        <select
                          value={entry.type || 'Movies'}
                          onChange={e => handleEdit(index, 'type', e.target.value)}
                          className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                        >
                          {CONTENT_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleEdit(index, 'status', 'ready');
                            setEditingIndex(null);
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {entry.status === 'ready' && (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                          {entry.status === 'processing' && (
                            <Loader className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                          )}
                          {entry.status === 'error' && (
                            <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                          )}
                          <span className="text-white font-semibold">{entry.title}</span>
                          <span className="text-gray-400">- Score: {entry.score}</span>
                        </div>

                        {entry.status === 'ready' && (
                          <div className="text-sm text-gray-400 ml-8">
                            Medium: {entry.medium} | Type: {entry.type} | Tags:{' '}
                            {entry.tags?.join(', ')}
                          </div>
                        )}

                        {entry.status === 'error' && (
                          <div className="text-sm text-red-400 ml-8">{entry.error}</div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingIndex(index)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeEntry(index)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Import */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Step 4: Import to Database</h2>

            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Ready to import: {parsedEntries.filter(e => e.status === 'ready').length} entries
              </p>

              <button
                onClick={handleImport}
                disabled={importing || parsedEntries.filter(e => e.status === 'ready').length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Import All Ready Entries</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
