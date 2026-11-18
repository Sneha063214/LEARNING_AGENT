import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Target, 
  Map, 
  Bot, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Brain
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <nav className="h-20 border-b border-slate-100 px-8 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            LearnPath <span className="text-brand-600 font-semibold">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-lg shadow-sm transition-all hover:shadow"
          >
            Open Platform
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          Next-Gen AI Personalized Learning Engine
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15] mb-6">
          Master any subject with an <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">adaptive learning agent</span>.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          LearnPath AI continuously identifies your exact knowledge gaps, maps prerequisite dependencies, dynamically constructs day-by-day roadmaps, and adapts its recommendations as you improve.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 transition-all text-sm"
          >
            <span>Start Learning Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold transition-all text-sm"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-brand-600 mb-2">Core Architecture</h2>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">The 4 Intelligent Pillars</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base mb-2">1. Knowledge Gap Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates question-level diagnostic tests to calculate exact topic-wise accuracy and classify proficiency into Strong, Moderate, or Weak with transparent reasoning.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mb-5">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base mb-2">2. Personalized Roadmaps</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Constructs a topological prerequisite learning graph that prioritizes weak concepts, schedules daily targets, and exports to printable PDF reports.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base mb-2">3. Dynamic AI Assessments</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates rigorous MCQs, True/False, and conceptual practice problems using OpenAI with instant pedagogical feedback and explanation of incorrect choices.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base mb-2">4. Adaptive Recommendations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Detects repeated mistakes, flags unmastered prerequisite concepts, adjusts quiz difficulties, and queries SerpAPI for tailored tutorials and documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} LearnPath AI. Built for real academic and technical mastery.</p>
      </footer>
    </div>
  );
}
