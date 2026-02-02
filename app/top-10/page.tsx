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
      const top10Titles = [
        'Da 5 Bloods',
        'Coco',
        'American Factory',
        'Station Eleven',
        'Gladbeck: The Hostage Crisis',
        'Fleishman is in Trouble',
        'Creed',
        'Barbie',
        'Slave Play. Not a Movie. A Play.',
        'Sinners'
      ];

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .in('title', top10Titles);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading top 10 entries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-brown" />
            <h1 className="font-serif text-5xl font-bold text-text-dark">
              All-Time Top 10
            </h1>
          </div>
          <p className="text-xl text-text-medium">
            Our absolute favorites - the cream of the crop
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream border-t-brown"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-text-light" />
            <p className="text-xl text-text-dark font-medium">No entries yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
