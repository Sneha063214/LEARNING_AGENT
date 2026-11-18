import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Award, CheckCircle2, Target } from 'lucide-react';
import { api } from '../services/api';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="p-8 text-center text-xs text-slate-600">
        Loading visual performance analytics...
      </div>
    );
  }

  const summary = data?.summary || {};
  const timeline = data?.score_timeline || [];
  const subjectStats = data?.subject_stats || [];

  const pieData = [
    { name: 'Weak (<50%)', value: summary.weak_gaps || 0 },
    { name: 'Moderate (50-75%)', value: summary.moderate_gaps || 0 },
    { name: 'Strong (>75%)', value: summary.strong_mastery || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Module 7: Progress Tracking &amp; Performance Analytics</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Comprehensive Learning Analytics
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Track your score progression, subject mastery benchmarks, and roadmap completion velocity over time.
        </p>
      </header>

      {/* Top Metrics */}
      <section aria-label="Overall Performance Summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>TOTAL ASSESSMENTS</span>
            <Target className="w-4 h-4 text-brand-600" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">{summary.total_assessments || 0}</div>
          <p className="text-xs text-slate-600 mt-1">Diagnostic &amp; topic quizzes completed</p>
        </article>

        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>AVERAGE ACCURACY</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">{summary.average_score || 0}%</div>
          <p className="text-xs text-slate-600 mt-1">Mean score across all attempts</p>
        </article>

        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>TASKS COMPLETED</span>
            <CheckCircle2 className="w-4 h-4 text-brand-600" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">
            {summary.completed_tasks || 0} / {summary.total_tasks || 0}
          </div>
          <p className="text-xs text-slate-600 mt-1">{summary.overall_progress || 0}% overall path completion</p>
        </article>

        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>MASTERED TOPICS</span>
            <Award className="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">{summary.strong_mastery || 0}</div>
          <p className="text-xs text-slate-600 mt-1">Topics with &gt;75% verified score</p>
        </article>
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Score Timeline Chart */}
        <section
          aria-labelledby="score-progression-heading"
          className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
        >
          <div>
            <h3 id="score-progression-heading" className="text-sm font-bold text-slate-900">
              Score Progression Timeline
            </h3>
            <p className="text-xs text-slate-600">
              Chronological accuracy percentage across your diagnostic tests and practice quizzes
            </p>
          </div>

          {timeline.length > 0 ? (
            <div className="h-72 w-full" role="img" aria-label="Line chart showing assessment score progression over time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="title" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#0e87eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#0e87eb' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-600 bg-slate-50 rounded-xl">
              Complete assessments to visualize your score trend line.
            </div>
          )}
        </section>

        {/* Knowledge Gap Distribution Pie Chart */}
        <section
          aria-labelledby="proficiency-dist-heading"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
        >
          <div>
            <h3 id="proficiency-dist-heading" className="text-sm font-bold text-slate-900">
              Proficiency Distribution
            </h3>
            <p className="text-xs text-slate-600">
              Ratio of Weak, Moderate, and Strong topics
            </p>
          </div>

          {(summary.weak_gaps + summary.moderate_gaps + summary.strong_mastery) > 0 ? (
            <div className="h-72 w-full" role="img" aria-label="Donut chart showing distribution of weak, moderate, and strong topics">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-600 bg-slate-50 rounded-xl">
              No evaluated topics yet.
            </div>
          )}
        </section>
      </div>

      {/* Subject-Wise Performance Bar Chart */}
      <section aria-labelledby="subject-comparison-heading" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div>
          <h3 id="subject-comparison-heading" className="text-sm font-bold text-slate-900">
            Subject-Wise Performance Comparison
          </h3>
          <p className="text-xs text-slate-600">
            Average score and highest score achieved across each academic subject
          </p>
        </div>

        {subjectStats.length > 0 ? (
          <div className="h-72 w-full" role="img" aria-label="Bar chart comparing average and highest scores across subjects">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="average_score" name="Average Score (%)" fill="#0e87eb" radius={[8, 8, 0, 0]} />
                <Bar dataKey="highest_score" name="Highest Score (%)" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-slate-600 bg-slate-50 rounded-xl">
            Take assessments across subjects to compare domain mastery.
          </div>
        )}
      </section>
    </div>
  );
}