'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Film } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/lib/supabase';
import type { Entry } from '@/lib/types';

export default function HomePage() {
  const [featuredEntries, setFeaturedEntries] = useState<Entry[]>([]);
  const [topRated, setTopRated] = useState<Entry[]>([]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      // Get top rated entries
      const { data: topData } = await supabase
        .from('entries')
        .select('*')
        .order('score', { ascending: false })
        .limit(6);

      setTopRated(topData || []);

      // Get some featured/recent entries
      const { data: featuredData } = await supabase
        .from('entries')
        .select('*')
        .order('year', { ascending: false })
        .limit(8);

      setFeaturedEntries(featuredData || []);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-6xl md:text-7xl font-bold text-text-dark mb-6 leading-tight">
              Find Your Next Watch
            </h1>
            <p className="text-xl text-text-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              Explore our curated collection of movies and TV shows. Get personalized recommendations based on your taste, or browse our complete database of reviewed content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brown hover:bg-brown-dark text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg"
              >
                Get Recommendation
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-full font-medium transition-all"
              >
                Browse All Content
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-4xl font-bold text-text-dark mb-2">
                Top Rated
              </h2>
              <p className="text-text-medium">Our highest-scoring content</p>
            </div>
            <Link
              href="/top-10"
              className="text-brown hover:text-brown-dark font-medium flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {topRated.map((entry) => (
              <div
                key={entry.id}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] mb-3 rounded-lg overflow-hidden bg-white shadow-md group-hover:shadow-xl transition-shadow">
                  {entry.poster_url ? (
                    <Image
                      src={entry.poster_url}
                      alt={entry.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brown/10">
                      <Film className="w-12 h-12 text-brown/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-brown text-brown" />
                    <span className="text-xs font-semibold text-text-dark">{entry.score}</span>
                  </div>
                </div>
                <h3 className="font-medium text-text-dark text-sm line-clamp-2 mb-1">
                  {entry.title}
                </h3>
                <p className="text-xs text-text-light">{entry.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-4xl font-bold text-text-dark mb-2">
                Recently Reviewed
              </h2>
              <p className="text-text-medium">Latest additions to our collection</p>
            </div>
            <Link
              href="/browse"
              className="text-brown hover:text-brown-dark font-medium flex items-center gap-2"
            >
              Explore More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-cream rounded-xl p-5 hover:shadow-lg transition-all border border-border hover:border-brown"
              >
                <div className="relative aspect-[2/3] mb-4 rounded-lg overflow-hidden bg-white">
                  {entry.poster_url ? (
                    <Image
                      src={entry.poster_url}
                      alt={entry.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brown/10">
                      <Film className="w-16 h-16 text-brown/30" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-text-dark mb-2 line-clamp-2">
                  {entry.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-brown text-brown" />
                    <span className="font-semibold text-text-dark">{entry.score}</span>
                  </div>
                  <span className="text-sm text-text-light">•</span>
                  <span className="text-sm text-text-medium">{entry.year}</span>
                </div>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 bg-white rounded-full text-text-medium border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brown">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Not Sure What to Watch?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Take our quick quiz to get personalized recommendations based on your mood and preferences.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brown hover:bg-cream rounded-full font-medium transition-all shadow-lg hover:shadow-xl"
          >
            Start Quiz
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
