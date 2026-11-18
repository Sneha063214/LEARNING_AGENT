import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Bookmark, 
  Search, 
  ExternalLink, 
  Video, 
  FileText, 
  Code2, 
  Sparkles,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

export default function ResourcesPage() {
  const { activeSubjectId } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getCuratedResources(activeSubjectId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSubjectId]);

  const handleLiveSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await api.searchResources(searchQuery);
      setLiveResults(res);
    } catch (err) {
      alert(`Search failed: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header & Live Web Search Bar */}
      <section aria-labelledby="resources-heading" className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-1">
            <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Module 8: Curated Study Material &amp; Live Web Discovery</span>
          </div>
          <h2 id="resources-heading" className="text-xl font-bold text-slate-900">
            Targeted Learning Resources &amp; Tutorials
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl">
            Explore curated documentation, interactive coding exercises, and video lectures automatically
            matched to your subject topics—or search live educational resources across the web.
          </p>
        </div>

        <form onSubmit={handleLiveSearch} role="search" aria-label="Search live web tutorials and documentation" className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <label htmlFor="resource-search-input" className="sr-only">
              Search any concept, tutorial, or documentation topic
            </label>
            <input
              id="resource-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any concept (e.g. 'Python decorators', 'Binary Search Tree traversal')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{searching ? 'Searching...' : 'Discover Resources'}</span>
          </button>
        </form>
      </section>

      {/* Live Web Search Results (if triggered) */}
      {liveResults && (
        <section aria-labelledby="live-results-heading" aria-live="polite" className="bg-brand-50/50 rounded-2xl border border-brand-200/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" aria-hidden="true" />
              <h3 id="live-results-heading" className="text-sm font-bold text-slate-900">
                Web Discovery Results for "{searchQuery}"
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setLiveResults(null)}
              aria-label="Clear search results"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Clear Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveResults.results?.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.title} (${item.type}, opens in a new tab)`}
                className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-brand-400 transition-all flex flex-col justify-between gap-2 group shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                      {item.type}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600" aria-hidden="true" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {item.snippet}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Curated Curriculum Resources By Topic */}
      {loading ? (
        <div role="status" aria-live="polite" className="p-12 text-center text-xs text-slate-600">
          Loading curated resources...
        </div>
      ) : (
        <div className="space-y-6">
          {data?.topics?.map((topicGroup) => (
            <section
              key={topicGroup.topic_id}
              aria-labelledby={`resource-topic-${topicGroup.topic_id}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 id={`resource-topic-${topicGroup.topic_id}`} className="text-base font-bold text-slate-900">
                      {topicGroup.topic_name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      topicGroup.proficiency_level === 'Weak'
                        ? 'bg-red-100 text-red-800'
                        : topicGroup.proficiency_level === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : topicGroup.proficiency_level === 'Strong'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {topicGroup.proficiency_level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{topicGroup.description}</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg self-start">
                  {topicGroup.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topicGroup.resources?.map((res, rIdx) => {
                  const Icon =
                    res.type === 'video' ? Video : res.type === 'practice' ? Code2 : FileText;
                  return (
                    <a
                      key={rIdx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${res.title} (${res.type}, opens in a new tab)`}
                      className="p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-brand-400 transition-all flex flex-col justify-between gap-3 group shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            <Icon className="w-3 h-3" aria-hidden="true" />
                            {res.type}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600" aria-hidden="true" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 leading-snug">
                          {res.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {res.snippet}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}