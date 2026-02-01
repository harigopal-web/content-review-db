'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Sparkles, Star, Trophy, Award } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse', icon: Search },
    { href: '/quiz', label: 'Quiz', icon: Sparkles },
    { href: '/five-stars', label: '5-Star Shows', icon: Star },
    { href: '/top-10', label: 'Top 10', icon: Trophy },
  ];

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="font-serif text-2xl font-bold text-text-dark">
            Gopal Family Content Engine
          </Link>

          <div className="flex items-center gap-8">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-brown text-white font-medium'
                      : 'text-text-medium hover:text-brown hover:bg-brown/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline text-sm">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
