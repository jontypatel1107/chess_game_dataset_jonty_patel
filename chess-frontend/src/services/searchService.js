import api from './api';

const searchService = {
  searchMatches: async (q, params) => {
    const response = await api.get('/search/matches', { params: { q, ...params } });
    return response.data;
  },
  searchPlayers: async (q) => {
    const response = await api.get('/search/players', { params: { q } });
    return response.data;
  },
  searchOpenings: async (q) => {
    const response = await api.get('/search/openings', { params: { q } });
    return response.data;
  },
  searchEco: async (q) => {
    const response = await api.get('/search/eco', { params: { q } });
    return response.data;
  },
  searchMoves: async (q) => {
    const response = await api.get('/search/moves', { params: { q } });
    return response.data;
  },
  fuzzySearch: async (q) => {
    const response = await api.get('/search/fuzzy', { params: { q } });
    return response.data;
  },
  autocomplete: async (q) => {
    const response = await api.get('/search/autocomplete', { params: { q } });
    return response.data;
  },
  getRecentSearches: async () => {
    const response = await api.get('/search/recent');
    return response.data;
  },
  getPopularSearches: async () => {
    const response = await api.get('/search/popular');
    return response.data;
  },
  advancedSearch: async (params) => {
    const response = await api.get('/search/advanced', { params });
    return response.data;
  },
  searchByRating: async (rating) => {
    const response = await api.get('/search/player-rating', { params: { rating } });
    return response.data;
  },
  searchByDateRange: async (from, to) => {
    const response = await api.get('/search/date-range', { params: { from, to } });
    return response.data;
  },
  searchOpeningFamily: async (q) => {
    const response = await api.get('/search/opening-family', { params: { q } });
    return response.data;
  },
  searchCheckmatePatterns: async (q) => {
    const response = await api.get('/search/checkmate-patterns', { params: { q } });
    return response.data;
  },
  searchEndgames: async (q) => {
    const response = await api.get('/search/endgames', { params: { q } });
    return response.data;
  },
};

export default searchService;
