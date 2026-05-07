'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { ShieldCheck, Sun, Moon } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle Hydration
  useEffect(() => setMounted(true), []);

  // Handle Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${isScrolled ? 'pt-6' : 'pt-0'}`}>
      <nav
        className={`transition-all duration-500 ease-in-out flex items-center justify-between px-10 ${isScrolled
            ? 'w-[95%] md:w-[90%] max-w-6xl py-4 bg-white/90 dark:bg-slate-950/75 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/60 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.15)]'
            : 'w-full max-w-7xl py-8 bg-slate-50/50 dark:bg-slate-950/0 border-b border-slate-100 dark:border-transparent rounded-none shadow-none'
          }`}
      >
        <Link href="#hero" className="flex items-center space-x-3 group shrink-0">
          <div className={`transition-all duration-500 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-500 group-hover:rotate-12 transition-transform" />
          </div>
          <span className={`font-newsreader font-bold tracking-tight transition-all duration-500 ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>
            Aegis.
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-12 text-base font-medium">
          <Link href="/upload" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
            System Entry
          </Link>
          <Link href="#architecture" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
            Architecture
          </Link>
          <Link href="#pillars" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
            Guardrails
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className={`p-2.5 rounded-full transition-all duration-300 ${isScrolled
                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  : 'bg-white/80 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800'
                }`}
              aria-label="Toggle Theme"
            >
              {resolvedTheme === 'dark'
                ? <Moon className="w-4 h-4 text-blue-400" />
                : <Sun className="w-4 h-4 text-amber-500" />
              }
            </button>
          )}

          <Link 
            href="/upload" 
            className={`hidden sm:flex items-center px-6 py-2.5 rounded-full font-bold transition-all duration-500 ${
              isScrolled 
                ? 'bg-blue-600 text-white text-sm py-2' 
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-base'
            } hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 uppercase tracking-wide`}
          >
            Launch
          </Link>
        </div>
      </nav>
    </header>
  );
}
