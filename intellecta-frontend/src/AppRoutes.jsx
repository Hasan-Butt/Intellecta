import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Auth/Login";
import DashboardPage from "./pages/Dashboard/adminDashboard";
import NotesPage from "./pages/Notes/Notespage";
import UsersPage from "./pages/Dashboard/Users";
import ContentPage from "./pages/Dashboard/Content.jsx";
import AnalyticsPage from "./pages/Dashboard/Analytics.jsx";
import PerformanceTrends from "./pages/Dashboard/PerformanceTrends.jsx";
import ConfigurationPage from "./pages/Dashboard/Configuration.jsx";
import StudentDashboardPage from "./pages/StudentDashboard/Dashboard";
import QuizList from "./pages/Quiz/QuizList";
import AttemptQuiz from "./pages/Quiz/AttemptQuiz";
import Result from "./pages/Quiz/Result";
import Leaderboard from "./pages/Leaderboard/leaderboard";
import PeerComparison from "./pages/Leaderboard/peerComparison";
import DistractionLog from "./pages/DistractionLog/distraction";
import FocusSession from "./pages/DistractionLog/focus";
import CoverageTrackerPage from "./pages/CoverageTracker/CoverageTrackerPage";
import SubjectFolderPage from "./pages/SubjectFolder/SubjectFolderpage";
import StudySessionPage from "./pages/FocusSession/Session"
import StudySchedulePage from "./pages/StudySchedule/StudySchedulePage"


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
      <Route path="/trends" element={<PerformanceTrends />} />
      <Route path="/configuration" element={<ConfigurationPage />} />
      <Route path="/quiz" element={<QuizList />} />
      <Route path="/AttemptQuiz" element={<AttemptQuiz />} />
      <Route path="/Result" element={<Result />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/peers" element={<PeerComparison />} />
      <Route path="/distractions" element={<DistractionLog />} />
      <Route path="/focusSession" element={<FocusSession />} />
      <Route path="/folders" element={<SubjectFolderPage />} />
      <Route path="/coverage" element={<CoverageTrackerPage />} />
      <Route path="/focus" element={<StudySessionPage/>}/>
      <Route path="/schedule" element={<StudySchedulePage/>}/>

    </Routes>
  );
}
