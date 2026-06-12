import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, TrendingUp, Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import api from '../../services/api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';

const CATEGORIES = [
  { value: 'overall', label: 'Overall' },
  { value: 'blitz', label: 'Blitz' },
  { value: 'rapid', label: 'Rapid' },
  { value: 'classical', label: 'Classical' },
  { value: 'bullet', label: 'Bullet' },
];

const COLORS = ['#fbbf24', '#9ca3af', '#cd7f32', '#4338ca', '#db2777'];

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [ratingDist, setRatingDist] = useState([]);
  const [topByTc, setTopByTc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('overall');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchLeaderboard = useCallback(async () => {
    try {
      const params = { page, limit, category };
      if (country.trim()) params.country = country.trim();

      const [lbRes, distRes, tcRes] = await Promise.all([
        api.get('/leaderboard', { params }),
        api.get('/leaderboard/rating-distribution'),
        api.get('/leaderboard/top-by-time-control'),
      ]);

      setLeaderboard(lbRes.data.data);
      setPagination(lbRes.data.pagination);
      setRatingDist(distRes.data.data);
      setTopByTc(tcRes.data.data);
    } catch (error) {
      console.error("Leaderboard fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [page, category, country]);

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (loading) return <Loader fullPage />;

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Leaderboard | Chess Analytics</title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Top ranked players across all categories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {topByTc.map((item, i) => (
          <Card
            key={item.category}
            className="!p-0 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/players/${item.topPlayerName}`)}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {item.category}
                </span>
                <div className={`p-2 rounded-lg ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
                  <Medal size={18} />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {item.topPlayerName}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Rating: <strong className="text-gray-900 dark:text-white">{item.topRating}</strong></span>
                <span>Games: <strong className="text-gray-900 dark:text-white">{item.gamesPlayed}</strong></span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card
            title="Player Rankings"
            subtitle={`${pagination?.total || 0} players ranked`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      category === cat.value
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="w-full sm:w-48">
                <Input
                  placeholder="Filter by country..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  icon={Search}
                />
              </div>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left border-collapse bg-white dark:bg-gray-900">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {['Rank', 'Player', 'Rating', 'Games', 'W', 'L', 'D', 'Win Streak', 'Best Rating'].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-800">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((entry) => {
                      const rankColor =
                        entry.rank === 1 ? 'text-amber-500' :
                        entry.rank === 2 ? 'text-gray-400' :
                        entry.rank === 3 ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400';
                      return (
                        <tr
                        key={entry.rank}
                        onClick={() => entry.player?.username && navigate(`/players/${entry.player.username}`)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          <td className="px-4 py-4">
                            <div className={`flex items-center gap-1.5 font-black text-sm ${rankColor}`}>
                              {entry.rank <= 3 && <Trophy size={14} />}
                              #{entry.rank}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold uppercase">
                                {(entry.player?.username || '?')[0]}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {entry.player?.username || 'Unknown'}
                                </p>
                                {entry.player?.country && (
                                  <p className="text-xs text-gray-500">{entry.player.country}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.rating}</span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{entry.gamesPlayed}</td>
                          <td className="px-4 py-4 text-sm text-emerald-600 font-medium">{entry.wins}</td>
                          <td className="px-4 py-4 text-sm text-red-500 font-medium">{entry.losses}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{entry.draws}</td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-semibold text-amber-600">{entry.winStreak}</span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{entry.bestRating}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                        No leaderboard entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-800">
                <p className="text-sm text-gray-500">
                  Page {pagination?.page} of {totalPages} ({pagination?.total} entries)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const pg = start + i;
                    if (pg > totalPages) return null;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          page === pg
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Rating Distribution" subtitle="Player ELO spread">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDist}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="ratingRange"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => typeof v === 'number' ? `${v}` : v}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value, name, props) => [value, `Count (${props.payload.ratingRange})`]}
                  />
                  <Bar dataKey="count" fill="#4338ca" radius={[3, 3, 0, 0]}>
                    {ratingDist.map((_, i) => (
                      <rect key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
            <div className="flex items-center gap-4">
              <Trophy size={32} />
              <div>
                <p className="text-xs uppercase font-bold opacity-80">Total Players</p>
                <p className="text-2xl font-black">{pagination?.total || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
