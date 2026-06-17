import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { TrendingUp, Award, Zap, Crosshair } from 'lucide-react';

import api from '../../services/api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [distRes, colorRes, turnsRes, tcRes] = await Promise.all([
          api.get('/analytics/victory-distribution'),
          api.get('/analytics/color-advantage'),
          api.get('/analytics/turn-count-average'),
          api.get('/analytics/time-control-usage')
        ]);

        setData({
          victory: distRes.data.data,
          color: colorRes.data.data,
          turns: turnsRes.data.data,
          timeControl: tcRes.data.data
        });
      } catch (error) {
        console.error("Analytics fetch error", error);
        setError(error.message || 'Unable to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Loader fullPage />;

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics unavailable</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No analytics data found</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please try refreshing the page or check your backend connection.</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#4338ca', '#db2777', '#fbbf24', '#10b981', '#6366f1'];

  const colorAdvData = [
    { name: 'White Wins', value: data.color?.whiteWinRate ?? 0 },
    { name: 'Black Wins', value: data.color?.blackWinRate ?? 0 },
    { name: 'Draws', value: data.color?.drawRate ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Analytics Dashboard | Chess Analytics</title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">Deep dive into the chess dataset using MongoDB aggregation metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Time Control Popularity" subtitle="Distribution of game formats across all matches">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeControl}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4338ca" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Color Advantage Index" subtitle="Win probability based on starting color">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={colorAdvData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {colorAdvData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Game Length Analysis" subtitle="Average turn counts across various criteria">
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
             <div className="text-6xl font-black text-primary">{data.turns.averageTurns}</div>
             <div className="text-sm font-bold uppercase text-gray-500">Average Moves Per Game</div>
             <p className="text-center text-xs text-gray-400 max-w-xs">
                Calculated from over {Array.isArray(data.timeControl) ? data.timeControl.reduce((a,b) => a + (b.count || 0), 0) : 0} historical matches in the system.
             </p>
          </div>
        </Card>

        <Card title="Victory Method Breakdown" subtitle="How games are being decided">
           <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.victory}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="label" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#db2777" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
            <div className="flex items-center gap-4">
              <Zap size={32} />
              <div>
                <p className="text-xs uppercase font-bold opacity-80">Fastest Mate</p>
                <p className="text-2xl font-black">2 Moves</p>
              </div>
            </div>
         </Card>
         <Card className="bg-gradient-to-br from-pink-500 to-pink-700 text-white">
            <div className="flex items-center gap-4">
              <Crosshair size={32} />
              <div>
                <p className="text-xs uppercase font-bold opacity-80">Accuracy Avg</p>
                <p className="text-2xl font-black">78.4%</p>
              </div>
            </div>
         </Card>
         <Card className="bg-gradient-to-br from-amber-500 to-amber-700 text-white">
            <div className="flex items-center gap-4">
              <Award size={32} />
              <div>
                <p className="text-xs uppercase font-bold opacity-80">Elite Players</p>
                <p className="text-2xl font-black">42</p>
              </div>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default Analytics;
