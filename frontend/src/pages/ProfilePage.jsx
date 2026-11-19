import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, CheckCircle, Save } from 'lucide-react';
import { api, setCurrentUser } from '../services/api';

const EDUCATION_LEVELS = ['High School', 'Undergraduate', 'Graduate', 'Self-Learner', 'Professional'];
const SUBJECT_LIST = ['Python Programming', 'Data Structures & Algorithms', 'Machine Learning Foundations', 'Web Development'];

export default function ProfilePage() {
  const { user, setUser } = useOutletContext();
  const [name, setName] = useState(user?.name || '');
  const [educationLevel, setEducationLevel] = useState(user?.education_level || 'Undergraduate');
  const [learningGoals, setLearningGoals] = useState(user?.learning_goals || '');
  const [interests, setInterests] = useState(user?.interests || []);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (subj) => {
    setInterests((prev) =>
      prev.includes(subj) ? prev.filter((i) => i !== subj) : [...prev, subj]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSaved(false);
    try {
      const updated = await api.updateProfile({
        name,
        education_level: educationLevel,
        learning_goals: learningGoals,
        interests,
      });
      setUser(updated);
      setCurrentUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section aria-labelledby="profile-heading" className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div
            aria-hidden="true"
            className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 font-bold text-lg flex items-center justify-center border border-brand-200"
          >
            {name ? name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Module 1: Student Profile &amp; Preferences</span>
            </div>
            <h2 id="profile-heading" className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-600">{user?.email}</p>
          </div>
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {saved && (
          <div role="status" aria-live="polite" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Profile preferences saved! Your AI Tutor and roadmaps will adapt to your updated settings.</span>
          </div>
        )}

        <form onSubmit={handleSave} aria-label="Update Student Profile and Preferences" className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-full-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="profile-full-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label htmlFor="profile-education-level" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Education Level
              </label>
              <select
                id="profile-education-level"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="profile-learning-goals" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Learning Goals &amp; Objectives
            </label>
            <textarea
              id="profile-learning-goals"
              rows={3}
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <fieldset>
            <legend className="block text-xs font-semibold text-slate-700 mb-2">
              Active Subject Interests
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUBJECT_LIST.map((subj) => {
                const selected = interests.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleInterest(subj)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                      selected
                        ? 'bg-brand-50 border-brand-300 text-brand-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{subj}</span>
                    {selected && <CheckCircle className="w-4 h-4 text-brand-600" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}