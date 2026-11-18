import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Award,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard() {
  const { activeSubjectId, user } = useOutletContext();
  const [analytics, setAnalytics] = useState(null);
  const [gaps, setGaps] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getAnalyticsDashboard(),
      api.getGapAnalysis(activeSubjectId),
      api.getRoadmap(activeSubjectId),
    ])
      .then(([analyticsData, gapData, roadmapData]) => {
        setAnalytics(analyticsData);
        setGaps(gapData);
        setRoadmap(roadmapData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSubjectId]);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="grid grid-cols-1 md:grid-cols-4 gap-5 animate-pulse">
        <span className="sr-only">Loading student dashboard metrics...</span>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200/70 p-6"></div>
        ))}
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const nextPendingTask = roadmap?.tasks?.find((t) => t.status !== 'completed');
  const progressPercent = roadmap?.progress_percentage || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <section
        aria-labelledby="welcome-heading"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white p-8 shadow-md"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-medium backdrop-blur-xs border border-white/10">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Personalized AI Learning Agent</span>
            </div>
            <h2 id="welcome-heading" className="text-2xl font-bold tracking-tight">
              Welcome back, {user?.name || 'Student'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Your learning roadmap dynamically adapts after every diagnostic assessment and quiz.
              {gaps?.summary?.weak_count > 0
                ? ` You currently have ${gaps.summary.weak_count} priority knowledge gap(s) identified for targeted remediation.`
                : ' Take an initial diagnostic assessment to benchmark your topic mastery.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/diagnostic')}
              aria-label="Start Initial Diagnostic Assessment"
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <Target className="w-4 h-4" aria-hidden="true" />
              <span>Take Diagnostic Test</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/roadmap')}
              aria-label="View Personalized Adaptive Roadmap"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all flex items-center gap-2"
            >
              <span>View Roadmap</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Average Score</span>
            <div aria-hidden="true" className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{summary.average_score || 0}%</div>
            <p className="text-xs text-slate-600 mt-1">
              Across {summary.total_assessments || 0} completed assessments
            </p>
          </div>
        </article>

        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Priority Gaps</span>
            <div aria-hidden="true" className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{gaps?.summary?.weak_count || 0}</div>
            <p className="text-xs text-slate-600 mt-1">
              {gaps?.summary?.moderate_count || 0} moderate topics need practice
            </p>
          </div>
        </article>

        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Strong Topics</span>
            <div aria-hidden="true" className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{gaps?.summary?.strong_count || 0}</div>
            <p className="text-xs text-slate-600 mt-1">
              Out of {gaps?.summary?.total_topics || 0} curriculum topics
            </p>
          </div>
        </article>

        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Roadmap Progress</span>
            <div aria-hidden="true" className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{progressPercent}%</div>
            <div
              role="progressbar"
              aria-label="Subject roadmap completion percentage"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden"
            >
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </article>
      </section>

      {/* Main Content Split: Next Recommended Action & Knowledge Gap Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Best Action Card */}
        <section aria-labelledby="up-next-heading" className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                  Up Next in Your Adaptive Path
                </span>
                <h3 id="up-next-heading" className="text-base font-bold text-slate-900 mt-2">
                  {nextPendingTask ? nextPendingTask.title : 'All current tasks completed!'}
                </h3>
              </div>
              {nextPendingTask && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {nextPendingTask.estimated_minutes} mins
                </span>
              )}
            </div>

            {nextPendingTask ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    nextPendingTask.priority === 'High'
                      ? 'bg-red-100 text-red-800'
                      : nextPendingTask.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {nextPendingTask.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    Topic: {nextPendingTask.topic_name}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {nextPendingTask.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Take a quiz or diagnostic test to generate fresh adaptive learning tasks.
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/tutor')}
                className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Study with AI Tutor</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Practice Quiz
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/roadmap')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Open Full Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Adaptive AI Recommendations Feed */}
        <section aria-labelledby="ai-insights-heading" className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 id="ai-insights-heading" className="text-sm font-bold text-slate-900">Adaptive Agent Insights</h3>
              <Sparkles className="w-4 h-4 text-brand-500" aria-hidden="true" />
            </div>

            <div className="space-y-3">
              {analytics?.recent_recommendations?.length > 0 ? (
                analytics.recent_recommendations.slice(0, 3).map((rec) => (
                  <article
                    key={rec.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {rec.title}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        rec.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-brand-100 text-brand-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {rec.reason}
                    </p>
                  </article>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-600">
                    Complete your first assessment to unlock personalized AI insights.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/gaps')}
            className="mt-4 w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            View Complete Gap Matrix
          </button>
        </section>
      </div>

      {/* Topic Proficiency Snapshot Table */}
      <section aria-labelledby="proficiency-table-heading" className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 id="proficiency-table-heading" className="text-base font-bold text-slate-900">Topic Proficiency Matrix</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Real-time knowledge classification based on your latest diagnostic & quiz performance
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/gaps')}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Detailed Analysis →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-600 uppercase bg-slate-50/50">
                <th scope="col" className="py-3 px-6">Topic</th>
                <th scope="col" className="py-3 px-6">Difficulty</th>
                <th scope="col" className="py-3 px-6">Classification</th>
                <th scope="col" className="py-3 px-6">Latest Score</th>
                <th scope="col" className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {gaps?.topics?.map((t) => (
                <tr key={t.topic_id} className="hover:bg-slate-50/80 transition-colors">
                  <th scope="row" className="py-3.5 px-6 font-medium text-slate-900">
                    {t.topic_name}
                  </th>
                  <td className="py-3.5 px-6 text-slate-600">{t.difficulty}</td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      t.proficiency_level === 'Strong'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : t.proficiency_level === 'Moderate'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : t.proficiency_level === 'Weak'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t.proficiency_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-700">
                    {t.attempts_count > 0 ? `${t.latest_score}%` : '—'}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => navigate('/quiz', { state: { topicId: t.topic_id } })}
                      aria-label={`${t.attempts_count > 0 ? 'Re-test' : 'Assess'} ${t.topic_name}`}
                      className="text-brand-600 hover:text-brand-800 font-semibold"
                    >
                      {t.attempts_count > 0 ? 'Re-test' : 'Assess'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}