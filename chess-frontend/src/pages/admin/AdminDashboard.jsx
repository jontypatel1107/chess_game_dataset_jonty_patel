import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Shield, Users, Server, Database, Clock, Activity,
  RefreshCw, Search, Trash2, BarChart3, HardDrive,
  Cpu, CheckCircle, XCircle, AlertTriangle, Terminal,
  UserCheck, UserX
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

import adminService from '../../services/adminService';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [systemInfo, setSystemInfo] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [systemVersion, setSystemVersion] = useState(null);
  const [uptime, setUptime] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [storage, setStorage] = useState(null);
  const [health, setHealth] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [info, status, ver, up, db, perf, stor, h, usersRes, logsRes] = await Promise.all([
        adminService.getSystemInfo(),
        adminService.getSystemStatus(),
        adminService.getSystemVersion(),
        adminService.getUptime(),
        adminService.getDatabaseStatus(),
        adminService.getPerformance(),
        adminService.getStorage(),
        adminService.getHealth(),
        adminService.getAllUsers(),
        adminService.getLogs(),
      ]);
      setSystemInfo(info.data);
      setSystemStatus(status.data);
      setSystemVersion(ver.data);
      setUptime(up.data);
      setDbStatus(db.data);
      setPerformance(perf.data);
      setStorage(stor.data);
      setHealth(h.data);
      setAllUsers(usersRes.data || []);
      setLogs(logsRes.data || []);
    } catch (error) {
      toast.error("Failed to load admin data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleBanToggle = async (userId, currentlyActive) => {
    try {
      if (currentlyActive) {
        await adminService.banUser(userId);
        toast.success("User banned");
      } else {
        await adminService.unbanUser(userId);
        toast.success("User unbanned");
      }
      const res = await adminService.getAllUsers();
      setAllUsers(res.data || []);
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleRecalculate = async () => {
    try {
      await adminService.recalculateStats();
      toast.success("Stats recalculation queued");
    } catch { toast.error("Failed"); }
  };

  const handleReindex = async () => {
    try {
      await adminService.reindex();
      toast.success("Reindex queued");
    } catch { toast.error("Failed"); }
  };

  const handleClearCache = async () => {
    try {
      await adminService.clearCache();
      toast.success("Cache cleared");
    } catch { toast.error("Failed"); }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  if (loading) return <Loader fullPage />;

  const userColumns = [
    {
      header: 'User',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
            {row.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{row.username}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (row) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          row.role === 'admin'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {row.role}
        </span>
      ),
    },
    {
      header: 'Rating',
      accessor: 'rating',
      cell: (row) => <span className="text-sm font-bold text-primary">{row.rating}</span>,
    },
    {
      header: 'Games',
      accessor: 'gamesPlayed',
      cell: (row) => <span className="text-sm text-gray-600 dark:text-gray-400">{row.gamesPlayed || 0}</span>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${row.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">{row.isActive !== false ? 'Active' : 'Banned'}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => handleBanToggle(row._id, row.isActive !== false)}
          className={`p-1.5 rounded-lg transition-colors ${
            row.isActive !== false
              ? 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
              : 'text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'
          }`}
          title={row.isActive !== false ? 'Ban' : 'Unban'}
        >
          {row.isActive !== false ? <UserX size={16} /> : <UserCheck size={16} />}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Admin Dashboard | Chess Analytics</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-purple-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">System overview, performance metrics, and user management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleClearCache} icon={Trash2}>Clear Cache</Button>
          <Button variant="outline" size="sm" onClick={handleReindex} icon={Search}>Reindex</Button>
          <Button variant="outline" size="sm" onClick={handleRecalculate} icon={BarChart3}>Recalculate Stats</Button>
          <Button size="sm" onClick={fetchAll} icon={RefreshCw}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-0">
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30">
              <Server size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">System</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{systemInfo?.name || 'Chess API'}</p>
              <p className="text-[10px] text-gray-400">{systemInfo?.environment || 'development'}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${systemStatus?.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{systemStatus?.status || 'unknown'}</p>
              </div>
              <p className="text-[10px] text-gray-400">v{systemVersion?.version || '?'}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Uptime</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatUptime(uptime?.uptimeSeconds)}</p>
              <p className="text-[10px] text-gray-400">{health?.status || 'unknown'}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30">
              <Database size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Database</p>
              <div className="flex items-center gap-2">
                {dbStatus?.connected ? (
                  <CheckCircle size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )}
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {dbStatus?.connected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="System Performance"
          subtitle="Server resource utilization"
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Cpu size={14} /> Memory Usage
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {performance?.memory ? `${(performance.memory.heapUsed / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: performance?.memory
                      ? `${(performance.memory.heapUsed / performance.memory.heapTotal * 100).toFixed(1)}%`
                      : '0%'
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Heap: {performance?.memory ? `${(performance.memory.heapTotal / 1024 / 1024).toFixed(1)} MB total` : 'N/A'}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <HardDrive size={14} /> Storage
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                  <p className="text-2xl font-bold text-primary">{storage?.matches || 0}</p>
                  <p className="text-xs text-gray-500">Matches</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                  <p className="text-2xl font-bold text-purple-500">{storage?.players || 0}</p>
                  <p className="text-xs text-gray-500">Players</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="System Actions"
          subtitle="Maintenance operations"
        >
          <div className="space-y-3">
            <button onClick={handleClearCache}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-red-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Clear Cache</p>
                  <p className="text-xs text-gray-500">Flush all cached data</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">DELETE</span>
            </button>
            <button onClick={handleReindex}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Reindex Search</p>
                  <p className="text-xs text-gray-500">Rebuild search indexes</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">POST</span>
            </button>
            <button onClick={handleRecalculate}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <BarChart3 size={18} className="text-amber-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Recalculate Stats</p>
                  <p className="text-xs text-gray-500">Regenerate aggregate statistics</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">POST</span>
            </button>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-gray-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">System Logs</p>
                  <p className="text-xs text-gray-500">{logs.length} entries</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">OK</span>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="User Management"
        subtitle={`${allUsers.length} registered users`}
      >
        <Table
          columns={userColumns}
          data={allUsers}
          loading={usersLoading}
          emptyMessage="No users found."
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;
