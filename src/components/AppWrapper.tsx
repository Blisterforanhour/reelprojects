import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './AppWrapper.css';

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
      <div className="app-wrapper">
        <div className="initializing-screen">
          <div className="initializing-content">
            <div className="loading-spinner"></div>
            <p className="initializing-text">Initializing ReelProject...</p>
          </div>
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

    const getSubmitButtonContent = () => {
      if (isLoading) {
        return <div className="button-spinner"></div>;
      }

      switch (authMode) {
        case 'login':
          return (
            <>
              <User size={20} />
              Sign In
            </>
          );
        case 'signup':
          return (
            <>
              <User size={20} />
              Sign Up
            </>
          );
        case 'reset':
          return (
            <>
              <Mail size={20} />
              Send Reset Email
            </>
          );
        default:
          return 'Submit';
      }
    };

    const getAuthTitle = () => {
      switch (authMode) {
        case 'login':
          return 'Sign in to your account';
        case 'signup':
          return 'Create your account';
        case 'reset':
          return 'Reset your password';
        default:
          return '';
      }
    };

    return (
      <div className="app-wrapper">
        <div className="auth-screen">
          <div className="auth-container">
            <div className="auth-header">
              <h1 className="auth-title">ReelProject</h1>
              <p className="auth-subtitle">{getAuthTitle()}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-container">
                  <Mail className="input-icon" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {authMode !== 'reset' && (
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-container">
                    <Lock className="input-icon" size={20} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`form-input ${authMode !== 'reset' ? 'password-input' : ''}`}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                      disabled={isLoading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {getSubmitButtonContent()}
              </button>
            </form>

            <div className="auth-links">
              {authMode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="auth-link"
                    disabled={isLoading}
                  >
                    Don't have an account? Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('reset')}
                    className="auth-link secondary-link"
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </button>
                </>
              )}
              {authMode === 'signup' && (
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="auth-link"
                  disabled={isLoading}
                >
                  Already have an account? Sign in
                </button>
              )}
              {authMode === 'reset' && (
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="auth-link"
                  disabled={isLoading}
                >
                  Back to sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="app-wrapper">{children}</div>;
};