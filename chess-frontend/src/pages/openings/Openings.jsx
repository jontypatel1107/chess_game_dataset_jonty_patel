import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Flame, Shield, Swords, GraduationCap, Crosshair, TrendingUp, ChevronRight, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import api from '../../services/api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

const CATEGORIES = [
  { value: 'popular', label: 'Popular', icon: TrendingUp },
  { value: 'aggressive', label: 'Aggressive', icon: Swords },
  { value: 'defensive', label: 'Defensive', icon: Shield },
  { value: 'gambits', label: 'Gambits', icon: Flame },
  { value: 'beginner-friendly', label: 'Beginner', icon: GraduationCap },
  { value: 'white-advantage', label: 'White Advantage', icon: Crosshair },
  { value: 'black-advantage', label: 'Black Advantage', icon: Crosshair },
];

const WinRateBar = ({ label, value, color }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="w-16 text-gray-500 dark:text-gray-400">{label}</span>
    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
    <span className="w-8 text-right font-semibold text-gray-700 dark:text-gray-300">{value}%</span>
  </div>
);

const Openings = () => {
  const [openings, setOpenings] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOpenings = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/openings/win-rates';
      if (searchQuery.trim()) {
        endpoint = `/openings/search?q=${encodeURIComponent(searchQuery.trim())}`;
      } else if (category !== 'popular') {
        endpoint = `/openings/${category}`;
      }

      const [openingsRes, trendingRes] = await Promise.all([
        api.get(endpoint),
        api.get('/openings/trending'),
      ]);

      setOpenings(openingsRes.data.data || []);
      setTrending(trendingRes.data.data || []);
    } catch (error) {
      console.error("Openings fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => {
    fetchOpenings();
  }, [fetchOpenings]);

  useEffect(() => {
    setSearchQuery('');
  }, [category]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (category !== 'popular') setCategory('popular');
  };

  const complexityColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      case 'intermediate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const styleColor = (style) => {
    const colors = {
      aggressive: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
      defensive: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      positional: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
      balanced: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
      tactical: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400',
    };
    return colors[style] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Openings Explorer | Chess Analytics</title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Openings Explorer</h1>
        <p className="text-gray-500 dark:text-gray-400">Explore chess openings, their win rates, and popularity.</p>
      </div>

      {/* Trending Section */}
      {trending.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {trending.map((op, i) => (
            <Card key={op.eco || i} className="!p-0">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-500">#{i + 1}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{op.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">{op.eco}</span>
                  <span className="text-xs text-gray-500">{op.games} games</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Search & Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search openings by name or ECO code..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                category === cat.value
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <cat.icon size={14} />
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Openings Grid */}
      {loading ? (
        <Loader fullPage />
      ) : openings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {openings.map((op, i) => (
            <Card key={op.eco || i} className="!p-0 hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{op.name}</h3>
                      <span className="flex-shrink-0 text-[10px] font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">
                        {op.eco}
                      </span>
                    </div>
                    {op.family && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{op.family}</p>
                    )}
                  </div>
                  {op.popularity !== undefined && (
                    <div className="flex-shrink-0 ml-3 text-center">
                      <div className="text-lg font-black text-primary">{op.popularity}</div>
                      <div className="text-[10px] uppercase text-gray-400">Popularity</div>
                    </div>
                  )}
                  {op.games !== undefined && (
                    <div className="flex-shrink-0 ml-3 text-center">
                      <div className="text-lg font-black text-primary">{op.games > 999 ? `${(op.games / 1000).toFixed(1)}k` : op.games}</div>
                      <div className="text-[10px] uppercase text-gray-400">Games</div>
                    </div>
                  )}
                </div>

                {op.moves && (
                  <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">{op.moves}</code>
                  </div>
                )}

                {(op.whiteWinRate !== undefined) && (
                  <div className="space-y-1.5 mb-3">
                    <WinRateBar label="White" value={op.whiteWinRate} color="#4338ca" />
                    <WinRateBar label="Black" value={op.blackWinRate} color="#db2777" />
                    <WinRateBar label="Draw" value={op.drawRate} color="#10b981" />
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {op.style && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styleColor(op.style)}`}>
                      {op.style}
                    </span>
                  )}
                  {op.complexity && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${complexityColor(op.complexity)}`}>
                      {op.complexity}
                    </span>
                  )}
                  {op.tags?.filter(t => !['popular', 'white-advantage', 'black-advantage'].includes(t)).map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No openings found for this category.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Openings;
