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

// Abstract vibe labels accumulated across all answers
type Vibe = 'comedy' | 'drama' | 'thriller' | 'documentary' | 'reality' | 'action' | 'family' | 'sports';

interface QuizState {
  medium: Medium | '';
  vibes: Vibe[];
}

interface Option {
  label: string;
  emoji: string;
  vibes: Vibe[];
  medium?: Medium | '';
}

interface Question {
  title: string;
  subtitle: string;
  options: Option[];
}

const questions: Question[] = [
  {
    title: "It's your evening. What sounds right?",
    subtitle: "Go with your gut",
    options: [
      { label: "Something that makes me laugh and unwind", emoji: "😂", vibes: ['comedy'] },
      { label: "Something gripping I can't look away from", emoji: "😬", vibes: ['thriller', 'drama'] },
      { label: "Something moving and emotional", emoji: "🥹", vibes: ['drama'] },
      { label: "Something that teaches me something real", emoji: "🧠", vibes: ['documentary'] },
    ],
  },
  {
    title: "Movie or series tonight?",
    subtitle: "How much are you committing?",
    options: [
      { label: "Movie — done in 2 hours", emoji: "🎬", vibes: [], medium: 'Movie' },
      { label: "Series — I want to binge", emoji: "📺", vibes: [], medium: 'TV' },
      { label: "Either — surprise me", emoji: "🎲", vibes: [], medium: '' },
    ],
  },
  {
    title: "The last thing you watched and couldn't stop talking about...",
    subtitle: "What was it like?",
    options: [
      { label: "A documentary that blew my mind", emoji: "🤯", vibes: ['documentary'] },
      { label: "A drama I got completely lost in", emoji: "🎭", vibes: ['drama'] },
      { label: "A comedy I kept quoting", emoji: "😆", vibes: ['comedy'] },
      { label: "A thriller that kept me guessing", emoji: "🔍", vibes: ['thriller'] },
    ],
  },
  {
    title: "When you're out with friends, you're usually...",
    subtitle: "Be honest",
    options: [
      { label: "The one making everyone laugh", emoji: "😄", vibes: ['comedy'] },
      { label: "The one who brings up something wild you read", emoji: "📰", vibes: ['documentary'] },
      { label: "The one suggesting something competitive or sporty", emoji: "🏆", vibes: ['sports', 'action'] },
      { label: "The one deep in conversation about something intense", emoji: "💬", vibes: ['drama', 'thriller'] },
    ],
  },
  {
    title: "Pick a word that fits your mood tonight:",
    subtitle: "First instinct wins",
    options: [
      { label: "Cozy", emoji: "🛋️", vibes: ['comedy', 'reality'] },
      { label: "Intense", emoji: "⚡", vibes: ['thriller', 'drama'] },
      { label: "Heartwarming", emoji: "💛", vibes: ['drama', 'family'] },
      { label: "Curious", emoji: "🔎", vibes: ['documentary'] },
    ],
  },
  {
    title: "Your guilty pleasure is...",
    subtitle: "No judgment here",
    options: [
      { label: "Reality TV — the messier the better", emoji: "🌹", vibes: ['reality'] },
      { label: "True crime docs at midnight", emoji: "🚨", vibes: ['documentary'] },
      { label: "Big dumb action movies", emoji: "💥", vibes: ['action'] },
      { label: "Comedy specials on repeat", emoji: "🎤", vibes: ['comedy'] },
    ],
  },
  {
    title: "You're more likely to recommend something because...",
    subtitle: "What makes you tell someone they have to watch it?",
    options: [
      { label: "It made me ugly cry", emoji: "😭", vibes: ['drama'] },
      { label: "I was laughing the entire time", emoji: "🤣", vibes: ['comedy'] },
      { label: "It completely changed how I see something", emoji: "💡", vibes: ['documentary'] },
      { label: "I couldn't stop — watched it all in one sitting", emoji: "🌙", vibes: ['thriller', 'drama'] },
    ],
  },
  {
    title: "Right now you feel like...",
    subtitle: "What do you actually need tonight?",
    options: [
      { label: "Escaping into something fun", emoji: "🎡", vibes: ['comedy', 'action'] },
      { label: "Feeling something real and deep", emoji: "❤️", vibes: ['drama'] },
      { label: "Letting someone else's drama play out", emoji: "🍿", vibes: ['reality', 'thriller'] },
      { label: "Learning something I'll think about for days", emoji: "🌍", vibes: ['documentary'] },
    ],
  },
  {
    title: "Who are you watching with tonight?",
    subtitle: "This helps narrow it down",
    options: [
      { label: "Just me", emoji: "🛋️", vibes: [] },
      { label: "My partner", emoji: "💑", vibes: ['drama', 'comedy'] },
      { label: "A group of friends", emoji: "👫", vibes: ['comedy', 'action', 'reality'] },
      { label: "Family with kids", emoji: "👨‍👩‍👧", vibes: ['family', 'comedy'] },
    ],
  },
  {
    title: "After a perfect watch, you feel...",
    subtitle: "What's the feeling you're chasing?",
    options: [
      { label: "Lighter and happier", emoji: "☀️", vibes: ['comedy', 'family'] },
      { label: "Emotionally wrung out — in a good way", emoji: "🫀", vibes: ['drama'] },
      { label: "Like I just learned something important", emoji: "📚", vibes: ['documentary'] },
      { label: "Like I need to tell everyone about it immediately", emoji: "📣", vibes: ['thriller', 'drama', 'documentary'] },
    ],
  },
];

