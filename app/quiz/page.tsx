'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Star, Film, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import type { Medium, ContentType, Entry } from '@/lib/types';
import { getDisplayTags } from '@/lib/tags';

export const dynamic = 'force-dynamic';

interface QuizState {
  medium: Medium | '';
  contentType: ContentType | '';
  minScore: number;
  mostRecent: boolean;
  tags: string[];
}

interface Question {
  title: string;
  subtitle: string;
  options: {
    label: string;
    emoji: string;
    apply: (state: QuizState) => Partial<QuizState>;
  }[];
}

const questions: Question[] = [
  {
    title: "It's Friday night and you're settling in. What's the vibe?",
    subtitle: "Pick what sounds most like you right now",
    options: [
      { label: "Light, fun, no stress", emoji: "😄", apply: () => ({ contentType: 'Comedy' as ContentType }) },
      { label: "Edge-of-my-seat gripping", emoji: "😬", apply: () => ({ contentType: 'Thriller' as ContentType }) },
      { label: "Something moving and emotional", emoji: "🥹", apply: () => ({ contentType: 'Drama' as ContentType }) },
      { label: "Learn something real", emoji: "🧠", apply: () => ({ contentType: 'Documentary/True Crime' as ContentType }) },
    ],
  },
  {
    title: "You're watching with...",
    subtitle: "Who's joining you tonight?",
    options: [
      { label: "Just me, my call", emoji: "🛋️", apply: () => ({}) },
      { label: "My partner", emoji: "💑", apply: () => ({ tags: ['romantic'] }) },
      { label: "A group of friends", emoji: "👫", apply: () => ({}) },
      { label: "Family (all ages)", emoji: "👨‍👩‍👧", apply: () => ({ contentType: 'Family' as ContentType }) },
    ],
  },
  {
    title: "Movie or TV series?",
    subtitle: "How much of a commitment are you making?",
    options: [
      { label: "Movie — done in 2 hours", emoji: "🎬", apply: () => ({ medium: 'Movie' as Medium }) },
      { label: "TV series — I want to binge", emoji: "📺", apply: () => ({ medium: 'TV' as Medium }) },
      { label: "Either — surprise me", emoji: "🎲", apply: () => ({ medium: '' as '' }) },
    ],
  },
  {
    title: "When you're out with friends, you're usually...",
    subtitle: "Pick the one that sounds most like you",
    options: [
      { label: "The one suggesting somewhere fun and low-key", emoji: "🍻", apply: () => ({ contentType: 'Comedy' as ContentType }) },
      { label: "The one who loves a good intense debate after", emoji: "💬", apply: () => ({ contentType: 'Drama' as ContentType }) },
      { label: "The one suggesting something wild and unexpected", emoji: "🎢", apply: () => ({ contentType: 'Action' as ContentType }) },
      { label: "The one who did the research beforehand", emoji: "📋", apply: () => ({ contentType: 'Documentary/True Crime' as ContentType }) },
    ],
  },
  {
    title: "You just had a long, exhausting week. You want...",
    subtitle: "Be honest — what actually sounds good?",
    options: [
      { label: "Something that makes me laugh and unwind", emoji: "😂", apply: () => ({ contentType: 'Comedy' as ContentType }) },
      { label: "Something intense enough to make me forget everything", emoji: "🔥", apply: () => ({ contentType: 'Thriller' as ContentType }) },
      { label: "A good drama I can get emotionally lost in", emoji: "😢", apply: () => ({ contentType: 'Drama' as ContentType }) },
      { label: "Reality TV — pure guilty pleasure", emoji: "🌹", apply: () => ({ contentType: 'Reality Dating' as ContentType }) },
    ],
  },
  {
    title: "If your life were a show, it would be...",
    subtitle: "Pick your spirit genre",
    options: [
      { label: "A smart, fast-paced drama series", emoji: "🎭", apply: () => ({ contentType: 'Drama TV' as ContentType }) },
      { label: "An action-packed blockbuster", emoji: "💥", apply: () => ({ contentType: 'Action' as ContentType }) },
      { label: "A cult-classic comedy", emoji: "🤡", apply: () => ({ contentType: 'Comedy TV' as ContentType }) },
      { label: "A compelling true-crime doc", emoji: "🔍", apply: () => ({ contentType: 'Documentary/True Crime' as ContentType }) },
    ],
  },
  {
    title: "Scrolling social media, you always stop for...",
    subtitle: "What content actually gets you?",
    options: [
      { label: "Sports highlights and big moments", emoji: "🏆", apply: () => ({ contentType: 'Sports' as ContentType }) },
      { label: "True crime or wild news stories", emoji: "🚨", apply: () => ({ contentType: 'Documentary/True Crime' as ContentType }) },
      { label: "Comedy clips and memes", emoji: "😂", apply: () => ({ contentType: 'Comedy' as ContentType }) },
      { label: "Movie trailers and pop culture", emoji: "🎥", apply: () => ({ contentType: 'Comic Book Stuff' as ContentType }) },
    ],
  },
  {
    title: "How picky are you feeling tonight?",
    subtitle: "Set the quality bar",
    options: [
      { label: "Only the absolute best", emoji: "⭐", apply: () => ({ minScore: 5 }) },
      { label: "High quality please", emoji: "✨", apply: () => ({ minScore: 4.5 }) },
      { label: "Good is good enough", emoji: "👍", apply: () => ({ minScore: 4 }) },
      { label: "Show me everything", emoji: "🎯", apply: () => ({ minScore: 0 }) },
    ],
  },
  {
    title: "Does it need to be something new?",
    subtitle: "How recent are we talking?",
    options: [
      { label: "Yes — 2024 or 2025 only", emoji: "🆕", apply: () => ({ mostRecent: true }) },
      { label: "No — classics are totally fine", emoji: "🕰️", apply: () => ({ mostRecent: false }) },
    ],
  },
  {
    title: "Last one — are you feeling adventurous?",
    subtitle: "How much do you want to be surprised?",
    options: [
      { label: "Totally — show me something unexpected", emoji: "🚀", apply: () => ({ contentType: '' as '' }) },
      { label: "A little — stay in my wheelhouse", emoji: "🧭", apply: () => ({}) },
      { label: "Not really — I know what I like", emoji: "✅", apply: () => ({}) },
    ],
  },
];

