import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Auth/Login";
import DashboardPage from "./pages/Dashboard/Dashboard";
import NotesPage from "./pages/Notes/Notespage";
import UsersPage from "./pages/Dashboard/Users";
import ContentPage from "./pages/Dashboard/Content.jsx";
import AnalyticsPage from "./pages/Dashboard/Analytics.jsx";
import ConfigurationPage from "./pages/Dashboard/Configuration.jsx";
import SupportPage from "./pages/Dashboard/Support.jsx";
import StudentDashboardPage from "./pages/StudentDashboard/Dashboard";
import QuizList from "./pages/Quiz/QuizList";
import AttemptQuiz from "./pages/Quiz/AttemptQuiz";
import Result from "./pages/Quiz/Result";
import Leaderboard from "./pages/Leaderboard/leaderboard";
import PeerComparison from "./pages/Leaderboard/peerComparison";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/studentDashboard" element={<StudentDashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/content" element={<ContentPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/configuration" element={<ConfigurationPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/quiz" element={<QuizList />} />
      <Route path="/AttemptQuiz" element={<AttemptQuiz />} />
      <Route path="/Result" element={<Result />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/peers" element={<PeerComparison />} />
    </Routes>
  );
}