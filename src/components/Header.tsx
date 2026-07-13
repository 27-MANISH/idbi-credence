'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark, Sun, Moon, User, LayoutDashboard, ShieldCheck, Compass } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Sync theme with HTML class
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isMsme = pathname.startsWith('/msme');
  const isOfficer = pathname.startsWith('/officer');

  return (
    <header className="bg-fin-surface border-b border-gray-200/50 sticky top-0 z-40 shadow-xs backdrop-blur-md bg-opacity-80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-3 cursor-pointer">
          <div className="p-2 bg-fin-primary rounded-xl text-white flex items-center justify-center shadow-md shadow-fin-primary/10">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[9px] font-bold text-fin-primary tracking-wider block uppercase">
              MSME ASSURANCE SYSTEM
            </span>
            <h1 className="text-base font-black text-fin-text tracking-tight flex items-center">
              Credence
              <span className="text-fin-primary ml-1.5 font-mono text-[10px] font-bold bg-fin-primary/10 px-1.5 py-0.5 rounded border border-fin-primary/20">
                AI Platform
              </span>
            </h1>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-fin-surface-2 p-1 rounded-xl border border-gray-200/30">
          <Link
            href="/msme/onboarding"
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isMsme
                ? 'bg-fin-primary text-white shadow-sm'
                : 'text-fin-text-muted hover:text-fin-text'
            }`}
          >
            MSME Portal
          </Link>
          <Link
            href="/officer/dashboard"
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isOfficer
                ? 'bg-fin-primary text-white shadow-sm'
                : 'text-fin-text-muted hover:text-fin-text'
            }`}
          >
            Credit Officer Console
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-fin-surface-2 border border-gray-200/30 text-fin-text-muted hover:text-fin-text hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* User Profile / Status */}
          <div className="flex items-center space-x-3 bg-fin-surface-2 px-3 py-1 rounded-xl border border-gray-200/30">
            <div className="p-1 bg-fin-primary/10 rounded-lg">
              <User className="h-3.5 w-3.5 text-fin-primary" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[9px] font-mono font-bold text-fin-success uppercase block leading-none flex items-center">
                <span className="w-1.5 h-1.5 bg-fin-success rounded-full mr-1 inline-block animate-pulse"></span>
                {isOfficer ? 'IDBI Reviewer Node' : 'Borrower Node'}
              </span>
              <span className="text-[11px] font-bold text-fin-text mt-0.5 block leading-none">
                {isOfficer ? 'shashankckotagi@gmail.com' : 'msme_owner@finhealth.in'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
