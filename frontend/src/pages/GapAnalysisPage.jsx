import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Bot, 
  ArrowRight, 
  Sparkles,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function GapAnalysisPage() {
  const { activeSubjectId } = useOutletContext();
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.getGapAnalysis(activeSubjectId)
      .then(setGapData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSubjectId]);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="p-8 text-center text-xs text-slate-600">
        Analyzing topic proficiency and knowledge gaps...
      </div>
    );
  }

  const topics = gapData?.topics || [];
  const filteredTopics = filterLevel === 'All'
    ? topics
    : topics.filter((t) => t.proficiency_level === filterLevel);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Summary Header Cards */}
      <section aria-label="Knowledge Gap Summary Counts" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <article className="bg-white p-6 rounded-2xl border border-red-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">Weak (&lt;50%)</span>
            <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">
            {gapData?.summary?.weak_count || 0}
          </div>
          <p className="text-xs text-slate-600 mt-1">Critical priority remediation required</p>
        </article>

        <article className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Moderate (50–75%)</span>
            <AlertCircle className="w-5 h-5 text-amber-600" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">
            {gapData?.summary?.moderate_count || 0}
          </div>
          <p className="text-xs text-slate-600 mt-1">Needs targeted practice &amp; reinforcement</p>
        </article>

        <article className="bg-white p-6 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Strong (&gt;75%)</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">
            {gapData?.summary?.strong_count || 0}
          </div>
          <p className="text-xs text-slate-600 mt-1">Ready for advanced enrichment challenges</p>
        </article>

        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Unassessed</span>
            <HelpCircle className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">
            {gapData?.summary?.unassessed_count || 0}
          </div>
          <p className="text-xs text-slate-600 mt-1">Awaiting initial diagnostic evaluation</p>
        </article>
      </section>

      {/* Filter Bar */}
      <section aria-labelledby="gap-filter-heading" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" aria-hidden="true" />
          <h2 id="gap-filter-heading" className="text-sm font-bold text-slate-900">
            Module 3: Topic-Level Knowledge Gap Classification
          </h2>
        </div>

        <div role="group" aria-label="Filter topics by proficiency classification" className="flex flex-wrap items-center gap-2">
          {['All', 'Weak', 'Moderate', 'Strong', 'Unassessed'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              aria-pressed={filterLevel === lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterLevel === lvl
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </section>

      {/* Topic Gap Cards */}
      <section aria-label="Classified Topics List" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTopics.map((topic) => {
          const badgeStyle =
            topic.proficiency_level === 'Weak'
              ? 'bg-red-50 text-red-800 border-red-200'
              : topic.proficiency_level === 'Moderate'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : topic.proficiency_level === 'Strong'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-100 text-slate-700 border-slate-200';

          const barColor =
            topic.proficiency_level === 'Weak'
              ? 'bg-red-500'
              : topic.proficiency_level === 'Moderate'
              ? 'bg-amber-500'
              : topic.proficiency_level === 'Strong'
              ? 'bg-emerald-500'
              : 'bg-slate-300';

          const scoreValue = topic.attempts_count > 0 ? topic.average_score : 0;

          return (
            <article
              key={topic.topic_id}
              aria-labelledby={`topic-heading-${topic.topic_id}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Module {topic.order_index} • {topic.difficulty}
                    </span>
                    <h3 id={`topic-heading-${topic.topic_id}`} className="text-base font-bold text-slate-900 mt-0.5">
                      {topic.topic_name}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${badgeStyle}`}>
                    {topic.proficiency_level}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {topic.description}
                </p>

                {/* Mastery Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span id={`mastery-label-${topic.topic_id}`} className="text-slate-600 font-medium">
                      Mastery Score ({topic.attempts_count} attempt{topic.attempts_count === 1 ? '' : 's'})
                    </span>
                    <span className="font-bold text-slate-900">
                      {topic.attempts_count > 0 ? `${topic.average_score}%` : 'Not tested'}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-labelledby={`mastery-label-${topic.topic_id}`}
                    aria-valuenow={scoreValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(100, scoreValue)}%` }}
                    />
                  </div>
                </div>

                {/* Remediation Guidance Pill */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">AI Action Plan: </strong>
                    {topic.recommended_action}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/tutor', { state: { topicId: topic.topic_id } })}
                  aria-label={`Learn ${topic.topic_name} with AI Tutor`}
                  className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Learn with AI Tutor</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/quiz', { state: { topicId: topic.topic_id } })}
                  aria-label={`Take practice quiz for ${topic.topic_name}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Take Topic Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}