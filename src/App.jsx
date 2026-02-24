import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JoinPage from './pages/participant/JoinPage';
import ParticipantLayout from './pages/participant/ParticipantLayout';
import LobbyPage from './pages/participant/LobbyPage';
import ChallengePage from './pages/participant/ChallengePage';
import LeaderboardPage from './pages/participant/LeaderboardPage';
import ActivityPage from './pages/participant/ActivityPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinPage />} />
        {/* Participant dashboard with sidebar */}
        <Route element={<ParticipantLayout />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/activity" element={<ActivityPage />} />
        </Route>
        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
