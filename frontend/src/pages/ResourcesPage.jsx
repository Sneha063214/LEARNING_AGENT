import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Bookmark, 
  ExternalLink, 
  Video, 
  FileText, 
  BookOpen, 
  Sparkles, 
  Search, 
  Layers,
  Youtube,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const RESOURCE_ICONS = {
  video: Youtube,
  documentation: FileText,
  tutorial: BookOpen,
  article: Bookmark,
};

export default function ResourcesPage() {
  const { activeSubjectId } = useOutletContext();
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [resourcesData, setResourcesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    if (activeSubjectId) {
      api.getSubjectTopics(activeSubjectId)
        .then((t) => {
          setTopics(t);
          if (t.length > 0) setSelectedTopicId(t[0].id);
        })
        .catch(console.error);
    }
  }, [activeSubjectId]);

  useEffect(() => {
    if (selectedTopicId) {
      setLoading(true);
      api.getResources(Number(selectedTopicId))
        .then(setResourcesData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedTopicId]);

  const rawResources = resourcesData?.resources || [];
  const filtered = activeType === 'all'
    ? rawResources
    : rawResources.filter((r) => r.resource_type === activeType);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200/50">
            <Bookmark className="w-3.5 h-3.5 text-brand-600" />
            Module 4: External Learning Resources (SerpAPI & AI Curated)
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Targeted Educational Resources
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curated documentation, interactive tutorials, and video lectures tailored to eliminate your specific knowledge gaps.
          </p>
        </div>

        {topics.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Topic:</span>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Target Focus Notice */}
      {resourcesData?.weak_reason && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 font-medium">
            {resourcesData.weak_reason}
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['all', 'documentation', 'tutorial', 'video', 'article'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              activeType === t
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t === 'all' ? 'All Types' : t}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-72 text-slate-400 text-sm">
          <Sparkles className="w-5 h-5 animate-spin text-brand-500 mr-2" />
          Finding learning resources via SerpAPI...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-600">No resources found matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item, idx) => {
            const IconComponent = RESOURCE_ICONS[item.resource_type] || BookOpen;

            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      <IconComponent className="w-3.5 h-3.5" />
                      {item.resource_type}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-brand-600 transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-600 transition-colors"
                    >
                      {item.title}
                    </a>
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {item.snippet}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <div className="flex items-start gap-1.5 text-xs text-brand-800 bg-brand-50/70 p-2.5 rounded-lg border border-brand-100">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      <strong>Relevance:</strong> {item.relevance_reason}
                    </span>
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
