'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Award, Star } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/lib/supabase';
import type { Entry } from '@/lib/types';
import { getDisplayTags } from '@/lib/tags';

export default function HallOfFamePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHallOfFameEntries();
  }, []);

  const loadHallOfFameEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('hall_of_fame', true)
        .order('score', { ascending: false })
        .order('title', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading Hall of Fame entries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-1 h-16 bg-gradient-to-b from-transparent via-yellow-500 to-transparent"></div>
              <Award className="w-16 h-16 text-yellow-500" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Hall of Fame
              </h1>
              <Award className="w-16 h-16 text-yellow-500" />
              <div className="w-1 h-16 bg-gradient-to-b from-transparent via-yellow-500 to-transparent"></div>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A curated collection of the most exceptional, memorable, and impactful shows and movies
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-yellow-500"></div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No Hall of Fame entries yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">
                Check back later for curated excellence
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  {/* Poster */}
                  <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                    {entry.poster_url ? (
                      <Image
                        src={entry.poster_url}
                        alt={entry.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Award className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                          {entry.title}
                        </h3>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 bg-yellow-500 px-2 py-1 rounded">
                            <Star className="w-3 h-3 fill-white text-white" />
                            <span className="text-white font-bold text-sm">
                              {entry.score.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-white text-sm">
                            {entry.year}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                            {entry.medium}
                          </span>
                          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                            {entry.type}
                          </span>
                        </div>

                        {getDisplayTags(entry.tags, entry.score).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {getDisplayTags(entry.tags, entry.score).slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs bg-yellow-500/80 text-white px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hall of Fame Badge */}
                  <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-2 shadow-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
