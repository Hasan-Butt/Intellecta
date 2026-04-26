import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Auth/Login";
import DashboardPage from "./pages/Dashboard/Dashboard";
import NotesPage from "./pages/Notes/Notespage";
import UsersPage from "./pages/Dashboard/Users";
import ContentPage from "./pages/Dashboard/Content.jsx";
import AnalyticsPage from "./pages/Dashboard/Analytics.jsx";
import ConfigurationPage from './pages/Dashboard/Configuration.jsx';
import SupportPage from './pages/Dashboard/Support.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/notes" element={<NotesPage />} />
      <Route path="/users" element={<UsersPage />} /> 
      <Route path="/content" element={<ContentPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/configuration" element={<ConfigurationPage />} />
      <Route path="/support" element={<SupportPage />} />
    </Routes>
  );
}