import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Download, ChevronDown, Eye, Copy, X, Swords } from 'lucide-react';
import { toast } from 'react-toastify';

import gameService from '../../services/gameService';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

const DataListing = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ timeControl: '', rated: '' });

  // Detail Modal State
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const response = await gameService.getGames({ 
        page, 
        search,
        timeControl: filters.timeControl,
        rated: filters.rated,
        limit: 10
      });
      setGames(response.data || []);
      setTotalPages(response.pagination?.totalPages || 0);
    } catch (error) {
      toast.error('Failed to load dataset');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchGames(), 300);
    return () => clearTimeout(timeoutId);
  }, [fetchGames]);

  const handleRowClick = async (game) => {
    setDetailsLoading(true);
    setIsModalOpen(true);
    try {
      const res = await gameService.getGameById(game._id);
      setSelectedGame(res.data);
    } catch (error) {
      toast.error("Could not load game moves");
      setIsModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const copyPgn = () => {
    if (!selectedGame) return;
    const pgn = selectedGame.moveText || selectedGame.moves?.map(m => m.notation).join(' ');
    navigator.clipboard.writeText(pgn);
    toast.success("PGN copied to clipboard!");
  };

  const columns = [
    {
      header: 'Players',
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-300 shadow-sm" />
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{row.whitePlayer?.username || 'Unknown'}</span>
            <span className="text-[10px] font-black text-slate-400">({row.whitePlayer?.rating || row.playerRatings?.white || '?'})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-slate-700 shadow-sm" />
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{row.blackPlayer?.username || 'Unknown'}</span>
            <span className="text-[10px] font-black text-slate-400">({row.blackPlayer?.rating || row.playerRatings?.black || '?'})</span>
          </div>
        </div>
      )
    },
    {
      header: 'Format',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">{row.timeControl || 'Standard'}</span>
          <span className="text-[10px] font-bold text-slate-500">{row.rated ? '🏆 Rated' : '☕ Casual'}</span>
        </div>
      )
    },
    {
      header: 'Opening',
      cell: (row) => (
        <div className="max-w-[180px]">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={row.opening?.name}>{row.opening?.name || 'Unknown Opening'}</div>
          <div className="text-[10px] font-mono font-bold text-slate-400">{row.opening?.eco || '-'}</div>
        </div>
      )
    },
    {
      header: 'Result',
      cell: (row) => {
        let color = "text-slate-700 bg-slate-200 dark:bg-slate-800 dark:text-slate-300";
        let text = "Draw";
        if (row.result === 'white_wins' || row.winner === row.whitePlayer?._id) { 
          color = "text-emerald-800 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400"; text = "White Won"; 
        } else if (row.result === 'black_wins' || row.winner === row.blackPlayer?._id) { 
          color = "text-emerald-800 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400"; text = "Black Won"; 
        }
        return (
          <div className="flex flex-col gap-1">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md w-fit uppercase ${color}`}>{text}</span>
            <span className="text-[10px] text-slate-600 font-bold italic px-1">{row.endReason || 'Completed'}</span>
          </div>
        );
      }
    },
    {
      header: 'Total Moves',
      accessor: 'totalMoves',
      cell: (row) => <span className="font-mono font-black text-slate-800 dark:text-slate-200">{row.totalMoves || 0}</span>
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
          <Eye size={16} />
        </button>
      )
    }
  ];

  const inputClasses = "w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl border-2 border-slate-300 bg-white text-slate-950 placeholder-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 shadow-sm";
  const selectClasses = "appearance-none w-full bg-white border-2 border-slate-300 text-slate-950 font-bold text-sm rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all cursor-pointer dark:bg-slate-950 dark:border-slate-700 dark:text-white shadow-sm";

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dataset Explorer | Chess Analytics</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight uppercase">Dataset Explorer</h1>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Browse historical matches and analyze game moves.</p>
        </div>
        <Button variant="outline" className="!rounded-xl border-2 font-black shadow-sm" icon={Download} onClick={() => toast.info('Export functionality coming soon!')}>
          Export CSV
        </Button>
      </div>

      <Card className="!p-4 border-none shadow-md overflow-visible bg-white dark:bg-slate-900/40">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
            <input type="text" placeholder="Search openings..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className={inputClasses} />
          </div>
          <div className="relative">
            <select className={selectClasses} onChange={(e) => { setFilters({...filters, timeControl: e.target.value}); setPage(1); }} value={filters.timeControl}>
              <option value="">All Formats</option>
              <option value="blitz">⚡ Blitz</option>
              <option value="rapid">⏱️ Rapid</option>
              <option value="classical">🐢 Classical</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" size={20} />
          </div>
          <div className="relative">
            <select className={selectClasses} onChange={(e) => { setFilters({...filters, rated: e.target.value}); setPage(1); }} value={filters.rated}>
              <option value="">All Match Types</option>
              <option value="true">🏆 Rated</option>
              <option value="false">☕ Casual</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" size={20} />
          </div>
          <Button variant="ghost" className="!rounded-xl text-slate-700 font-black" onClick={() => { setSearch(''); setFilters({timeControl:'', rated:''}); setPage(1); }}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="!p-0 border-none shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <Table columns={columns} data={games} loading={loading} onRowClick={handleRowClick} emptyMessage="No matches found." />
        <div className="p-5 border-t dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <span className="text-xs font-black text-slate-500 uppercase">Page {page} of {totalPages || 1}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="!rounded-lg border-2 font-black" disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" className="!rounded-lg border-2 font-black" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>

      {/* MOVE VIEWER MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg" title="Game Analysis">
        {detailsLoading ? <div className="py-20"><Loader /></div> : selectedGame && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl gap-4">
               <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-400 uppercase">White</p>
                    <p className="font-bold text-slate-900 dark:text-white">{selectedGame.whitePlayer?.username}</p>
                    <p className="text-xs font-bold text-indigo-600">{selectedGame.whitePlayer?.rating}</p>
                  </div>
                  <Swords className="text-slate-300" size={24} />
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-400 uppercase">Black</p>
                    <p className="font-bold text-slate-900 dark:text-white">{selectedGame.blackPlayer?.username}</p>
                    <p className="text-xs font-bold text-indigo-600">{selectedGame.blackPlayer?.rating}</p>
                  </div>
               </div>
               <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-4 sm:pt-0 sm:pl-6">
                  <p className="text-xs font-black text-slate-400 uppercase">Result</p>
                  <p className="text-lg font-black text-indigo-600">{selectedGame.result === 'white_wins' ? '1 - 0' : selectedGame.result === 'black_wins' ? '0 - 1' : '½ - ½'}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{selectedGame.endReason}</p>
               </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm flex items-center gap-2">
                  Match History <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-500">{selectedGame.totalMoves} Moves</span>
                </h4>
                <button onClick={copyPgn} className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  <Copy size={14} /> Copy PGN
                </button>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm leading-loose h-64 overflow-y-auto custom-scrollbar border-4 border-slate-800 shadow-inner">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-2 gap-x-4">
                  {(selectedGame.moveText || selectedGame.moves?.map(m => m.notation).join(' ')).split(' ').map((move, i) => {
                    const isWhiteMove = i % 2 === 0;
                    const moveNum = Math.floor(i / 2) + 1;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        {isWhiteMove && <span className="text-slate-600 text-[10px] w-4">{moveNum}.</span>}
                        <span className={`px-2 py-0.5 rounded ${isWhiteMove ? 'text-white' : 'text-slate-400'} hover:bg-slate-800 cursor-default transition-colors`}>
                          {move}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Opening</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{selectedGame.opening?.name || 'Standard'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">ECO Code</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedGame.opening?.eco || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DataListing;
