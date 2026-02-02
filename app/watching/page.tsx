'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Film, Send, Eye } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/lib/supabase';
import type { CurrentlyWatching, Medium } from '@/lib/types';

export default function WatchingPage() {
  const [watching, setWatching] = useState<CurrentlyWatching[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Recommendation form state
  const [recTitle, setRecTitle] = useState('');
  const [recMedium, setRecMedium] = useState<Medium>('Movie');
  const [recReason, setRecReason] = useState('');
  const [recName, setRecName] = useState('');

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
      console.error('Error loading currently watching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await (supabase.from('recommendations') as any).insert([
        {
          title: recTitle,
          medium: recMedium,
          reason: recReason || null,
          submitter_name: recName || 'Anonymous',
        },
      ]);

      if (error) throw error;

      // Reset form
      setRecTitle('');
      setRecMedium('Movie');
      setRecReason('');
      setRecName('');
      setShowRecommendationForm(false);
      alert('Thank you for your recommendation!');
    } catch (error) {
      console.error('Error submitting recommendation:', error);
      alert('Failed to submit recommendation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />

      <main className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Eye className="w-10 h-10 text-brown" />
            <h1 className="font-serif text-5xl font-bold text-text-dark">
              Currently Watching
            </h1>
          </div>
          <p className="text-xl text-text-medium mb-6">
            What we're watching right now - fresh off the queue!
          </p>
          <button
            onClick={() => setShowRecommendationForm(!showRecommendationForm)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brown hover:bg-brown-dark text-white rounded-full font-medium transition-all shadow-md"
          >
            <Send className="w-5 h-5" />
            <span>Send Us a Recommendation</span>
          </button>
        </div>

        {/* Recommendation Form */}
        {showRecommendationForm && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-border">
              <h2 className="font-serif text-2xl font-bold text-text-dark mb-6">
                Recommend Something
              </h2>
              <form onSubmit={handleSubmitRecommendation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={recTitle}
                    onChange={(e) => setRecTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-cream text-text-dark border-2 border-border focus:ring-2 focus:ring-brown focus:border-brown"
                    placeholder="What should we watch?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Type *
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRecMedium('Movie')}
                      className={`flex-1 px-5 py-3 rounded-full transition-all font-medium ${
                        recMedium === 'Movie'
                          ? 'bg-brown text-white shadow-md'
                          : 'bg-cream text-text-medium hover:bg-brown hover:text-white border border-border'
                      }`}
                    >
                      Movie
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecMedium('TV')}
                      className={`flex-1 px-5 py-3 rounded-full transition-all font-medium ${
                        recMedium === 'TV'
                          ? 'bg-brown text-white shadow-md'
                          : 'bg-cream text-text-medium hover:bg-brown hover:text-white border border-border'
                      }`}
                    >
                      TV Show
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Why should we watch it? (Optional)
                  </label>
                  <textarea
                    value={recReason}
                    onChange={(e) => setRecReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-cream text-text-dark border-2 border-border focus:ring-2 focus:ring-brown focus:border-brown"
                    placeholder="Tell us what makes it great..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={recName}
                    onChange={(e) => setRecName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-cream text-text-dark border-2 border-border focus:ring-2 focus:ring-brown focus:border-brown"
                    placeholder="Anonymous"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-brown hover:bg-brown-dark text-white rounded-full font-medium transition-all shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Recommendation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRecommendationForm(false)}
                    className="px-6 py-3 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-full font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Currently Watching Grid */}
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-text-dark mb-2">
            {loading ? 'Loading...' : `${watching.length} Items in Queue`}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream border-t-brown"></div>
          </div>
        ) : watching.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 mx-auto mb-4 text-text-light" />
            <p className="text-xl text-text-dark font-medium">Nothing in the queue right now</p>
            <p className="text-text-medium mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {watching.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-border"
              >
                <div className="relative aspect-[2/3] bg-cream">
                  {item.poster_url ? (
                    <Image
                      src={item.poster_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brown/10">
                      <Film className="w-16 h-16 text-brown/30" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-text-dark mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  <span className="text-xs px-3 py-1 bg-cream rounded-full text-text-medium border border-border inline-block">
                    {item.medium}
                  </span>
                  {item.notes && (
                    <p className="text-xs text-text-light mt-2 line-clamp-2">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
