import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JoinPage from './pages/participant/JoinPage';
import LobbyPage from './pages/participant/LobbyPage';
import ChallengePage from './pages/participant/ChallengePage';
import LeaderboardPage from './pages/participant/LeaderboardPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Participant Routes */}
        <Route path="/" element={<JoinPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
