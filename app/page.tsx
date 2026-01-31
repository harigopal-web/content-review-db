'use client';

import Link from 'next/link';
import { Sparkles, Database } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to the Gopal Family Content Engine
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              This is a searchable way to get content recommendations, see our full database, and also see our favorite content from the last few years. Enjoy exploring our site!
            </p>
          </div>

          {/* Two Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Option 1: Quiz */}
            <Link
              href="/quiz"
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  Recommend Me Something
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Take our quick quiz and we'll suggest the perfect show or movie based on your preferences.
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                  <span>Start Quiz</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Option 2: Browse Database */}
            <Link
              href="/browse"
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-6">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  Browse Full Database
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Explore our complete collection with advanced filters to find exactly what you're looking for.
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                  <span>View All Content</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Or jump to:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/five-stars"
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium"
              >
                ⭐ 5-Star Shows
              </Link>
              <Link
                href="/top-10"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
              >
                🏆 All-Time Top 10
              </Link>
              <Link
                href="/hall-of-fame"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-colors font-medium"
              >
                🎖️ Hall of Fame
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
