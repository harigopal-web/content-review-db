'use client';

import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import Navigation from '@/components/Navigation';
import EntryCard from '@/components/EntryCard';
import { supabase } from '@/lib/supabase';
import type { Entry } from '@/lib/types';

export default function Top10Page() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTop10Entries();
  }, []);

  const loadTop10Entries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('score', { ascending: false })
        .order('year', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading top 10 entries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              All-Time Top 10
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            The highest-rated shows and movies across all years
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600 dark:text-gray-400">No entries yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, index) => (
              <div key={entry.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-400 dark:text-gray-600">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <EntryCard entry={entry} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
