import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface AppWrapperProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isInitializing: boolean;
  _user: any;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  isLoading: boolean;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({
  children,
  isAuthenticated,
  isInitializing,
  error,
  onLogin,
  onSignup,
  onPasswordReset,
  isLoading
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (authMode === 'login') {
        await onLogin(email, password);
      } else if (authMode === 'signup') {
        await onSignup(email, password);
      } else {
        await onPasswordReset(email);
      }
    };

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ReelProject</h1>
            <p className="text-gray-400">
              {authMode === 'login' && 'Sign in to your account'}
              {authMode === 'signup' && 'Create your account'}
              {authMode === 'reset' && 'Reset your password'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {authMode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {authMode === 'login' && <><User size={20} className="mr-2" /> Sign In</>}
                  {authMode === 'signup' && <><User size={20} className="mr-2" /> Sign Up</>}
                  {authMode === 'reset' && <><Mail size={20} className="mr-2" /> Send Reset Email</>}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {authMode === 'login' && (
              <>
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Don't have an account? Sign up
                </button>
                <br />
                <button
                  onClick={() => setAuthMode('reset')}
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  Forgot your password?
                </button>
              </>
            )}
            {authMode === 'signup' && (
              <button
                onClick={() => setAuthMode('login')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Already have an account? Sign in
              </button>
            )}
            {authMode === 'reset' && (
              <button
                onClick={() => setAuthMode('login')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};