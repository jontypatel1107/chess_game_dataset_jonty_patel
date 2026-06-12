import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Users, Gamepad2, Trophy, TrendingUp } from 'lucide-react';
import { 
  AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis
} from 'recharts';

import Card from '../../components/common/Card';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, gamesRes, analyticsRes, lbRes] = await Promise.all([
          api.get('/stats/total-players'),
          api.get('/stats/total-matches'),
          api.get('/analytics/victory-distribution'),
          api.get('/leaderboard', { params: { page: 1, limit: 3, category: 'overall' } }),
        ]);

        setStats({
          totalPlayers: usersRes.data.data.total,
          totalMatches: gamesRes.data.data.total,
          victoryDist: analyticsRes.data.data,
        });
        setTopPlayers(lbRes.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loader fullPage />;

  const COLORS = ['#4338ca', '#db2777', '#fbbf24', '#10b981'];

  const mockTimeline = [
    { name: 'Mon', games: 40 },
    { name: 'Tue', games: 30 },
    { name: 'Wed', games: 60 },
    { name: 'Thu', games: 45 },
    { name: 'Fri', games: 75 },
    { name: 'Sat', games: 90 },
    { name: 'Sun', games: 65 },
  ];

  const rankColor = (rank) =>
    rank === 1 ? 'text-amber-500' :
    rank === 2 ? 'text-gray-400' :
    rank === 3 ? 'text-orange-600' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard | Chess Analytics</title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
        <p className="text-gray-500 dark:text-gray-400">Here's what's happening in your chess platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="!p-0">
          <div className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-900/30">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Players</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalPlayers}</h3>
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalMatches}</h3>
            </div>
          </div>
        </Card>

        <Card className="!p-0">
          <div className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl dark:bg-amber-900/30">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Tournaments</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
            </div>
          </div>
        </Card>

        <Card className="!p-0">
          <div className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl dark:bg-emerald-900/30">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Growth Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">+18%</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Activity Timeline" subtitle="Matches played per day this week">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTimeline}>
                <defs>
                  <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4338ca" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="games" stroke="#4338ca" strokeWidth={3} fillOpacity={1} fill="url(#colorGames)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Victory Distribution" subtitle="Success rate by game result type">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.victoryDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="label"
                >
                  {stats?.victoryDist?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {stats?.victoryDist?.map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recent Matches" footer={<Link to="/data" className="text-primary font-medium text-sm hover:underline">View all matches</Link>}>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" />
                      <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white dark:border-gray-900" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Magnus vs. Hikaru</p>
                      <p className="text-xs text-gray-500 uppercase">Blitz • 3+2 • Completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">1 - 0</p>
                    <p className="text-xs text-gray-400">2 mins ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Leaderboard Top 3" footer={<Link to="/leaderboard" className="text-primary font-medium text-sm hover:underline">View full leaderboard</Link>}>
            <div className="space-y-6">
              {topPlayers.length > 0 ? topPlayers.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`text-xl font-black ${rankColor(entry.rank)}`}>#{entry.rank}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {entry.player?.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">Rating: {entry.rating}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-gray-500">
                    {entry.wins}W / {entry.losses}L
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
