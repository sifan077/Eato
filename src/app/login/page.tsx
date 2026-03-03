'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-3xl shadow-xl mb-4 sm:mb-6 transform hover:scale-105 transition-transform duration-300">
            <span className="text-4xl sm:text-5xl">🍽️</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Eato
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            记录每一餐，享受生活
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50 dark:border-gray-800/50 transition-colors duration-300 relative">
          {/* Theme Toggle Button */}
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8 text-center">
            欢迎回来
          </h2>

          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-gray-500">📧</span>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-gray-500">🔒</span>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-3 sm:py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:from-cyan-300 disabled:to-teal-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          © 2026 Eato. 用心记录每一餐
        </p>
      </div>
    </div>
  );
}
