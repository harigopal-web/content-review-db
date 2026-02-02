'use client';

import { useState, useEffect, Suspense } from 'react';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import type { Medium, ContentType } from '@/lib/types';

export const dynamic = 'force-dynamic';

const TV_TYPES: ContentType[] = [
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

const MOVIE_TYPES: ContentType[] = [
  'Comic Book Stuff',
  'Documentary/True Crime',
  'Drama',
  'Horror',
  'Comedy',
  'Thriller',
  'Romance',
  'Action',
  'Family',
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Quiz answers
  const [medium, setMedium] = useState<Medium | ''>('');
  const [contentType, setContentType] = useState<ContentType | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(0);
  const [mostRecent, setMostRecent] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { data } = await supabase.from('entries').select('tags');

      const tags = new Set<string>();
      data?.forEach((entry: any) => {
        entry.tags?.forEach((tag: string) => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFinish = () => {
    // Build query params
    const params = new URLSearchParams();
    if (medium) params.set('medium', medium);
    if (contentType) params.set('type', contentType);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (minScore > 0) params.set('minScore', minScore.toString());
    if (mostRecent) params.set('mostRecent', 'true');

    router.push(`/browse?${params.toString()}`);
  };

  const questions = [
    {
      title: 'What are you in the mood for?',
      subtitle: 'Choose a medium',
      content: (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => { setMedium(''); setStep(step + 1); }}
            className="px-8 py-6 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-full text-xl transition-all font-medium"
          >
            Either - Surprise Me!
          </button>
          <button
            onClick={() => { setMedium('Movie'); setStep(step + 1); }}
            className="px-8 py-6 bg-brown hover:bg-brown-dark text-white rounded-full text-xl transition-all font-medium shadow-md"
          >
            Movies
          </button>
          <button
            onClick={() => { setMedium('TV'); setStep(step + 1); }}
            className="px-8 py-6 bg-brown hover:bg-brown-dark text-white rounded-full text-xl transition-all font-medium shadow-md"
          >
            TV Shows
          </button>
        </div>
      ),
    },
    {
      title: 'What type of content?',
      subtitle: 'Optional - skip if you want variety',
      content: (
        <div className="space-y-4">
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType | '')}
            className="w-full px-6 py-4 rounded-lg bg-cream text-text-dark border-2 border-border focus:ring-2 focus:ring-brown focus:border-brown text-lg"
          >
            <option value="">Any Type</option>
            {(medium === 'TV' ? TV_TYPES : medium === 'Movie' ? MOVIE_TYPES : [...TV_TYPES, ...MOVIE_TYPES]).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            onClick={() => setStep(step + 1)}
            className="w-full px-6 py-4 bg-brown hover:bg-brown-dark text-white rounded-full transition-all flex items-center justify-center gap-2 text-lg font-medium shadow-md"
          >
            <span>Next</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: 'How good should it be?',
      subtitle: 'Set a minimum rating',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: 0, label: 'Any Rating' },
              { value: 3, label: '3+ Stars' },
              { value: 3.5, label: '3.5+ Stars' },
              { value: 4, label: '4+ Stars' },
              { value: 4.5, label: '4.5+ Stars' },
              { value: 5, label: '5 Stars Only' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setMinScore(option.value)}
                className={`px-6 py-4 rounded-full text-lg transition-all font-medium ${
                  minScore === option.value
                    ? 'bg-brown text-white shadow-md'
                    : 'bg-cream text-text-medium hover:bg-brown hover:text-white border border-border'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(step + 1)}
            className="w-full px-6 py-4 bg-brown hover:bg-brown-dark text-white rounded-full transition-all flex items-center justify-center gap-2 text-lg font-medium shadow-md"
          >
            <span>Next</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: 'Want something recent?',
      subtitle: 'Filter by year',
      content: (
        <div className="space-y-4">
          <button
            onClick={() => { setMostRecent(false); setStep(step + 1); }}
            className={`w-full px-8 py-6 rounded-full text-xl transition-all font-medium ${
              !mostRecent
                ? 'bg-brown text-white shadow-md'
                : 'bg-cream text-text-medium hover:bg-brown hover:text-white border border-border'
            }`}
          >
            No - Show Me Everything
          </button>
          <button
            onClick={() => { setMostRecent(true); setStep(step + 1); }}
            className={`w-full px-8 py-6 rounded-full text-xl transition-all font-medium ${
              mostRecent
                ? 'bg-brown text-white shadow-md'
                : 'bg-cream text-text-medium hover:bg-brown hover:text-white border border-border'
            }`}
          >
            Yes - Only 2024-2025
          </button>
        </div>
      ),
    },
    {
      title: 'Any specific vibes?',
      subtitle: 'Optional - select tags that interest you',
      content: (
        <div className="space-y-4">
          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-6 bg-cream rounded-lg border border-border">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-brown text-white shadow-md'
                      : 'bg-white text-text-medium hover:bg-brown hover:text-white border border-border'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-text-medium text-center">Loading tags...</p>
          )}
          <button
            onClick={handleFinish}
            className="w-full px-6 py-4 bg-brown hover:bg-brown-dark text-white rounded-full transition-all flex items-center justify-center gap-2 text-lg font-semibold shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            <span>Show Me Recommendations!</span>
          </button>
        </div>
      ),
    },
  ];

  const currentQuestion = questions[step];

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-text-medium">
                Question {step + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-text-medium">
                {Math.round(((step + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-3 border border-border">
              <div
                className="bg-brown h-full rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-lg p-10 mb-8 border border-border">
            <h1 className="font-serif text-4xl font-bold mb-3 text-text-dark">
              {currentQuestion.title}
            </h1>
            <p className="text-text-medium mb-8 text-lg">
              {currentQuestion.subtitle}
            </p>

            {currentQuestion.content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-full transition-all font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}
            {step === 0 && (
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-6 py-3 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-full transition-all font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Home</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
