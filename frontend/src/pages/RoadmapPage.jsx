import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Bot, 
  HelpCircle, 
  Bookmark,
  Download
} from 'lucide-react';
import { api } from '../services/api';

export default function RoadmapPage() {
  const { activeSubjectId } = useOutletContext();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [filterPriority, setFilterPriority] = useState('All');
  const navigate = useNavigate();

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

  const handleToggleTask = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await api.updateRoadmapTask(task.id, { status: nextStatus });
      setRoadmap(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await api.regenerateRoadmap({ subject_id: activeSubjectId });
      setRoadmap(res.roadmap);
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="p-8 text-center text-xs text-slate-600">
        Loading your personalized adaptive roadmap...
      </div>
    );
  }

  const tasks = roadmap?.tasks || [];
  const filteredTasks = filterPriority === 'All'
    ? tasks
    : tasks.filter((t) => t.priority === filterPriority);
  const progressPercent = roadmap?.progress_percentage || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <section aria-labelledby="roadmap-heading" className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
              <span>Module 4: Personalized Learning Path Generator</span>
            </div>
            <h2 id="roadmap-heading" className="text-xl font-bold text-slate-900">{roadmap?.title}</h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {roadmap?.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start shrink-0">
            {roadmap?.id && (
              <a
                href={api.getDownloadPdfUrl(roadmap.id)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download personalized learning roadmap as PDF report"
                className="px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs flex items-center gap-2 border border-brand-200 transition-all"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Export PDF</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              aria-label="Re-calibrate and regenerate adaptive learning roadmap"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{regenerating ? 'Re-calibrating...' : 'Re-Calibrate Path'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span id="roadmap-progress-label" className="font-semibold text-slate-700">
              Overall Completion ({roadmap?.completed_tasks || 0} of {roadmap?.total_tasks || 0} milestones)
            </span>
            <span className="font-bold text-brand-700">{progressPercent}%</span>
          </div>
          <div
            role="progressbar"
            aria-labelledby="roadmap-progress-label"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <div role="group" aria-label="Filter roadmap tasks by priority" className="flex items-center gap-2">
            {['All', 'High', 'Medium', 'Low'].map((prio) => (
              <button
                key={prio}
                type="button"
                aria-pressed={filterPriority === prio}
                onClick={() => setFilterPriority(prio)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterPriority === prio
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {prio === 'All' ? 'All Milestones' : `${prio} Priority`}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
            <span>Click the circle icon on any task to mark it complete</span>
          </div>
        </div>
      </section>

      {/* Step-by-Step Timeline List */}
      <section aria-label="Learning Milestones List" className="space-y-3">
        {filteredTasks.map((task) => {
          const isCompleted = task.status === 'completed';
          return (
            <article
              key={task.id}
              className={`bg-white rounded-2xl border p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isCompleted
                  ? 'border-emerald-200/70 bg-emerald-50/20 opacity-85'
                  : task.priority === 'High'
                  ? 'border-red-200/80 shadow-2xs'
                  : 'border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task)}
                  aria-pressed={isCompleted}
                  aria-label={`Mark milestone "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
                  className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Circle className="w-6 h-6" aria-hidden="true" />
                  )}
                </button>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      STEP {task.sequence_order}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      task.priority === 'High'
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {task.topic_name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {task.estimated_minutes}m
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold ${
                    isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}>
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>

              {/* Action Shortcuts */}
              <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 pl-10 sm:pl-0">
                {task.task_type === 'concept_review' && (
                  <button
                    type="button"
                    onClick={() => navigate('/tutor')}
                    aria-label={`Ask AI Tutor about ${task.topic_name}`}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>AI Tutor</span>
                  </button>
                )}
                {task.task_type === 'practice_quiz' && (
                  <button
                    type="button"
                    onClick={() => navigate('/quiz', { state: { topicId: task.topic_id } })}
                    aria-label={`Take practice quiz for ${task.topic_name}`}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Take Quiz</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/resources')}
                  aria-label={`View study resources for ${task.topic_name}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Study Material</span>
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}