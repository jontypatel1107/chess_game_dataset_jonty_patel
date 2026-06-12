import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { 
  Trophy, Gamepad2, TrendingUp, Crosshair, Calendar, Medal,
  ArrowLeft, ChevronLeft, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import api from '../../services/api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card className="!p-0">
    <div className="p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </Card>
);

const PlayerProfile = () => {
  const { username } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [playerRes, statsRes, recentRes, historyRes] = await Promise.all([
        api.get(`/players/${encodeURIComponent(username)}`),
        api.get(`/players/${encodeURIComponent(username)}/stats`),
        api.get(`/players/${encodeURIComponent(username)}/recent?limit=5`),
        api.get(`/players/${encodeURIComponent(username)}/history?page=${historyPage}&limit=10`),
      ]);
      setPlayer(playerRes.data.data);
      setStats(statsRes.data.data);
      setRecent(recentRes.data.data);
      setHistory(historyRes.data.data);
      setHistoryPagination(historyRes.data.pagination);
    } catch (error) {
      console.error("Player profile fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [username, historyPage]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <Loader fullPage />;
  if (!player) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Player not found.</p>
        <Link to="/players" className="text-primary font-medium text-sm hover:underline mt-2 inline-block">Back to players</Link>
      </div>
    );
  }

  const winRateData = stats ? [
    { name: 'Wins', value: stats.winRate, fill: '#10b981' },
    { name: 'Losses', value: stats.lossRate, fill: '#ef4444' },
    { name: 'Draws', value: stats.drawRate, fill: '#f59e0b' },
  ] : [];

  const totalPages = historyPagination ? Math.ceil(historyPagination.total / historyPagination.limit) : 1;
  const isWinner = (game) => {
    if (!game.winner) return false;
    return game.winner.username === player.username;
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{player.username} | Chess Analytics</title>
      </Helmet>

      <Link to="/players" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
        <ArrowLeft size={16} /> Back to Players
      </Link>

      {/* Hero Section */}
      <Card className="!p-0">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 text-white flex items-center justify-center text-3xl font-bold uppercase shadow-lg">
              {player.username[0]}
            </div>
            <div className="text-white">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black">{player.username}</h1>
                {player.role === 'admin' && (
                  <span className="text-[10px] font-bold uppercase bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">Admin</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1"><Medal size={14} /> Rating: {player.rating}</span>
                {player.country && <span>{player.country}</span>}
                <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(player.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard icon={Gamepad2} label="Games" value={stats.gamesPlayed} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30" />
          <StatCard icon={Trophy} label="Wins" value={stats.wins} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" />
          <StatCard icon={Crosshair} label="Losses" value={stats.losses} color="bg-red-100 text-red-600 dark:bg-red-900/30" />
          <StatCard icon={TrendingUp} label="Draws" value={stats.draws} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30" />
          <StatCard icon={Medal} label="Win Rate" value={`${stats.winRate}%`} color="bg-purple-100 text-purple-600 dark:bg-purple-900/30" />
          <StatCard icon={Crosshair} label="Rating" value={stats.rating} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Win/Loss/Draw Chart */}
        <Card title="Performance Breakdown" subtitle="Win / Loss / Draw rates">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winRateData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={70} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {winRateData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Matches */}
        <Card title="Recent Matches" subtitle="Last 5 games">
          <div className="space-y-3">
            {recent.length > 0 ? recent.map((game) => {
              const won = isWinner(game);
              const isDraw = game.result === 'draw';
              return (
                <div key={game._id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${won ? 'bg-emerald-500' : isDraw ? 'bg-amber-400' : 'bg-red-500'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {game.whitePlayer?.username} vs {game.blackPlayer?.username}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase">
                        {game.timeControl} • {game.result?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-500 text-center py-4">No matches played yet.</p>
            )}
          </div>
        </Card>

        {/* Stats Summary */}
        <Card title="Game Stats" subtitle="From user service">
          <div className="space-y-4">
            {[
              { label: 'Games Played', value: stats?.gamesPlayed || 0 },
              { label: 'Wins', value: stats?.wins || 0, color: 'text-emerald-600' },
              { label: 'Losses', value: stats?.losses || 0, color: 'text-red-500' },
              { label: 'Draws', value: stats?.draws || 0, color: 'text-amber-600' },
              { label: 'Win Rate', value: `${stats?.winRate || 0}%`, color: 'text-primary' },
              { label: 'Loss Rate', value: `${stats?.lossRate || 0}%`, color: 'text-red-500' },
              { label: 'Draw Rate', value: `${stats?.drawRate || 0}%`, color: 'text-amber-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                <span className={`text-sm font-bold ${item.color || 'text-gray-900 dark:text-white'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Game History */}
      <Card title="Game History" subtitle={historyPagination ? `${historyPagination.total} total games` : ''}>
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left border-collapse bg-white dark:bg-gray-900">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['White', 'Black', 'Result', 'Time Control', 'Moves', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-800">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {history.length > 0 ? history.map((game) => {
                const won = isWinner(game);
                const isDraw = game.result === 'draw';
                return (
                  <tr key={game._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${game.whitePlayer?.username === player.username ? 'text-primary font-bold' : 'text-gray-900 dark:text-white'}`}>
                        {game.whitePlayer?.username || '?'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${game.blackPlayer?.username === player.username ? 'text-primary font-bold' : 'text-gray-900 dark:text-white'}`}>
                        {game.blackPlayer?.username || '?'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                        won ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                        isDraw ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      }`}>
                        {won ? 'Won' : isDraw ? 'Draw' : 'Lost'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{game.timeControl}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{game.totalMoves || game.moves?.length || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(game.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">No game history.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-800">
            <p className="text-sm text-gray-500">Page {historyPagination?.page} of {totalPages} ({historyPagination?.total} games)</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setHistoryPage((p) => Math.max(1, p - 1))} disabled={historyPage <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">{historyPage}</span>
              <button onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))} disabled={historyPage >= totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PlayerProfile;
