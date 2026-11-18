import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Download, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  Bot,
  HelpCircle,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function RoadmapPage() {
  const { activeSubjectId } = useOutletContext();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingTaskId, setTogglingTaskId] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchRoadmap = () => {
    setLoading(true);
    api.getRoadmap(activeSubjectId)
      .then(setRoadmap)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoadmap();
  }, [activeSubjectId]);

  const handleToggleTask = async (taskId) => {
    setTogglingTaskId(taskId);
    try {
      const res = await api.toggleTask(taskId);
      if (res.roadmap) {
        setRoadmap(res.roadmap);
      }
    } catch (err) {
      alert(`Error toggling task: ${err.message}`);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await api.regenerateRoadmap(activeSubjectId);
      setRoadmap(res);
    } catch (err) {
      alert(`Error regenerating roadmap: ${err.message}`);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72 text-slate-400 text-sm">
        <Sparkles className="w-5 h-5 animate-spin text-brand-500 mr-2" />
        Generating personalized learning path...
      </div>
    );
  }

  const dailySchedule = roadmap?.daily_schedule || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200/50">
            <Map className="w-3.5 h-3.5 text-brand-600" />
            Module 4: Personalized Learning Path Generator
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {roadmap?.title || 'Adaptive Learning Pathway'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            {roadmap?.summary}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>Re-adapt</span>
          </button>

          {roadmap && (
            <a
              href={api.getDownloadPdfUrl(roadmap.id)}
              download
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          )}
        </div>
      </div>

      {/* Progress & Milestone Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Progress</span>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-extrabold text-slate-900">{roadmap?.progress_percentage || 0}%</p>
            <span className="text-xs text-slate-500">
              ({roadmap?.completed_tasks || 0} / {roadmap?.total_tasks || 0} completed)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${roadmap?.progress_percentage || 0}%` }}
            />
          </div>
        </div>

        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Estimated Time</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{roadmap?.total_estimated_hours || 0} hrs</p>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Recommended pace: ~60 mins / day
          </p>
        </div>

        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Adaptation Logic</span>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Prioritizes identified knowledge gaps first, arranges prerequisite chains topologically, and schedules daily milestones.
          </p>
        </div>
      </div>

      {/* Daily Schedule Task Timeline */}
      <div className="space-y-6">
        {dailySchedule.map((dayGroup) => (
          <div key={dayGroup.day} className="space-y-3">
            {/* Day Header */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                D{dayGroup.day}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Day {dayGroup.day} Learning Target</h3>
                <p className="text-[11px] text-slate-400">
                  {dayGroup.tasks.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0)} mins total allocated
                </p>
              </div>
            </div>

            {/* Tasks under this Day */}
            <div className="space-y-3 pl-4 border-l-2 border-slate-200 ml-4">
              {dayGroup.tasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const isHighPriority = task.priority === 'High';

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl bg-white border transition-all ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : isHighPriority
                        ? 'border-red-200/90 shadow-sm'
                        : 'border-slate-200/80 shadow-sm hover:shadow'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          disabled={togglingTaskId === task.id}
                          onClick={() => handleToggleTask(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors shrink-0"
                          title={isCompleted ? 'Mark pending' : 'Mark completed'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isHighPriority
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.priority} Priority
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {task.description}
                          </p>

                          <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.estimated_minutes} mins
                            </span>
                            <span>&bull;</span>
                            <span>{task.difficulty_level || 'Intermediate'}</span>
                            {task.completed_at && (
                              <>
                                <span>&bull;</span>
                                <span className="text-emerald-600 font-medium">
                                  Completed {String(task.completed_at).slice(0, 10)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to="/tutor"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Tutor</span>
                        </Link>
                        <Link
                          to="/quiz"
                          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Quiz</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
