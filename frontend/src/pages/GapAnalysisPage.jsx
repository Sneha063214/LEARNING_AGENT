import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  Bot, 
  Sparkles, 
  Target,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function GapAnalysisPage() {
  const { activeSubjectId } = useOutletContext();
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'Weak', 'Moderate', 'Strong'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getGapAnalysis(activeSubjectId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSubjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72 text-slate-400 text-sm">
        <Sparkles className="w-5 h-5 animate-spin text-brand-500 mr-2" />
        Analyzing persistent knowledge gaps...
      </div>
    );
  }

  const allTopics = data?.all_evaluated_topics || [];
  const filteredTopics = filter === 'all' 
    ? allTopics 
    : allTopics.filter((t) => t.proficiency_level === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold mb-2 border border-red-200/50">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          Module 3: Knowledge Gap Detection Engine
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Knowledge Gap Matrix & Diagnostics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Objective classification of your conceptual proficiency derived directly from verified assessment scores.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Total Assessed</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data?.total_assessed || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Concepts evaluated</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-red-200/80 bg-red-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-800">Critical Gaps</span>
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{data?.counts?.weak || 0}</p>
          <p className="text-[11px] text-red-500/80 mt-1">Score &lt; 60% (High Priority)</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Moderate Understanding</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">{data?.counts?.moderate || 0}</p>
          <p className="text-[11px] text-amber-500/80 mt-1">Score 60% – 79% (Needs Review)</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Demonstrated Mastery</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{data?.counts?.strong || 0}</p>
          <p className="text-[11px] text-emerald-500/80 mt-1">Score &ge; 80% (Verified Strong)</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {['all', 'Weak', 'Moderate', 'Strong'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All Concepts' : `${f} (${allTopics.filter((t) => t.proficiency_level === f).length})`}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredTopics.length} of {allTopics.length} topics
        </span>
      </div>

      {/* Topic Cards Grid */}
      {filteredTopics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No concepts found in this filter</h4>
          <p className="text-xs text-slate-400 mt-1">
            Complete a diagnostic assessment to generate proficiency ratings for this subject.
          </p>
          <Link
            to="/diagnostic"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 shadow-sm"
          >
            <span>Take Diagnostic Assessment</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTopics.map((item) => {
            const isWeak = item.proficiency_level === 'Weak';
            const isModerate = item.proficiency_level === 'Moderate';

            return (
              <div
                key={item.topic_id}
                className={`p-6 rounded-2xl bg-white border transition-all ${
                  isWeak
                    ? 'border-red-200/90 shadow-sm hover:shadow-md'
                    : isModerate
                    ? 'border-amber-200/90 shadow-sm hover:shadow-md'
                    : 'border-slate-200/80 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {item.subject_name}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.topic_name}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${
                      isWeak
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : isModerate
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {item.proficiency_level} &bull; {item.score_percentage}%
                  </span>
                </div>

                {/* Performance Diagnosis */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 mb-4">
                  <p className="font-semibold text-slate-800">
                    {isWeak
                      ? 'Detected Knowledge Gap:'
                      : isModerate
                      ? 'Review Recommendation:'
                      : 'Mastery Status:'}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {isWeak
                      ? `Scored ${item.score_percentage}% across ${item.total_attempts} attempt(s). Student struggles with core primitives and edge-case execution.`
                      : isModerate
                      ? `Scored ${item.score_percentage}%. Solid grasp of fundamental theory but occasional errors in application.`
                      : `Scored ${item.score_percentage}%. Demonstrates consistent accuracy and comprehension.`}
                  </p>
                </div>

                {/* Footer Meta & Actions */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span>{item.difficulty_level}</span>
                    <span>&bull;</span>
                    <span>~{item.estimated_minutes} min study</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/tutor"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask Tutor</span>
                    </Link>
                    <Link
                      to="/quiz"
                      className="px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-500 font-semibold text-xs flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <span>Quiz</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
