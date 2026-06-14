import api from './api';

const adminService = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getLogs: async () => {
    const response = await api.get('/admin/logs');
    return response.data;
  },
  getHealth: async () => {
    const response = await api.get('/admin/system/health');
    return response.data;
  },
  clearCache: async () => {
    const response = await api.delete('/admin/cache/clear');
    return response.data;
  },
  banUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/ban`);
    return response.data;
  },
  unbanUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/unban`);
    return response.data;
  },
  getSystemInfo: async () => {
    const response = await api.get('/system/info');
    return response.data;
  },
  getSystemStatus: async () => {
    const response = await api.get('/system/status');
    return response.data;
  },
  getSystemVersion: async () => {
    const response = await api.get('/system/version');
    return response.data;
  },
  getUptime: async () => {
    const response = await api.get('/system/uptime');
    return response.data;
  },
  getDatabaseStatus: async () => {
    const response = await api.get('/system/database/status');
    return response.data;
  },
  getPerformance: async () => {
    const response = await api.get('/system/performance');
    return response.data;
  },
  getStorage: async () => {
    const response = await api.get('/system/storage');
    return response.data;
  },
  recalculateStats: async () => {
    const response = await api.post('/system/recalculate-stats');
    return response.data;
  },
  reindex: async () => {
    const response = await api.post('/system/reindex');
    return response.data;
  },
};

export default adminService;
