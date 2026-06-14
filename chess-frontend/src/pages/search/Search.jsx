import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, BookOpen, Gamepad2, Code, Move,
  TrendingUp, Clock, Filter, X, ChevronRight,
  Flame, Zap, Swords, Shield, Crosshair
} from 'lucide-react';

import api from '../../services/api';
import searchService from '../../services/searchService';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const TABS = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'players', label: 'Players', icon: Users },
  { id: 'openings', label: 'Openings', icon: BookOpen },
  { id: 'matches', label: 'Matches', icon: Gamepad2 },
  { id: 'eco', label: 'ECO', icon: Code },
  { id: 'moves', label: 'Moves', icon: Move },
];

const AdvancedFilters = ({ filters, onChange, onSearch }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Result</label>
      <select value={filters.result} onChange={(e) => onChange('result', e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20">
        <option value="">Any</option>
        <option value="1-0">White Wins</option>
        <option value="0-1">Black Wins</option>
        <option value="1/2-1/2">Draw</option>
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Time Control</label>
      <select value={filters.timeControl} onChange={(e) => onChange('timeControl', e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20">
        <option value="">Any</option>
        <option value="bullet">Bullet</option>
        <option value="blitz">Blitz</option>
        <option value="rapid">Rapid</option>
        <option value="classical">Classical</option>
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">End Reason</label>
      <select value={filters.endReason} onChange={(e) => onChange('endReason', e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20">
        <option value="">Any</option>
        <option value="checkmate">Checkmate</option>
        <option value="resignation">Resignation</option>
        <option value="timeout">Timeout</option>
        <option value="draw">Draw</option>
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Rated</label>
      <select value={filters.rated} onChange={(e) => onChange('rated', e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20">
        <option value="">Any</option>
        <option value="true">Rated</option>
        <option value="false">Casual</option>
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Min Rating</label>
      <input type="number" placeholder="e.g. 2000" value={filters.rating}
        onChange={(e) => onChange('rating', e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </div>
    <div className="flex items-end">
      <Button size="sm" onClick={onSearch} icon={Search} className="w-full">Search</Button>
    </div>
  </div>
);

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({ players: [], openings: [], matches: [], eco: [], moves: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    result: '', timeControl: '', endReason: '', rated: '', opening: '', eco: '', rating: '',
  });
  const [advancedResults, setAdvancedResults] = useState([]);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestRef = useRef(null);

  useEffect(() => {
    searchService.getRecentSearches().then(r => setRecentSearches(r.data || [])).catch(() => {});
    searchService.getPopularSearches().then(r => setPopularSearches(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target) && e.target !== inputRef.current) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAutocomplete = useCallback(async (q) => {
    if (q.trim().length < 2) { setSuggestions([]); return; }
    try {
      const res = await searchService.autocomplete(q);
      setSuggestions(res.data || []);
      setShowSuggestions(true);
    } catch { setSuggestions([]); }
  }, []);

  let debounceTimer;
  const onQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => handleAutocomplete(val), 200);
  };

  const executeSearch = useCallback(async (q, tab) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const searches = [];
      if (tab === 'all' || tab === 'players') searches.push(searchService.searchPlayers(q).then(r => ({ key: 'players', data: r.data || [] })));
      if (tab === 'all' || tab === 'openings') searches.push(searchService.searchOpenings(q).then(r => ({ key: 'openings', data: r.data || [] })));
      if (tab === 'all' || tab === 'matches') searches.push(searchService.searchMatches(q).then(r => ({ key: 'matches', data: r.data || [] })));
      if (tab === 'all' || tab === 'eco') searches.push(searchService.searchEco(q).then(r => ({ key: 'eco', data: r.data || [] })));
      if (tab === 'all' || tab === 'moves') searches.push(searchService.searchMoves(q).then(r => ({ key: 'moves', data: r.data || [] })));

      const res = await Promise.all(searches);
      const merged = { players: [], openings: [], matches: [], eco: [], moves: [] };
      res.forEach(r => { merged[r.key] = r.data; });
      setResults(merged);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    executeSearch(query, activeTab);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    executeSearch(suggestion, activeTab);
  };

  const handleAdvancedSearch = async () => {
    setAdvancedLoading(true);
    try {
      const params = {};
      if (advancedFilters.result) params.result = advancedFilters.result;
      if (advancedFilters.timeControl) params.timeControl = advancedFilters.timeControl;
      if (advancedFilters.endReason) params.endReason = advancedFilters.endReason;
      if (advancedFilters.rated) params.rated = advancedFilters.rated;
      const res = await searchService.advancedSearch(params);
      setAdvancedResults(res.data || []);
    } catch (err) {
      console.error("Advanced search error", err);
    } finally {
      setAdvancedLoading(false);
    }
  };

  const handlePopularClick = (term) => {
    setQuery(term);
    executeSearch(term, activeTab);
  };

  const hasResults = results.players.length > 0 || results.openings.length > 0 || results.matches.length > 0 || results.eco.length > 0 || results.moves.length > 0;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Search | Chess Analytics</title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Search</h1>
        <p className="text-gray-500 dark:text-gray-400">Search players, openings, matches, ECO codes, and move sequences.</p>
      </div>

      <Card>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for players, openings, ECO codes, or move sequences..."
              value={query}
              onChange={onQueryChange}
              onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoComplete="off"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setResults({ players: [], openings: [], matches: [], eco: [], moves: [] }); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestRef} className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button key={i} type="button" onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showAdvanced
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}>
            <Filter size={14} /> Advanced
          </button>
        </div>
      </Card>

      {showAdvanced && (
        <Card title="Advanced Search">
          <AdvancedFilters filters={advancedFilters}
            onChange={(key, val) => setAdvancedFilters({ ...advancedFilters, [key]: val })}
            onSearch={handleAdvancedSearch} />
          {advancedLoading && <Loader />}
          {advancedResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {advancedResults.map((game) => (
                <div key={game._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" />
                      <div className="w-7 h-7 rounded-full bg-pink-500 border-2 border-white dark:border-gray-900" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {game.whitePlayer?.username || 'White'} vs {game.blackPlayer?.username || 'Black'}
                      </p>
                      <p className="text-xs text-gray-500">{game.timeControl} &bull; {game.result}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{game.endReason}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {popularSearches.length > 0 && !query && (
        <Card title="Popular Searches" subtitle="Trending search terms">
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term, i) => (
              <button key={i} onClick={() => handlePopularClick(term)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Flame size={14} className="text-orange-500" /> {term}
              </button>
            ))}
          </div>
        </Card>
      )}

      {recentSearches.length > 0 && !query && (
        <Card title="Recent Searches">
          <div className="space-y-2">
            {recentSearches.slice(0, 8).map((item, i) => (
              <button key={i} onClick={() => { setQuery(item.q); executeSearch(item.q, activeTab); }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Clock size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.q}</span>
                <span className="text-xs text-gray-400 ml-auto capitalize">{item.type}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {loading ? (
        <Loader fullPage />
      ) : hasResults ? (
        <div className="space-y-6">
          {results.players.length > 0 && (activeTab === 'all' || activeTab === 'players') && (
            <Card title="Players" subtitle={`${results.players.length} found`}
              footer={results.players.length > 5 ? <span className="text-xs text-gray-400">Showing top 5</span> : null}>
              <div className="space-y-3">
                {(results.players.slice ? results.players.slice(0, 5) : results.players).map((p) => (
                  <div key={p._id} onClick={() => navigate(`/players/${p.username}`)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                        {(p.username || '?')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.username}</p>
                        <p className="text-xs text-gray-500">{p.country || 'Unknown'} &bull; {p.gamesPlayed || 0} games</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{p.rating || '?'}</p>
                      <p className="text-xs text-gray-400">Rating</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.openings.length > 0 && (activeTab === 'all' || activeTab === 'openings') && (
            <Card title="Openings" subtitle={`${results.openings.length} found`}
              footer={results.openings.length > 8 ? <span className="text-xs text-gray-400">Showing top 8</span> : null}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(results.openings.slice ? results.openings.slice(0, 8) : results.openings).map((op, i) => (
                  <div key={op.eco || i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{op.name}</p>
                      <p className="text-xs text-gray-500">
                        {op.eco && <span className="font-mono">{op.eco}</span>}
                        {op.games !== undefined && <span> &bull; {op.games} games</span>}
                      </p>
                    </div>
                    {op.games !== undefined && (
                      <span className="text-xs font-bold text-primary">{op.games > 999 ? `${(op.games / 1000).toFixed(1)}k` : op.games}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.matches.length > 0 && (activeTab === 'all' || activeTab === 'matches') && (
            <Card title="Matches" subtitle={`${results.matches.length} found`}>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(results.matches.slice ? results.matches.slice(0, 15) : results.matches).map((game) => (
                  <div key={game._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" />
                        <div className="w-7 h-7 rounded-full bg-pink-500 border-2 border-white dark:border-gray-900" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {game.whitePlayer?.username || 'White'} vs {game.blackPlayer?.username || 'Black'}
                        </p>
                        <p className="text-xs text-gray-500">{game.timeControl || '?'} &bull; {game.result || '?'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{game.endReason || '-'}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.eco.length > 0 && (activeTab === 'all' || activeTab === 'eco') && (
            <Card title="ECO Codes" subtitle={`${results.eco.length} found`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(results.eco.slice ? results.eco.slice(0, 12) : results.eco).map((op, i) => (
                  <div key={op.eco || i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{op.eco}</span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 truncate">{op.name}</p>
                    <p className="text-xs text-gray-500">{op.games} games</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.moves.length > 0 && (activeTab === 'all' || activeTab === 'moves') && (
            <Card title="Move Sequences" subtitle={`${results.moves.length} matches found`}>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(results.moves.slice ? results.moves.slice(0, 10) : results.moves).map((game) => (
                  <div key={game._id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {game.whitePlayer?.username || 'White'} vs {game.blackPlayer?.username || 'Black'}
                      </p>
                      <span className="text-xs font-bold text-gray-500">{game.result}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono truncate">{game.moveText?.slice(0, 100) || 'No moves available'}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : query && !loading ? (
        <Card>
          <div className="text-center py-12">
            <Search size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No results found for "{query}".</p>
            <p className="text-xs text-gray-400 mt-1">Try different keywords or use Advanced Search.</p>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default SearchPage;
