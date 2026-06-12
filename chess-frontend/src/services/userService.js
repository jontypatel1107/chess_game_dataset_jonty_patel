import api from './api';

const userService = {
  getAllUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  getUserStats: async (id) => {
    const response = await api.get(`/users/${id}/stats`);
    return response.data;
  }
};

export default userService;
