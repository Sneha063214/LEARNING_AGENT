import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // Weak, Moderate, Strong

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72 text-slate-400 text-sm">
        <Sparkles className="w-5 h-5 animate-spin text-brand-500 mr-2" />
        Aggregating performance analytics...
      </div>
    );
  }

  const summary = data?.summary || {};
  const timeline = data?.score_timeline || [];
  const subjectStats = data?.subject_stats || [];

  const pieData = [
    { name: 'Weak Gaps (<60%)', value: summary.weak_gaps || 0 },
    { name: 'Moderate (60-79%)', value: summary.moderate_gaps || 0 },
    { name: 'Mastered (≥80%)', value: summary.strong_mastery || 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200/50">
          <BarChart3 className="w-3.5 h-3.5 text-brand-600" />
          Module 7: Student Progress Tracking
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Performance Analytics & Mastery Trajectory
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Historical assessment tracking, accuracy progressions, and topic mastery distribution.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Total Assessments</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.total_assessments || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Completed tests & quizzes</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Average Accuracy</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.average_score || 0}%</p>
          <p className="text-[11px] text-slate-500 mt-1">Mean performance across subjects</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Roadmap Completion</span>
          <p className="text-2xl font-bold text-brand-600 mt-1">{summary.overall_progress || 0}%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.completed_tasks || 0} / {summary.total_tasks || 0} tasks done
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Mastery Ratio</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {summary.strong_mastery || 0} / {((summary.weak_gaps || 0) + (summary.moderate_gaps || 0) + (summary.strong_mastery || 0)) || 1}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Concepts at &ge;80% mastery</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Scores Over Time */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Quiz Scores Over Time</h3>
              <p className="text-xs text-slate-400">Chronological trajectory of assessment attempts</p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>

          {timeline.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No score records yet. Complete a quiz to see your trendline.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="attempt" tick={{ fontSize: 11 }} label={{ value: 'Attempt #', position: 'insideBottom', offset: -5 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val, name, item) => [`${val}%`, item.payload.title]}
                  />
                  <Line type="monotone" dataKey="score" stroke="#0e87eb" strokeWidth={2.5} dot={{ r: 4, fill: '#0e87eb' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Subject-Wise Performance Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subject-Wise Performance</h3>
              <p className="text-xs text-slate-400">Mean diagnostic accuracy per domain</p>
            </div>
            <BarChart3 className="w-4 h-4 text-brand-600" />
          </div>

          {subjectStats.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No subject attempts registered yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectStats} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val) => [`${val}%`, 'Average Score']}
                  />
                  <Bar dataKey="average_score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Proficiency Distribution */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900">Knowledge Gap Distribution</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Rule-based breakdown of your assessed concepts across Weak (&lt;60%), Moderate (60-79%), and Strong (&ge;80%) mastery thresholds.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-medium text-slate-700">Critical Gaps (Weak)</span>
              </span>
              <span className="font-bold text-slate-900">{summary.weak_gaps || 0} concepts</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-medium text-slate-700">Needs Review (Moderate)</span>
              </span>
              <span className="font-bold text-slate-900">{summary.moderate_gaps || 0} concepts</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-700">Mastered (Strong)</span>
              </span>
              <span className="font-bold text-slate-900">{summary.strong_mastery || 0} concepts</span>
            </div>
          </div>
        </div>

        <div className="h-56 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
