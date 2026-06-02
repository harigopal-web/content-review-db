'use client';

import Image from 'next/image';
import { Star, Film } from 'lucide-react';
import type { Entry } from '@/lib/types';
import { getDisplayTags } from '@/lib/tags';
interface EntryCardProps {
  entry: Entry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const displayTags = getDisplayTags(entry.tags, entry.score);

  return (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all border border-border hover:border-brown">
      {entry.poster_url ? (
        <div className="relative h-64 w-full bg-cream">
          <Image
            src={entry.poster_url}
            alt={entry.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="h-64 w-full bg-brown/10 flex items-center justify-center">
          <Film className="w-16 h-16 text-brown/30" />
        </div>
      )}

      <div className="p-5">
        <h3 className="font-semibold text-text-dark mb-2 line-clamp-2">{entry.title}</h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-brown text-brown" />
            <span className="font-semibold text-text-dark">
              {entry.score.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-text-light">•</span>
          <span className="text-sm text-text-medium">
            {entry.year}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs px-3 py-1 bg-cream rounded-full text-text-medium border border-border">
            {entry.medium}
          </span>
          <span className="text-xs px-3 py-1 bg-cream rounded-full text-text-medium border border-border">
            {entry.type}
          </span>
        </div>

        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {displayTags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs text-text-light"
              >
                {tag}{index < Math.min(displayTags.length, 3) - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
