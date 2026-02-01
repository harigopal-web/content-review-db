'use client';

import Link from 'next/link';
import { Sparkles, Database } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navigation />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
              Gopal Family Content Engine
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
              A searchable database to discover recommendations and explore our favorite content from recent years.
            </p>
          </div>

          {/* Two Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Option 1: Quiz */}
            <Link
              href="/quiz"
              className="group border border-gray-200 dark:border-gray-800 rounded-xl p-8 hover:border-gray-900 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-900 dark:bg-white rounded-lg">
                  <Sparkles className="w-6 h-6 text-white dark:text-gray-900" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Get a Recommendation
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Answer a few questions to find the perfect show or movie for you.
              </p>
              <div className="flex items-center text-gray-900 dark:text-white font-medium group-hover:gap-2 gap-1 transition-all">
                <span>Start quiz</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Option 2: Browse Database */}
            <Link
              href="/browse"
              className="group border border-gray-200 dark:border-gray-800 rounded-xl p-8 hover:border-gray-900 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-900 dark:bg-white rounded-lg">
                  <Database className="w-6 h-6 text-white dark:text-gray-900" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Browse All Content
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Explore the complete database with filters and search.
              </p>
              <div className="flex items-center text-gray-900 dark:text-white font-medium group-hover:gap-2 gap-1 transition-all">
                <span>View all</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">Quick links</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/five-stars"
                className="px-5 py-2 border border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                5-Star Shows
              </Link>
              <Link
                href="/top-10"
                className="px-5 py-2 border border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                Top 10
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
