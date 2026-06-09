import api from './api';

const gameService = {
  getGames: async (params) => {
    const response = await api.get('/games', { params });
    return response.data;
  },
  getGameById: async (id) => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },
  createGame: async (gameData) => {
    const response = await api.post('/games', gameData);
    return response.data;
  },
  addMove: async (id, moveData) => {
    const response = await api.post(`/games/${id}/move`, moveData);
    return response.data;
  },
  endGame: async (id, endData) => {
    const response = await api.patch(`/games/${id}/end`, endData);
    return response.data;
  },
  bulkAction: async (type, data) => {
    const response = await api.post(`/games/bulk/${type}`, data);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/stats/total-matches'); // Using stats endpoint
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get('/analytics/victory-distribution');
    return response.data;
  }
};

export default gameService;
