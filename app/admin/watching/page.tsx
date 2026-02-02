'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Check, X, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { CurrentlyWatching, Medium } from '@/lib/types';

interface ParsedItem {
  title: string;
  medium?: Medium;
  poster_url?: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  error?: string;
}

export default function AdminWatchingPage() {
  const [watching, setWatching] = useState<CurrentlyWatching[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Bulk upload state
  const [inputText, setInputText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadWatching();
  }, []);

  const loadWatching = async () => {
    try {
      const { data, error } = await supabase
        .from('currently_watching')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWatching(data || []);
    } catch (error) {
      console.error('Error loading watching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this item from currently watching?')) return;

    try {
      const { error } = await supabase
        .from('currently_watching')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadWatching();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete item');
    }
  };

  const parseInput = () => {
    const lines = inputText.trim().split('\n').filter(line => line.trim());
    const items: ParsedItem[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        items.push({
          title: trimmed,
          status: 'pending',
        });
      }
    });

    setParsedItems(items);
  };

  const lookupMetadata = async () => {
    setProcessing(true);

    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];

      setParsedItems(prev =>
        prev.map((p, idx) =>
          idx === i ? { ...p, status: 'processing' as const } : p
        )
      );

      try {
        const response = await fetch('/api/tmdb-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: item.title }),
        });

        if (!response.ok) throw new Error('TMDB lookup failed');

        const data = await response.json();

        setParsedItems(prev =>
          prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  medium: data.medium,
                  poster_url: data.poster_url,
                  status: 'ready' as const,
                }
              : p
          )
        );

        // Rate limit: wait 1 second between requests
        if (i < parsedItems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        setParsedItems(prev =>
          prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  status: 'error' as const,
                  error: 'Failed to lookup',
                }
              : p
          )
        );
      }
    }

    setProcessing(false);
  };

  const handleImport = async () => {
    const itemsToImport = parsedItems.filter(p => p.status === 'ready');

    if (itemsToImport.length === 0) {
      alert('No items ready to import');
      return;
    }

    setImporting(true);

    try {
      const { error } = await (supabase.from('currently_watching') as any).insert(
        itemsToImport.map(item => ({
          title: item.title,
          medium: item.medium,
          poster_url: item.poster_url,
        }))
      );

      if (error) throw error;

      alert(`Successfully imported ${itemsToImport.length} items!`);
      setInputText('');
      setParsedItems([]);
      setShowBulkUpload(false);
      await loadWatching();
    } catch (error) {
      console.error('Error importing:', error);
      alert('Failed to import items');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Currently Watching</h1>
        <button
          onClick={() => setShowBulkUpload(!showBulkUpload)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Upload className="w-5 h-5" />
          <span>Bulk Upload</span>
        </button>
      </div>

      {/* Bulk Upload Section */}
      {showBulkUpload && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Bulk Upload</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter titles (one per line)
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-40 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                placeholder="Dune&#10;The Bear&#10;Succession"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={parseInput}
                disabled={!inputText.trim() || processing}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Parse Titles
              </button>
              {parsedItems.length > 0 && (
                <button
                  onClick={lookupMetadata}
                  disabled={processing || importing}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {processing && <Loader className="w-4 h-4 animate-spin" />}
                  <span>Lookup Metadata</span>
                </button>
              )}
              {parsedItems.some(p => p.status === 'ready') && (
                <button
                  onClick={handleImport}
                  disabled={processing || importing}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {importing && <Loader className="w-4 h-4 animate-spin" />}
                  <span>Import to Currently Watching</span>
                </button>
              )}
            </div>

            {/* Parsed Items Preview */}
            {parsedItems.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Parsed Items ({parsedItems.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-gray-700 px-4 py-3 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {item.status === 'pending' && (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
                        )}
                        {item.status === 'processing' && (
                          <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                        )}
                        {item.status === 'ready' && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                        {item.status === 'error' && (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.title}</p>
                        {item.medium && (
                          <p className="text-sm text-gray-400">{item.medium}</p>
                        )}
                        {item.error && (
                          <p className="text-sm text-red-400">{item.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Currently Watching List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Poster</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : watching.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No items in currently watching
                  </td>
                </tr>
              ) : (
                watching.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-white">{item.title}</td>
                    <td className="px-4 py-3 text-gray-300">{item.medium}</td>
                    <td className="px-4 py-3">
                      {item.poster_url ? (
                        <span className="text-green-400 text-sm">✓ Has poster</span>
                      ) : (
                        <span className="text-gray-500 text-sm">No poster</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-gray-400 text-sm">
        Total items: {watching.length}
      </div>
    </div>
  );
}
