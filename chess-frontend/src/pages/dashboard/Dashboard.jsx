import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Gamepad2, Trophy, TrendingUp, Activity,
  Swords, Clock, Hash, Percent, Zap, Target, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Legend,
  LineChart, Line
} from 'recharts';

import Card from '../../components/common/Card';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

const COLORS = ['#4338ca', '#db2777', '#fbbf24', '#10b981', '#f97316', '#06b6d4', '#a855f7', '#ef4444'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const safeGet = (promise) => promise.catch(() => ({ data: { data: null } }));

        const [
          usersRes, gamesRes, victoryRes, lbRes,
          avgRatingRes, whiteWinRes, blackWinRes, drawRateRes,
          checkmateRes, resignRes, timeoutRes,
          colorAdvRes, ratedVsCasualRes, tcUsageRes,
          hourlyRes, growthRes, turnAvgRes, dailyRes,
          topOpeningsRes, recentGamesRes,
        ] = await Promise.all([
          safeGet(api.get('/stats/total-players')),
          safeGet(api.get('/stats/total-matches')),
          safeGet(api.get('/analytics/victory-distribution')),
          safeGet(api.get('/leaderboard', { params: { page: 1, limit: 3, category: 'overall' } })),
          safeGet(api.get('/stats/average-rating')),
          safeGet(api.get('/stats/white-win-rate')),
          safeGet(api.get('/stats/black-win-rate')),
          safeGet(api.get('/stats/draw-rate')),
          safeGet(api.get('/stats/checkmate-rate')),
          safeGet(api.get('/stats/resignation-rate')),
          safeGet(api.get('/stats/timeout-rate')),
          safeGet(api.get('/analytics/color-advantage')),
          safeGet(api.get('/analytics/rated-vs-casual')),
          safeGet(api.get('/analytics/time-control-usage')),
          safeGet(api.get('/analytics/hourly-activity')),
          safeGet(api.get('/analytics/player-growth')),
          safeGet(api.get('/analytics/turn-count-average')),
          safeGet(api.get('/stats/daily-games')),
          safeGet(api.get('/stats/top-openings')),
          safeGet(api.get('/games', { params: { page: 1, limit: 5 } })),
        ]);

        setData({
          totalPlayers: usersRes?.data?.data?.total ?? usersRes?.data?.data ?? 0,
          totalMatches: gamesRes?.data?.data?.total ?? gamesRes?.data?.data ?? 0,
          victoryDist: victoryRes?.data?.data || [],
          topPlayers: lbRes?.data?.data || [],
          avgRating: avgRatingRes?.data?.data,
          whiteWinRate: whiteWinRes?.data?.data,
          blackWinRate: blackWinRes?.data?.data,
          drawRate: drawRateRes?.data?.data,
          checkmateRate: checkmateRes?.data?.data,
          resignRate: resignRes?.data?.data,
          timeoutRate: timeoutRes?.data?.data,
          colorAdvantage: colorAdvRes?.data?.data || [],
          ratedVsCasual: ratedVsCasualRes?.data?.data || [],
          tcUsage: tcUsageRes?.data?.data || [],
          hourlyActivity: hourlyRes?.data?.data || [],
          playerGrowth: growthRes?.data?.data || [],
          turnAvg: turnAvgRes?.data?.data,
          dailyGames: dailyRes?.data?.data || [],
          topOpenings: topOpeningsRes?.data?.data || [],
          recentGames: recentGamesRes?.data?.data || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loader fullPage />;
  if (!data) return null;

  const winRateData = [
    { name: 'White', value: data.whiteWinRate?.rate ?? data.whiteWinRate ?? 0 },
    { name: 'Black', value: data.blackWinRate?.rate ?? data.blackWinRate ?? 0 },
    { name: 'Draw', value: data.drawRate?.rate ?? data.drawRate ?? 0 },
  ];

  const endReasonData = [
    { name: 'Checkmate', value: data.checkmateRate?.rate ?? data.checkmateRate ?? 0 },
    { name: 'Resignation', value: data.resignRate?.rate ?? data.resignRate ?? 0 },
    { name: 'Timeout', value: data.timeoutRate?.rate ?? data.timeoutRate ?? 0 },
  ];

  const rankColor = (rank) =>
    rank === 1 ? 'text-amber-500' :
    rank === 2 ? 'text-gray-400' :
    rank === 3 ? 'text-orange-600' : 'text-gray-600';

  const firstStatValue = (stat) => {
    if (!stat) return 'N/A';
    if (typeof stat === 'object' && stat.rate !== undefined) return `${stat.rate}%`;
    if (typeof stat === 'object' && stat.average !== undefined) return stat.average;
    if (typeof stat === 'object' && stat.avgTurns !== undefined) return stat.avgTurns;
    if (Array.isArray(stat)) return stat.length;
    if (typeof stat === 'object') return Object.values(stat)[0] || 'N/A';
    return stat;
  };

  const formatNumber = (n) => {
    if (!n && n !== 0) return 'N/A';
    return typeof n === 'number' ? n.toLocaleString() : n;
  };

  // Normalize analytics shapes: backend sometimes returns objects instead of arrays
  const colorAdvData = Array.isArray(data.colorAdvantage)
    ? data.colorAdvantage
    : [
        { label: 'White Wins', value: data.colorAdvantage?.whiteWinRate ?? data.whiteWinRate ?? 0 },
        { label: 'Black Wins', value: data.colorAdvantage?.blackWinRate ?? data.blackWinRate ?? 0 },
        { label: 'Draws', value: data.colorAdvantage?.drawRate ?? data.drawRate ?? 0 },
      ];

  const ratedVsCasualData = Array.isArray(data.ratedVsCasual)
    ? data.ratedVsCasual
    : [
        { label: 'Rated', count: data.ratedVsCasual?.rated ?? data.rated ?? 0 },
        { label: 'Casual', count: data.ratedVsCasual?.casual ?? data.casual ?? 0 },
      ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard | Chess Analytics</title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
        <p className="text-gray-500 dark:text-gray-400">Here's what's happening in your chess platform today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="!p-0">
          <div className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-900/30">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Players</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(data.totalPlayers)}</h3>
            </div>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="p-6 flex items-center gap-4">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-xl dark:bg-pink-900/30">
              <Gamepad2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Matches Played</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(data.totalMatches)}</h3>
            </div>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl dark:bg-amber-900/30">
              <Hash size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Rating</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{firstStatValue(data.avgRating)}</h3>
            </div>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl dark:bg-emerald-900/30">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Turns</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{firstStatValue(data.turnAvg)}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Daily Activity" subtitle="Matches played per day">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyGames.length > 0 ? data.dailyGames : data.hourlyActivity.slice(0, 7)}>
                  <defs>
                    <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4338ca" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey={data.dailyGames.length > 0 ? 'date' : 'hour'} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey={data.dailyGames.length > 0 ? 'count' : 'games'} stroke="#4338ca" strokeWidth={3} fillOpacity={1} fill="url(#colorGames)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card title="Victory Distribution" subtitle="By game result">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.victoryDist} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="label">
                  {data.victoryDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {data.victoryDist.map((item, i) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Win Rates" subtitle="White vs Black vs Draw">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winRateData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{fill: '#9ca3af', fontSize: 11}} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {winRateData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#4338ca' : i === 1 ? '#db2777' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Game Endings" subtitle="Checkmate / Resignation / Timeout">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={endReasonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{fill: '#9ca3af', fontSize: 11}} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {endReasonData.map((_, i) => (
                    <Cell key={i} fill={['#f97316', '#06b6d4', '#ef4444'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Color Advantage" subtitle="Performance by playing color">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={colorAdvData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey={colorAdvData[0]?.color ? 'color' : 'label'} tick={{fill: '#9ca3af', fontSize: 11}} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 11}} />
                <Tooltip />
                <Bar dataKey={colorAdvData[0]?.winRate ? 'winRate' : 'value'} radius={[4, 4, 0, 0]} barSize={40}>
                  {colorAdvData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#4338ca' : '#db2777'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Rated vs Casual" subtitle="Competitive vs friendly play">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ratedVsCasualData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={5} dataKey={ratedVsCasualData[0]?.count ? 'count' : 'value'} nameKey={ratedVsCasualData[0]?.label ? 'label' : 'name'}>
                  {ratedVsCasualData.map((_, i) => (
                    <Cell key={i} fill={[COLORS[0], COLORS[3]][i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {ratedVsCasualData.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: [COLORS[0], COLORS[3]][i]}} />
                  <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{item.label || item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Time Control Usage" subtitle="Distribution by time format">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.tcUsage} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey={data.tcUsage[0]?.count ? 'count' : 'value'} nameKey={data.tcUsage[0]?.name ? 'name' : 'label'}>
                  {data.tcUsage.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 mt-2 flex-wrap">
              {data.tcUsage.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{item.name || item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card title="Player Growth" subtitle="New players over time">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.playerGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey={data.playerGrowth[0]?.date ? 'date' : 'period'} tick={{fill: '#9ca3af', fontSize: 11}} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 11}} />
                <Tooltip />
                <Line type="monotone" dataKey={data.playerGrowth[0]?.count ? 'count' : 'players'} stroke="#4338ca" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recent Matches" footer={<Link to="/data" className="text-primary font-medium text-sm hover:underline">View all matches</Link>}>
            <div className="space-y-3">
              {data.recentGames.length > 0 ? data.recentGames.slice(0, 5).map((game) => (
                <div key={game._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] text-white font-bold">
                        {(game.whitePlayer?.username || 'W')[0]}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] text-white font-bold">
                        {(game.blackPlayer?.username || 'B')[0]}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {game.whitePlayer?.username || 'White'} vs {game.blackPlayer?.username || 'Black'}
                      </p>
                      <p className="text-xs text-gray-500 uppercase">{game.timeControl || '?'} &bull; {game.endReason || 'Completed'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{game.result || '-'}</p>
                    <p className="text-xs text-gray-400">{game.createdAt ? new Date(game.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                </div>
              )) : (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" />
                          <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white dark:border-gray-900" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-400">Match #{i}</p>
                          <p className="text-xs text-gray-400">Loading...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Leaderboard Top 3" footer={<Link to="/leaderboard" className="text-primary font-medium text-sm hover:underline">View full leaderboard</Link>}>
            <div className="space-y-5">
              {data.topPlayers.length > 0 ? data.topPlayers.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
                  onClick={() => entry.player?.username && navigate(`/players/${entry.player.username}`)}>
                  <div className="flex items-center gap-4">
                    <div className={`text-xl font-black ${rankColor(entry.rank)}`}>#{entry.rank}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.player?.username || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">Rating: {entry.rating}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-gray-500">{entry.wins}W / {entry.losses}L</div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </Card>

          {data.topOpenings.length > 0 && (
            <Card title="Top Openings" subtitle="Most played">
              <div className="space-y-3">
                {data.topOpenings.slice(0, 5).map((op, i) => (
                  <div key={op.eco || i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}.</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{op.name || op.opening}</span>
                    </div>
                    <span className="text-xs font-bold text-primary flex-shrink-0">{op.games || op.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
