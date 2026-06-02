'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import type { Medium, ContentType } from '@/lib/types';

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
      { label: "Light, fun, no stress", emoji: "😄", apply: (s) => ({ contentType: 'Comedy' as ContentType }) },
      { label: "Edge-of-my-seat gripping", emoji: "😬", apply: (s) => ({ contentType: 'Thriller' as ContentType }) },
      { label: "Something moving and emotional", emoji: "🥹", apply: (s) => ({ contentType: 'Drama' as ContentType }) },
      { label: "Learn something real", emoji: "🧠", apply: (s) => ({ contentType: 'Documentary/True Crime' as ContentType }) },
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

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<QuizState>({
    medium: '',
    contentType: '',
    minScore: 0,
    mostRecent: false,
    tags: [],
  });

  const applyAnswer = (apply: (s: QuizState) => Partial<QuizState>) => {
    const updates = apply(state);
    const next = { ...state, ...updates };
    setState(next);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      finish(next);
    }
  };

  const finish = (finalState: QuizState) => {
    const params = new URLSearchParams();
    if (finalState.medium) params.set('medium', finalState.medium);
    if (finalState.contentType) params.set('type', finalState.contentType);
    if (finalState.tags.length > 0) params.set('tags', finalState.tags.join(','));
    if (finalState.minScore > 0) params.set('minScore', finalState.minScore.toString());
    if (finalState.mostRecent) params.set('mostRecent', 'true');
    router.push(`/browse?${params.toString()}`);
  };

  const current = questions[step];

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
                  className="flex items-center gap-4 px-6 py-5 text-left border-2 border-border hover:border-brown hover:bg-brown hover:text-white rounded-xl text-lg font-medium transition-all group"
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            {step === questions.length - 1 && (
              <div className="mt-6 pt-6 border-t border-border">
                <button
                  onClick={() => finish(state)}
                  className="w-full px-6 py-4 bg-brown hover:bg-brown-dark text-white rounded-full transition-all flex items-center justify-center gap-2 text-lg font-semibold shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Show Me Recommendations!</span>
                </button>
              </div>
            )}
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
      </main>
    </div>
  );
}
