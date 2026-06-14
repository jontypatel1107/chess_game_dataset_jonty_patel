import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Search, Calendar, Users, Clock, Filter,
  ChevronLeft, ChevronRight, Plus, Swords, Globe,
  CircleDot, PlayCircle, CheckCircle, XCircle, Tag
} from 'lucide-react';
import { toast } from 'react-toastify';

import api from '../../services/api';
import tournamentService from '../../services/tournamentService';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const STATUS_ICONS = {
  upcoming: { icon: CircleDot, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  ongoing: { icon: PlayCircle, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
  completed: { icon: CheckCircle, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' },
  cancelled: { icon: XCircle, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' },
};

const FORMAT_BADGES = {
  round_robin: 'Round Robin',
  swiss: 'Swiss',
  knockout: 'Knockout',
  double_elimination: 'Double Elim',
};

const Tournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '', description: '', format: 'swiss', timeControl: 'rapid',
    maxPlayers: 16, startDate: '', endDate: '', prizePool: 0,
    minRating: 0, maxRating: 9999, isPublic: true,
  });

  const limit = 12;

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (formatFilter) params.format = formatFilter;

      const [tourRes, statsRes] = await Promise.all([
        tournamentService.getAllTournaments(params),
        tournamentService.getTournamentStats(),
      ]);

      setTournaments(tourRes.data || []);
      setPagination(tourRes.pagination);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Tournaments fetch error", error);
      toast.error("Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery, formatFilter]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  useEffect(() => { setPage(1); }, [statusFilter, formatFilter]);

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.startDate) {
      toast.error("Name and start date are required");
      return;
    }
    setCreating(true);
    try {
      await tournamentService.createTournament({
        ...formData,
        maxPlayers: Number(formData.maxPlayers),
        prizePool: Number(formData.prizePool),
        minRating: Number(formData.minRating),
        maxRating: Number(formData.maxRating),
      });
      toast.success("Tournament created successfully!");
      setShowCreateModal(false);
      setFormData({ name: '', description: '', format: 'swiss', timeControl: 'rapid', maxPlayers: 16, startDate: '', endDate: '', prizePool: 0, minRating: 0, maxRating: 9999, isPublic: true });
      fetchTournaments();
    } catch (error) {
      toast.error(error.message || "Failed to create tournament");
    } finally {
      setCreating(false);
    }
  };

  const handleRegister = async (id, e) => {
    e.stopPropagation();
    try {
      await tournamentService.registerForTournament(id);
      toast.success("Registered successfully!");
      fetchTournaments();
    } catch (error) {
      toast.error(error.message || "Failed to register");
    }
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  const statusColor = (status) => {
    const map = {
      upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      ongoing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      completed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Tournaments | Chess Analytics</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tournaments</h1>
          <p className="text-gray-500 dark:text-gray-400">Browse and join chess tournaments.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
          Create Tournament
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-0">
            <div className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30">
                <Trophy size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalTournaments || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-0">
            <div className="p-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30">
                <PlayCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Active</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeTournaments || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-0">
            <div className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Players</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalRegisteredPlayers || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-0">
            <div className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30">
                <Swords size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Avg. Players</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.averagePlayersPerTournament || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} icon={Filter}>
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {['', 'upcoming', 'ongoing', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {['', 'swiss', 'knockout', 'round_robin', 'double_elimination'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormatFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    formatFilter === f
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {f ? FORMAT_BADGES[f] : 'All Formats'}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {loading ? (
        <Loader fullPage />
      ) : tournaments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tournaments.map((t) => {
              const StatusIcon = STATUS_ICONS[t.status]?.icon || CircleDot;
              const registeredCount = t.registeredPlayers?.length || 0;
              return (
                <Card
                  key={t._id}
                  className="!p-0 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div onClick={() => navigate(`/tournaments/${t._id}`)}>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{t.name}</h3>
                            <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(t.status)}`}>
                              {t.status}
                            </span>
                          </div>
                          {t.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{t.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {FORMAT_BADGES[t.format] || t.format}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(t.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {registeredCount}/{t.maxPlayers}
                        </span>
                        {t.prizePool > 0 && (
                          <span className="flex items-center gap-1 text-amber-600 font-semibold">
                            <Trophy size={12} />
                            ${t.prizePool}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-gray-500 capitalize">{t.timeControl}</span>
                        </div>
                        {t.status === 'upcoming' && registeredCount < t.maxPlayers && (
                          <Button
                            size="sm"
                            onClick={(e) => handleRegister(t._id, e)}
                          >
                            Register
                          </Button>
                        )}
                        {t.status === 'ongoing' && (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <PlayCircle size={12} />
                            Live
                          </span>
                        )}
                        {t.status === 'completed' && t.winner && (
                          <span className="text-xs font-semibold text-amber-600">
                            Winner: {t.winner?.username || 'TBD'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t dark:border-gray-800">
              <p className="text-sm text-gray-500">
                Page {pagination?.page} of {totalPages} ({pagination?.total} tournaments)
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
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Trophy size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No tournaments found.</p>
          </div>
        </Card>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Tournament" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Tournament Name"
                name="name"
                placeholder="Enter tournament name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tournament description..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Format</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="swiss">Swiss</option>
                <option value="round_robin">Round Robin</option>
                <option value="knockout">Knockout</option>
                <option value="double_elimination">Double Elimination</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Time Control</label>
              <select
                value={formData.timeControl}
                onChange={(e) => setFormData({ ...formData, timeControl: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="rapid">Rapid</option>
                <option value="blitz">Blitz</option>
                <option value="bullet">Bullet</option>
                <option value="classical">Classical</option>
              </select>
            </div>
            <div>
              <Input
                label="Max Players"
                name="maxPlayers"
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="Prize Pool ($)"
                name="prizePool"
                type="number"
                value={formData.prizePool}
                onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Min Rating"
                name="minRating"
                type="number"
                value={formData.minRating}
                onChange={(e) => setFormData({ ...formData, minRating: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Max Rating"
                name="maxRating"
                type="number"
                value={formData.maxRating}
                onChange={(e) => setFormData({ ...formData, maxRating: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                Public Tournament
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={creating}>
              Create Tournament
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tournaments;