// Pick 3 results: shuffle top matches, return first 3
function pickRecommendations(entries: Entry[], state: QuizState): Entry[] {
  let pool = [...entries];

  if (state.medium) pool = pool.filter((e) => e.medium === state.medium);
  if (state.contentType) pool = pool.filter((e) => e.type === state.contentType);
  if (state.minScore > 0) pool = pool.filter((e) => e.score >= state.minScore);
  if (state.mostRecent) pool = pool.filter((e) => e.year >= 2024);
  if (state.tags.length > 0) pool = pool.filter((e) => state.tags.some((t) => e.tags?.includes(t)));

  // If too few results, relax filters progressively
  if (pool.length < 3 && state.contentType) {
    pool = entries.filter((e) => {
      if (state.medium && e.medium !== state.medium) return false;
      if (state.minScore > 0 && e.score < state.minScore) return false;
      return true;
    });
  }

  // Still too few — just use top-rated from whole pool
  if (pool.length < 3) {
    pool = [...entries].sort((a, b) => b.score - a.score);
  }

  // Sort by score desc, then shuffle within same-score groups for variety
  pool.sort((a, b) => b.score - a.score);

  // Shuffle top 10 to add variety, then take first 3
  const top = pool.slice(0, 10);
  for (let i = top.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [top[i], top[j]] = [top[j], top[i]];
  }

  return top.slice(0, 3);
}

