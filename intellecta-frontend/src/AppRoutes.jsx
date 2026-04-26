import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Auth/Login";
import DashboardPage from "./pages/Dashboard/Dashboard";
import NotesPage from "./pages/Notes/Notespage";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/notes" element={<NotesPage />} />
    </Routes>
  );
}
