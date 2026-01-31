'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Entry } from '@/lib/types';
import VotingInterface from './VotingInterface';

interface EntryCardProps {
  entry: Entry;
  showVoting?: boolean;
}

export default function EntryCard({ entry, showVoting = true }: EntryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {entry.poster_url && (
        <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-700">
          <Image
            src={entry.poster_url}
            alt={entry.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{entry.title}</h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="font-bold text-yellow-900 dark:text-yellow-100">
              {entry.score.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {entry.year}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
            {entry.medium}
          </span>
          <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded">
            {entry.type}
          </span>
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {showVoting && <VotingInterface entryId={entry.id} />}
      </div>
    </div>
  );
}