function RecommendationResult({
  picks,
  onRetake,
}: {
  picks: Entry[];
  onRetake: () => void;
}) {
  const [main, ...alts] = picks;
  const mainTags = getDisplayTags(main.tags, main.score).slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Main recommendation */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-brown" />
          <h2 className="font-serif text-3xl font-bold text-text-dark">Here's what you should watch</h2>
        </div>
        <p className="text-text-medium">Based on your answers, this is our top pick for you tonight.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden mb-10">
        <div className="flex flex-col sm:flex-row">
          {/* Poster */}
          <div className="relative w-full sm:w-48 flex-shrink-0 h-64 sm:h-auto bg-brown/10">
            {main.poster_url ? (
              <Image
                src={main.poster_url}
                alt={main.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 192px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-16 h-16 text-brown/30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col justify-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-cream rounded-full text-text-medium border border-border font-medium">
                {main.medium}
              </span>
              <span className="text-xs px-3 py-1 bg-cream rounded-full text-text-medium border border-border font-medium">
                {main.type}
              </span>
            </div>
            <h3 className="font-serif text-3xl font-bold text-text-dark leading-tight">
              {main.title}
            </h3>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-brown text-brown" />
              <span className="font-bold text-text-dark text-lg">{main.score}</span>
              <span className="text-text-light text-sm">/ 5 — {main.year}</span>
            </div>
            {mainTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mainTags.map((tag, i) => (
                  <span key={i} className="text-xs text-text-medium">
                    {tag}{i < mainTags.length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alternates */}
      {alts.length > 0 && (
        <div className="mb-10">
          <p className="text-center text-text-medium font-medium mb-5">
            Not interested? Maybe try these...
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alts.map((alt) => {
              const altTags = getDisplayTags(alt.tags, alt.score).slice(0, 2);
              return (
                <div
                  key={alt.id}
                  className="bg-white rounded-xl border border-border p-4 flex gap-4 shadow-sm hover:shadow-md hover:border-brown transition-all"
                >
                  <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-brown/10">
                    {alt.poster_url ? (
                      <Image
                        src={alt.poster_url}
                        alt={alt.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-brown/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <h4 className="font-semibold text-text-dark text-sm leading-tight line-clamp-2">
                      {alt.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-brown text-brown" />
                      <span className="text-xs font-semibold text-text-dark">{alt.score}</span>
                      <span className="text-xs text-text-light">· {alt.year}</span>
                    </div>
                    {altTags.length > 0 && (
                      <p className="text-xs text-text-light line-clamp-1">
                        {altTags.join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-full transition-all font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Retake Quiz
        </button>
        <Link
          href="/browse"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brown text-white hover:bg-brown-dark rounded-full transition-all font-medium"
        >
          Browse All Content
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [picks, setPicks] = useState<Entry[] | null>(null);
  const [state, setState] = useState<QuizState>({
    medium: '',
    contentType: '',
    minScore: 0,
    mostRecent: false,
    tags: [],
  });

  const applyAnswer = async (apply: (s: QuizState) => Partial<QuizState>) => {
    const updates = apply(state);
    const next = { ...state, ...updates };
    setState(next);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      await fetchResults(next);
    }
  };

  const fetchResults = async (finalState: QuizState) => {
    setLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('entries')
        .select('*')
        .order('score', { ascending: false });

      const results = pickRecommendations(data || [], finalState);
      setPicks(results);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setPicks(null);
    setStep(0);
    setState({ medium: '', contentType: '', minScore: 0, mostRecent: false, tags: [] });
  };

  const current = questions[step];

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />

      <main className="container mx-auto px-6 py-12">
        {/* Loading */}
        {loading && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream border-t-brown mb-6" />
            <p className="text-xl text-text-medium font-medium">Finding your perfect watch...</p>
          </div>
        )}

        {/* Results */}
        {!loading && picks && (
          <RecommendationResult picks={picks} onRetake={retake} />
        )}

        {/* Quiz */}
        {!loading && !picks && (
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
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-lg p-10 mb-8 border border-border">
              <h1 className="font-serif text-3xl font-bold mb-3 text-text-dark">
                {current.title}
              </h1>
              <p className="text-text-medium mb-8 text-lg">
                {current.subtitle}
              </p>

              <div className="flex flex-col gap-3">
                {current.options.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => applyAnswer(option.apply)}
                    className="flex items-center gap-4 px-6 py-5 text-left border-2 border-border hover:border-brown hover:bg-brown hover:text-white rounded-xl text-lg font-medium transition-all"
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-full transition-all font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              ) : (
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
        )}
      </main>
    </div>
  );
}