// Map vibe labels → actual DB content type strings, respecting medium
function vibesToContentTypes(topVibes: Vibe[], medium: Medium | ''): ContentType[] {
  const map: Record<Vibe, { movie: ContentType[]; tv: ContentType[] }> = {
    comedy:      { movie: ['Comedy', 'Comedy Specials'],            tv: ['Comedy TV', 'Comedy Specials'] },
    drama:       { movie: ['Drama'],                                tv: ['Drama TV'] },
    thriller:    { movie: ['Thriller'],                             tv: ['Drama TV'] },
    documentary: { movie: ['Documentary/True Crime'],               tv: ['Documentary/True Crime'] },
    reality:     { movie: ['Reality Competition', 'Reality Dating'], tv: ['Reality Competition', 'Reality Dating'] },
    action:      { movie: ['Action', 'Comic Book Stuff'],           tv: ['Comic Book Stuff'] },
    family:      { movie: ['Family'],                               tv: ['Comedy TV'] },
    sports:      { movie: ['Sports'],                               tv: ['Sports'] },
  };

  const types = new Set<ContentType>();
  for (const vibe of topVibes) {
    const bucket = map[vibe];
    if (!bucket) continue;
    if (medium === 'Movie') bucket.movie.forEach((t) => types.add(t));
    else if (medium === 'TV') bucket.tv.forEach((t) => types.add(t));
    else {
      bucket.movie.forEach((t) => types.add(t));
      bucket.tv.forEach((t) => types.add(t));
    }
  }
  return Array.from(types);
}

