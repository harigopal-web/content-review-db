'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import type { Medium, ContentType } from '@/lib/types';

const CONTENT_TYPES: ContentType[] = [
  'Movies',
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
            className="px-8 py-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-xl transition-colors"
          >
            Either - Surprise Me!
          </button>
          <button
            onClick={() => { setMedium('Movie'); setStep(step + 1); }}
            className="px-8 py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xl transition-colors"
          >
            Movies
          </button>
          <button
            onClick={() => { setMedium('TV'); setStep(step + 1); }}
            className="px-8 py-6 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xl transition-colors"
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
            className="w-full px-6 py-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-blue-500 text-lg"
          >
            <option value="">Any Type</option>
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            onClick={() => setStep(step + 1)}
            className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
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
                className={`px-6 py-4 rounded-lg text-lg transition-colors ${
                  minScore === option.value
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(step + 1)}
            className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
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
            className={`w-full px-8 py-6 rounded-lg text-xl transition-colors ${
              !mostRecent
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            No - Show Me Everything
          </button>
          <button
            onClick={() => { setMostRecent(true); setStep(step + 1); }}
            className={`w-full px-8 py-6 rounded-lg text-xl transition-colors ${
              mostRecent
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
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
            <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">Loading tags...</p>
          )}
          <button
            onClick={handleFinish}
            className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-lg font-semibold"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Question {step + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {Math.round(((step + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              {currentQuestion.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {currentQuestion.subtitle}
            </p>

            {currentQuestion.content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}
            {step === 0 && (
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
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
