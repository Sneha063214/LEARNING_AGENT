import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { api, setAuthToken, setCurrentUser } from '../services/api';

const EDUCATION_LEVELS = ['High School', 'Undergraduate', 'Graduate', 'Self-Learner', 'Professional'];
const AVAILABLE_SUBJECTS = ['Python Programming', 'Data Structures & Algorithms', 'Machine Learning Foundations', 'Web Development'];

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [learningGoals, setLearningGoals] = useState('Master core computer science topics and eliminate knowledge gaps.');
  const [selectedInterests, setSelectedInterests] = useState(['Python Programming', 'Machine Learning Foundations']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInterestToggle = (subj) => {
    setSelectedInterests((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim() || !email.includes('@')) throw new Error('Please enter a valid email address.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        const res = await api.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          education_level: educationLevel,
          learning_goals: learningGoals,
          interests: selectedInterests,
        });

        setAuthToken(res.token);
        setCurrentUser(res.user);
        navigate('/dashboard');
      } else {
        if (!email.trim() || !password) throw new Error('Email and password are required.');

        const res = await api.login({
          email: email.trim().toLowerCase(),
          password,
        });

        setAuthToken(res.token);
        setCurrentUser(res.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main role="main" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div aria-hidden="true" className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isRegister ? 'Create Student Account' : 'Welcome to LearnPath AI'}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {isRegister ? 'Begin your personalized adaptive learning journey' : 'Sign in to access your roadmaps and progress'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div role="tablist" aria-label="Authentication Mode" className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              !isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {isRegister && (
            <div>
              <label htmlFor="auth-full-name" className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                id="auth-full-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sneha Sharma"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input
              id="auth-password"
              type="password"
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label htmlFor="auth-education-level" className="block text-xs font-medium text-slate-700 mb-1">Education Level</label>
                <select
                  id="auth-education-level"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="auth-learning-goals" className="block text-xs font-medium text-slate-700 mb-1">Primary Learning Goal</label>
                <textarea
                  id="auth-learning-goals"
                  rows={2}
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  placeholder="What do you want to accomplish?"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>

              <fieldset>
                <legend className="block text-xs font-medium text-slate-700 mb-2">Target Subjects</legend>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SUBJECTS.map((subj) => {
                    const isSelected = selectedInterests.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleInterestToggle(subj)}
                        className={`p-2 rounded-lg text-[11px] font-medium border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-brand-50 border-brand-200 text-brand-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{subj}</span>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-brand-600 shrink-0 ml-1" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Register & Launch' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-brand-600 font-semibold hover:underline"
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}