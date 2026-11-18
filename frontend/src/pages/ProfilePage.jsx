import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  User, 
  Save, 
  GraduationCap, 
  Target, 
  Key, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Layers
} from 'lucide-react';
import { api, setCurrentUser } from '../services/api';

const EDUCATION_LEVELS = ['High School', 'Undergraduate', 'Graduate', 'Self-Learner', 'Professional'];
const AVAILABLE_SUBJECTS = [
  'Python Programming', 
  'Data Structures & Algorithms', 
  'Machine Learning Foundations', 
  'Web Development'
];

export default function ProfilePage() {
  const { user, setUser } = useOutletContext();
  const [name, setName] = useState(user?.name || '');
  const [educationLevel, setEducationLevel] = useState(user?.education_level || 'Undergraduate');
  const [learningGoals, setLearningGoals] = useState(user?.learning_goals || '');
  const [interests, setInterests] = useState(user?.interests || []);
  const [health, setHealth] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEducationLevel(user.education_level || 'Undergraduate');
      setLearningGoals(user.learning_goals || '');
      setInterests(user.interests || []);
    }
  }, [user]);

  useEffect(() => {
    api.checkHealth().then(setHealth).catch(console.error);
  }, []);

  const handleInterestToggle = (subj) => {
    setInterests((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await api.updateProfile({
        name,
        education_level: educationLevel,
        learning_goals: learningGoals,
        interests,
      });

      setUser(updated);
      setCurrentUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200/50">
          <User className="w-3.5 h-3.5 text-brand-600" />
          Module 1: Student Profile & System Settings
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Student Profile & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your learning goals, academic baseline, and target domains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Settings Form */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Academic Profile
          </h3>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile preferences updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Education Level</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Primary Learning Goal</label>
              <textarea
                rows={3}
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none leading-relaxed"
                placeholder="What skills or concepts do you want to master?"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Target Subjects</label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_SUBJECTS.map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => handleInterestToggle(subj)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      interests.includes(subj)
                        ? 'bg-brand-50 border-brand-200 text-brand-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{subj}</span>
                    {interests.includes(subj) && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* System & API Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 h-fit">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-600" />
            Backend & Integrations
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Database Engine</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> SQLite Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">OpenAI API Key</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  health?.openai_configured ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {health?.openai_configured ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Curated Fallback
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">SerpAPI Key</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  health?.serpapi_configured ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {health?.serpapi_configured ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Curated Catalog
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">PDF Report Generator</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> FPDF2 Active
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            API keys can be supplied inside <code className="text-slate-800 font-mono">backend/.env</code> for live web search and dynamic OpenAI assessment generation.
          </div>
        </div>
      </div>
    </div>
  );
}