function tallyVibes(vibes: Vibe[]): Vibe[] {
  const counts: Partial<Record<Vibe, number>> = {};
  for (const v of vibes) counts[v] = (counts[v] ?? 0) + 1;
  return (Object.entries(counts) as [Vibe, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([v]) => v);
}

function shuffleTop(arr: Entry[]): Entry[] {
  const top = arr.slice(0, 10);
  for (let i = top.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [top[i], top[j]] = [top[j], top[i]];
  }
  return top;
}

function pickRecommendations(entries: Entry[], state: QuizState): Entry[] {
  const ranked = tallyVibes(state.vibes);

  // Progressively widen: try top 1 vibe, then top 2, then all vibes
  for (let take = 1; take <= Math.max(ranked.length, 1); take++) {
    const types = vibesToContentTypes(ranked.slice(0, take), state.medium);
    const pool = entries.filter((e) => {
      if (state.medium && e.medium !== state.medium) return false;
      if (types.length > 0 && !types.includes(e.type as ContentType)) return false;
      return e.score >= 4;
    });
    if (pool.length >= 3) return shuffleTop(pool).slice(0, 3);
  }

  // Last resort: anything quality matching medium
  const fallback = entries.filter(
    (e) => (!state.medium || e.medium === state.medium) && e.score >= 4
  );
  return shuffleTop(fallback).slice(0, 3);
}

function RecommendationResult({ picks, onRetake }: { picks: Entry[]; onRetake: () => void }) {
  const [main, ...alts] = picks;
  const mainTags = getDisplayTags(main.tags, main.score).slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-brown" />
          <h2 className="font-serif text-3xl font-bold text-text-dark">Here's what you should watch</h2>
        </div>
        <p className="text-text-medium">Based on your answers, this is our top pick for tonight.</p>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden mb-10">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 flex-shrink-0 h-64 sm:h-auto bg-brown/10">
            {main.poster_url ? (
              <Image src={main.poster_url} alt={main.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 192px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-16 h-16 text-brown/30" />
              </div>
            )}
          </div>
          <div className="p-8 flex flex-col justify-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-cream rounded-full text-text-medium border border-border font-medium">{main.medium}</span>
              <span className="text-xs px-3 py-1 bg-cream rounded-full text-text-medium border border-border font-medium">{main.type}</span>
            </div>
            <h3 className="font-serif text-3xl font-bold text-text-dark leading-tight">{main.title}</h3>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-brown text-brown" />
              <span className="font-bold text-text-dark text-lg">{main.score}</span>
              <span className="text-text-light text-sm">/ 5 · {main.year}</span>
            </div>
            {mainTags.length > 0 && (
              <p className="text-sm text-text-medium">{mainTags.join(' · ')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Alternates */}
      {alts.length > 0 && (
        <div className="mb-10">
          <p className="text-center text-text-medium font-medium mb-5">Not interested? Maybe try these...</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alts.map((alt) => {
              const altTags = getDisplayTags(alt.tags, alt.score).slice(0, 2);
              return (
                <div key={alt.id} className="bg-white rounded-xl border border-border p-4 flex gap-4 shadow-sm hover:shadow-md hover:border-brown transition-all">
                  <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-brown/10">
                    {alt.poster_url ? (
                      <Image src={alt.poster_url} alt={alt.title} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-brown/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <h4 className="font-semibold text-text-dark text-sm leading-tight line-clamp-2">{alt.title}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-brown text-brown" />
                      <span className="text-xs font-semibold text-text-dark">{alt.score}</span>
                      <span className="text-xs text-text-light">· {alt.year}</span>
                    </div>
                    {altTags.length > 0 && (
                      <p className="text-xs text-text-light">{altTags.join(' · ')}</p>
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
  const [state, setState] = useState<QuizState>({ medium: '', vibes: [] });

  const applyAnswer = async (option: Option) => {
    const next: QuizState = {
      medium: option.medium !== undefined ? option.medium : state.medium,
      vibes: [...state.vibes, ...option.vibes],
    };
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
      const { data } = await supabase.from('entries').select('*').order('score', { ascending: false });
      setPicks(pickRecommendations(data || [], finalState));
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setPicks(null);
    setStep(0);
    setState({ medium: '', vibes: [] });
  };

  const current = questions[step];

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <main className="container mx-auto px-6 py-12">

        {loading && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream border-t-brown mb-6" />
            <p className="text-xl text-text-medium font-medium">Finding your perfect watch...</p>
          </div>
        )}

        {!loading && picks && <RecommendationResult picks={picks} onRetake={retake} />}

        {!loading && !picks && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-text-medium">Question {step + 1} of {questions.length}</span>
                <span className="text-sm font-medium text-text-medium">{Math.round(((step + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 border border-border">
                <div
                  className="bg-brown h-full rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-10 mb-8 border border-border">
              <h1 className="font-serif text-3xl font-bold mb-3 text-text-dark">{current.title}</h1>
              <p className="text-text-medium mb-8 text-lg">{current.subtitle}</p>
              <div className="flex flex-col gap-3">
                {current.options.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => applyAnswer(option)}
                    className="flex items-center gap-4 px-6 py-5 text-left border-2 border-border hover:border-brown hover:bg-brown hover:text-white rounded-xl text-lg font-medium transition-all"
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-full transition-all font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              ) : (
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-full transition-all font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Home
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
