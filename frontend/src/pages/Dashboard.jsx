import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Map, 
  Bot,
  Layers,
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard() {
  const { activeSubjectId, user } = useOutletContext();
  const [analytics, setAnalytics] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getDashboardAnalytics(),
      api.getRoadmap(activeSubjectId),
      api.getAssessmentHistory(),
    ])
      .then(([analyticsData, roadmapData, historyData]) => {
        setAnalytics(analyticsData);
        setRoadmap(roadmapData);
        setHistory(historyData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSubjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72 text-slate-400 text-sm">
        <Sparkles className="w-5 h-5 animate-spin text-brand-500 mr-2" />
        Loading your adaptive learning environment...
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const activeRec = analytics?.recent_recommendations?.[0];
  const nextTask = roadmap?.tasks?.find((t) => t.status !== 'completed');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-medium mb-3 backdrop-blur-sm border border-white/10">
            <Sparkles className="w-3 h-3 text-brand-300" />
            AI-Powered Personalized Learning
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Currently analyzing learning path for <strong className="text-white font-semibold">{roadmap?.subject_name || 'Selected Subject'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/diagnostic"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            <span>Take Diagnostic</span>
          </Link>
          {roadmap && (
            <a
              href={api.getDownloadPdfUrl(roadmap.id)}
              download
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all border border-white/10 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
          )}
        </div>
      </div>

      {/* Adaptive Recommendation Alert (Intelligence Banner) */}
      {activeRec && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-800">
                  Adaptive Agent Insight
                </span>
                <span className="text-[11px] text-amber-600 font-medium">({activeRec.recommendation_type})</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-900 mt-0.5">{activeRec.title}</h4>
              <p className="text-xs text-slate-600 mt-1">{activeRec.reason}</p>
              <p className="text-xs font-medium text-amber-900 mt-1.5 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                Action: {activeRec.suggested_action}
              </p>
            </div>
          </div>
          <Link
            to="/tutor"
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-sm"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Roadmap Progress</span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Map className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{roadmap?.progress_percentage || 0}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${roadmap?.progress_percentage || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {roadmap?.completed_tasks || 0} of {roadmap?.total_tasks || 0} tasks completed
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Avg Diagnostic Score</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.average_score || 0}%</p>
          <p className="text-[11px] text-slate-500 mt-3">
            Across {summary.total_assessments || 0} completed diagnostic attempts
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Knowledge Gaps</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{summary.weak_gaps || 0}</p>
          <p className="text-[11px] text-slate-500 mt-3">
            Concepts needing targeted reinforcement (&lt;60%)
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Mastered Topics</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{summary.strong_mastery || 0}</p>
          <p className="text-[11px] text-slate-500 mt-3">
            Concepts with demonstrated mastery (&gt;80%)
          </p>
        </div>
      </div>

      {/* Learning Path & Next Target Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Task Focus Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Next Up on Roadmap</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand-50 text-brand-700 border border-brand-100">
                Day {nextTask?.target_day || 1}
              </span>
            </div>

            {nextTask ? (
              <>
                <h3 className="text-base font-bold text-slate-900">{nextTask.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{nextTask.description}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {nextTask.estimated_minutes} mins
                  </span>
                  <span className={`font-semibold ${nextTask.priority === 'High' ? 'text-red-600' : 'text-slate-600'}`}>
                    Priority: {nextTask.priority}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">All current roadmap tasks completed!</p>
                <p className="text-[11px] text-slate-400 mt-1">Take an advanced quiz to test for higher mastery.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/roadmap"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View Full Roadmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/tutor"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Study with AI
            </Link>
          </div>
        </div>

        {/* Recent Assessment Attempts Table */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Assessments & Quizzes</h3>
              <p className="text-xs text-slate-500">Historical performance records and diagnostic ratings</p>
            </div>
            <Link
              to="/quiz"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Take New Quiz</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600">No assessments taken yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Take an initial diagnostic assessment to identify your knowledge gaps.
              </p>
              <Link
                to="/diagnostic"
                className="mt-3 inline-block px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500"
              >
                Start Diagnostic
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Assessment / Topic</th>
                    <th className="pb-3 font-semibold">Subject</th>
                    <th className="pb-3 font-semibold text-center">Score</th>
                    <th className="pb-3 font-semibold text-center">Proficiency</th>
                    <th className="pb-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-900">{item.title}</td>
                      <td className="py-3 text-slate-500">{item.subject_name}</td>
                      <td className="py-3 text-center font-bold text-slate-900">{item.score_percentage}%</td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.knowledge_gap_level === 'Weak'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : item.knowledge_gap_level === 'Moderate'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.knowledge_gap_level}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400">{String(item.completed_at).slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
