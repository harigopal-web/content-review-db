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
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-gray-900 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-950">
      {entry.poster_url && (
        <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-900">
          <Image
            src={entry.poster_url}
            alt={entry.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-white">{entry.title}</h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-gray-900 dark:fill-white text-gray-900 dark:text-white" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {entry.score.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-500">
            {entry.year}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded">
            {entry.medium}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded">
            {entry.type}
          </span>
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {entry.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs text-gray-500 dark:text-gray-500"
              >
                {tag}{index < Math.min(entry.tags!.length, 3) - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        )}

        {showVoting && <VotingInterface entryId={entry.id} />}
      </div>
    </div>
  );
}
