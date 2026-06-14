import api from './api';

const tournamentService = {
  getAllTournaments: async (params) => {
    const response = await api.get('/tournaments', { params });
    return response.data;
  },
  getTournamentById: async (id) => {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },
  createTournament: async (data) => {
    const response = await api.post('/tournaments', data);
    return response.data;
  },
  updateTournament: async (id, data) => {
    const response = await api.put(`/tournaments/${id}`, data);
    return response.data;
  },
  deleteTournament: async (id) => {
    const response = await api.delete(`/tournaments/${id}`);
    return response.data;
  },
  registerForTournament: async (id) => {
    const response = await api.post(`/tournaments/${id}/register`);
    return response.data;
  },
  getTournamentStats: async () => {
    const response = await api.get('/tournaments/stats');
    return response.data;
  },
};

export default tournamentService;
