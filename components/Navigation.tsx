'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Star, Trophy, Award } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/browse', label: 'Browse', icon: Film },
    { href: '/five-stars', label: '5-Star Shows', icon: Star },
    { href: '/top-10', label: 'Top 10', icon: Trophy },
    // { href: '/hall-of-fame', label: 'Hall of Fame', icon: Award },
  ];

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-white">
            Gopal Content
          </Link>

          <div className="flex gap-1 md:gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
