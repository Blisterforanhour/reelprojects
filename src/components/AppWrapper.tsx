import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Phone, Building, MapPin } from 'lucide-react';
import './AppWrapper.css';

interface AppWrapperProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isInitializing: boolean;
  _user: any;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, additionalData?: any) => Promise<void>;
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const validateSignupForm = () => {
    const errors: {[key: string]: string} = {};

    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!acceptTerms) {
      errors.terms = 'You must accept the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
      setFormErrors({});

      if (authMode === 'signup') {
        if (!validateSignupForm()) {
          return;
        }
        
        const additionalData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          company: company.trim(),
          jobTitle: jobTitle.trim(),
          location: location.trim(),
        };

        await onSignup(email, password, additionalData);
      } else if (authMode === 'login') {
        await onLogin(email, password);
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
              Create Account
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
          return 'Create your professional account';
        case 'reset':
          return 'Reset your password';
        default:
          return '';
      }
    };

    const clearForm = () => {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setCompany('');
      setJobTitle('');
      setLocation('');
      setAcceptTerms(false);
      setFormErrors({});
    };

    const handleModeChange = (newMode: 'login' | 'signup' | 'reset') => {
      clearForm();
      setAuthMode(newMode);
    };

    return (
      <div className="app-wrapper">
        <div className="auth-screen">
          <div className={`auth-container ${authMode === 'signup' ? 'signup-container' : ''}`}>
            <div className="auth-header">
              <h1 className="auth-title">ReelProject</h1>
              <p className="auth-subtitle">{getAuthTitle()}</p>
              <div className="text-xs text-gray-500 mt-2">
                Part of the{' '}
                <a 
                  href="https://www.reelapps.co.za" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ReelApps.co.za
                </a>
                {' '}professional development ecosystem
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {authMode === 'signup' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">
                        First Name *
                      </label>
                      <div className="input-container">
                        <User className="input-icon" size={20} />
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={`form-input ${formErrors.firstName ? 'error' : ''}`}
                          placeholder="Enter your first name"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      {formErrors.firstName && (
                        <span className="field-error">{formErrors.firstName}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName" className="form-label">
                        Last Name *
                      </label>
                      <div className="input-container">
                        <User className="input-icon" size={20} />
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className={`form-input ${formErrors.lastName ? 'error' : ''}`}
                          placeholder="Enter your last name"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      {formErrors.lastName && (
                        <span className="field-error">{formErrors.lastName}</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email {authMode === 'signup' && '*'}
                </label>
                <div className="input-container">
                  <Mail className="input-icon" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`form-input ${formErrors.email ? 'error' : ''}`}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
                {formErrors.email && (
                  <span className="field-error">{formErrors.email}</span>
                )}
              </div>

              {authMode !== 'reset' && (
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password {authMode === 'signup' && '*'}
                  </label>
                  <div className="input-container">
                    <Lock className="input-icon" size={20} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`form-input password-input ${formErrors.password ? 'error' : ''}`}
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
                  {formErrors.password && (
                    <span className="field-error">{formErrors.password}</span>
                  )}
                  {authMode === 'signup' && (
                    <div className="password-requirements">
                      <small>Password must be at least 8 characters with uppercase, lowercase, and number</small>
                    </div>
                  )}
                </div>
              )}

              {authMode === 'signup' && (
                <>
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password *
                    </label>
                    <div className="input-container">
                      <Lock className="input-icon" size={20} />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`form-input password-input ${formErrors.confirmPassword ? 'error' : ''}`}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle"
                        disabled={isLoading}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <span className="field-error">{formErrors.confirmPassword}</span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <div className="input-container">
                        <Phone className="input-icon" size={20} />
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={`form-input ${formErrors.phone ? 'error' : ''}`}
                          placeholder="+1 (555) 123-4567"
                          disabled={isLoading}
                        />
                      </div>
                      {formErrors.phone && (
                        <span className="field-error">{formErrors.phone}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="location" className="form-label">
                        Location
                      </label>
                      <div className="input-container">
                        <MapPin className="input-icon" size={20} />
                        <input
                          id="location"
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="form-input"
                          placeholder="City, Country"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="company" className="form-label">
                        Company
                      </label>
                      <div className="input-container">
                        <Building className="input-icon" size={20} />
                        <input
                          id="company"
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="form-input"
                          placeholder="Your company name"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="jobTitle" className="form-label">
                        Job Title
                      </label>
                      <div className="input-container">
                        <User className="input-icon" size={20} />
                        <input
                          id="jobTitle"
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="form-input"
                          placeholder="Your job title"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="checkbox-container">
                      <input
                        id="acceptTerms"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className={`form-checkbox ${formErrors.terms ? 'error' : ''}`}
                        required
                        disabled={isLoading}
                      />
                      <label htmlFor="acceptTerms" className="checkbox-label">
                        I agree to the{' '}
                        <a href="https://www.reelapps.co.za/terms" target="_blank" className="terms-link">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="https://www.reelapps.co.za/privacy" target="_blank" className="terms-link">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {formErrors.terms && (
                      <span className="field-error">{formErrors.terms}</span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-800 rounded-lg">
                    <p className="mb-2">
                      <strong>Join the complete professional development platform:</strong>
                    </p>
                    <ul className="space-y-1">
                      <li>• Build projects with <strong>ReelProject</strong></li>
                      <li>• Create your professional profile with{' '}
                        <a href="https://reelcv.reelapps.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          ReelCV
                        </a>
                      </li>
                      <li>• Discover your work personality with{' '}
                        <a href="https://reelpersona.reelapps.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          ReelPersona
                        </a>
                      </li>
                      <li>• Find opportunities with{' '}
                        <a href="https://reelhunter.reelapps.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          ReelHunter
                        </a>
                      </li>
                      <li>• Develop skills with{' '}
                        <a href="https://reelskills.reelapps.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          ReelSkills
                        </a>
                      </li>
                    </ul>
                  </div>
                </>
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
                    onClick={() => handleModeChange('signup')}
                    className="auth-link"
                    disabled={isLoading}
                  >
                    Don't have an account? Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('reset')}
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
                  onClick={() => handleModeChange('login')}
                  className="auth-link"
                  disabled={isLoading}
                >
                  Already have an account? Sign in
                </button>
              )}
              {authMode === 'reset' && (
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="auth-link"
                  disabled={isLoading}
                >
                  Back to sign in
                </button>
              )}
            </div>

            {/* Footer with ecosystem links */}
            <div className="text-center mt-6 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500">
                <p className="mb-2">Powered by{' '}
                  <a 
                    href="https://www.reelapps.co.za" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ReelApps.co.za
                  </a>
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  <a 
                    href="https://reelcv.reelapps.co.za" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ReelCV
                  </a>
                  <span className="text-gray-600">•</span>
                  <a 
                    href="https://reelpersona.reelapps.co.za" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ReelPersona
                  </a>
                  <span className="text-gray-600">•</span>
                  <a 
                    href="https://reelhunter.reelapps.co.za" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ReelHunter
                  </a>
                  <span className="text-gray-600">•</span>
                  <a 
                    href="https://reelskills.reelapps.co.za" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ReelSkills
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="app-wrapper">{children}</div>;
};