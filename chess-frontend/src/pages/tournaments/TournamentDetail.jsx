import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy, Calendar, Users, Clock, Tag, ArrowLeft,
  CircleDot, PlayCircle, CheckCircle, XCircle,
  Medal, DollarSign, Globe, Star
} from 'lucide-react';
import { toast } from 'react-toastify';

import tournamentService from '../../services/tournamentService';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const FORMAT_LABELS = {
  round_robin: 'Round Robin',
  swiss: 'Swiss',
  knockout: 'Knockout',
  double_elimination: 'Double Elimination',
};

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await tournamentService.getTournamentById(id);
        setTournament(res.data);
      } catch (error) {
        toast.error("Failed to load tournament");
        navigate('/tournaments');
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id, navigate]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const res = await tournamentService.registerForTournament(id);
      setTournament(res.data);
      toast.success("Registered successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to register");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!tournament) return null;

  const t = tournament;
  const registeredCount = t.registeredPlayers?.length || 0;
  const isFull = registeredCount >= t.maxPlayers;

  const statusConfig = {
    upcoming: { icon: CircleDot, label: 'Upcoming', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    ongoing: { icon: PlayCircle, label: 'Ongoing', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    completed: { icon: CheckCircle, label: 'Completed', color: 'text-gray-600 bg-gray-100 dark:bg-gray-800' },
    cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  };
  const StatusIcon = statusConfig[t.status]?.icon || CircleDot;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{t.name} | Chess Analytics</title>
      </Helmet>

      <button
        onClick={() => navigate('/tournaments')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Tournaments
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.name}</h1>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[t.status].color}`}>
                    <StatusIcon size={12} />
                    {statusConfig[t.status].label}
                  </span>
                </div>
                {t.description && (
                  <p className="text-gray-500 dark:text-gray-400">{t.description}</p>
                )}
              </div>
              {t.status === 'upcoming' && !isFull && (
                <Button onClick={handleRegister} isLoading={registering} icon={Star}>
                  Register Now
                </Button>
              )}
              {t.status === 'upcoming' && isFull && (
                <span className="text-sm font-semibold text-red-500 flex items-center gap-1">
                  <Users size={16} /> Full
                </span>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="!p-0">
              <div className="p-4 text-center">
                <Tag size={20} className="mx-auto mb-1 text-primary" />
                <p className="text-xs text-gray-500 uppercase font-bold">Format</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{FORMAT_LABELS[t.format] || t.format}</p>
              </div>
            </Card>
            <Card className="!p-0">
              <div className="p-4 text-center">
                <Clock size={20} className="mx-auto mb-1 text-primary" />
                <p className="text-xs text-gray-500 uppercase font-bold">Time Control</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 capitalize">{t.timeControl}</p>
              </div>
            </Card>
            <Card className="!p-0">
              <div className="p-4 text-center">
                <Calendar size={20} className="mx-auto mb-1 text-primary" />
                <p className="text-xs text-gray-500 uppercase font-bold">Start Date</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{new Date(t.startDate).toLocaleDateString()}</p>
              </div>
            </Card>
            <Card className="!p-0">
              <div className="p-4 text-center">
                {t.prizePool > 0 ? (
                  <>
                    <DollarSign size={20} className="mx-auto mb-1 text-amber-500" />
                    <p className="text-xs text-gray-500 uppercase font-bold">Prize Pool</p>
                    <p className="text-sm font-bold text-amber-600 mt-1">${t.prizePool}</p>
                  </>
                ) : (
                  <>
                    <Trophy size={20} className="mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500 uppercase font-bold">Prize</p>
                    <p className="text-sm font-bold text-gray-500 mt-1">None</p>
                  </>
                )}
              </div>
            </Card>
          </div>

          <Card title="Details">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Min Rating</span>
                <p className="font-semibold text-gray-900 dark:text-white">{t.minRating || 'No limit'}</p>
              </div>
              <div>
                <span className="text-gray-500">Max Rating</span>
                <p className="font-semibold text-gray-900 dark:text-white">{t.maxRating >= 9999 ? 'No limit' : t.maxRating}</p>
              </div>
              <div>
                <span className="text-gray-500">Visibility</span>
                <p className="font-semibold text-gray-900 dark:text-white">{t.isPublic ? 'Public' : 'Private'}</p>
              </div>
              {t.endDate && (
                <div>
                  <span className="text-gray-500">End Date</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{new Date(t.endDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Organizer</span>
                <p className="font-semibold text-gray-900 dark:text-white">{t.organizer?.username || 'Unknown'}</p>
              </div>
              {t.winner && (
                <div>
                  <span className="text-gray-500">Winner</span>
                  <p className="font-semibold text-amber-600">{t.winner?.username || 'TBD'}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title="Registered Players"
            subtitle={`${registeredCount} / ${t.maxPlayers} spots filled`}
          >
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {t.registeredPlayers?.length > 0 ? (
                t.registeredPlayers.map((rp, i) => (
                  <div
                    key={rp.player?._id || i}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => rp.player?.username && navigate(`/players/${rp.player.username}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                        {(rp.player?.username || '?')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {rp.player?.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Score: {rp.score || 0}
                        </p>
                      </div>
                    </div>
                    {i < 3 && <Medal size={16} className={i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : 'text-orange-600'} />}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No players registered yet.</p>
              )}
            </div>
          </Card>

          {t.status === 'completed' && t.winner && (
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <div className="text-center py-4">
                <Trophy size={40} className="mx-auto mb-2" />
                <p className="text-sm uppercase font-bold opacity-80">Champion</p>
                <p className="text-xl font-black">{t.winner?.username || 'Unknown'}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
