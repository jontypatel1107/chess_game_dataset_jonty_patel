import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy loaded pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const UserManagement = lazy(() => import('./pages/users/UserManagement'));
const DataListing = lazy(() => import('./pages/data/DataListing'));
const Analytics = lazy(() => import('./pages/analytics/Analytics'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Leaderboard = lazy(() => import('./pages/leaderboard/Leaderboard'));
const Openings = lazy(() => import('./pages/openings/Openings'));
const Players = lazy(() => import('./pages/players/Players'));
const PlayerProfile = lazy(() => import('./pages/players/PlayerProfile'));
const Tournaments = lazy(() => import('./pages/tournaments/Tournaments'));
const TournamentDetail = lazy(() => import('./pages/tournaments/TournamentDetail'));
const SearchPage = lazy(() => import('./pages/search/Search'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Suspense fallback={<Loader fullPage />}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/" />} 
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/data" element={<DataListing />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/openings" element={<Openings />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/players" element={<Players />} />
              <Route path="/players/:username" element={<PlayerProfile />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </Suspense>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;
