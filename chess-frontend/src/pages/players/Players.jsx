import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Search, Users as UsersIcon } from 'lucide-react';

import api from '../../services/api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

const Players = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/players', { params });
      setPlayers(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Players fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Players | Chess Analytics</title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Players</h1>
        <p className="text-gray-500 dark:text-gray-400">Browse all chess players on the platform.</p>
      </div>

      <Card>
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search players by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left border-collapse bg-white dark:bg-gray-900">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['Player', 'Rating', 'Games', 'Wins', 'Losses', 'Draws', 'Win Rate', 'Country'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-800">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12"><Loader /></td>
                </tr>
              ) : players.length > 0 ? (
                players.map((player) => (
                  <tr
                    key={player._id}
                    onClick={() => navigate(`/players/${player.username}`)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold uppercase">
                          {(player.username || '?')[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{player.username}</p>
                          <p className="text-xs text-gray-500">{player.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="text-sm font-bold text-gray-900 dark:text-white">{player.rating}</span></td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{player.gamesPlayed}</td>
                    <td className="px-4 py-4 text-sm text-emerald-600 font-medium">{player.wins}</td>
                    <td className="px-4 py-4 text-sm text-red-500 font-medium">{player.losses}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{player.draws}</td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-primary">{player.winRate || 0}%</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{player.country || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    <UsersIcon size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    No players found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-800">
            <p className="text-sm text-gray-500">Page {pagination?.page} of {totalPages} ({pagination?.total} players)</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
              <span className="text-sm text-gray-600 dark:text-gray-400">{page}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">›</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Players;
