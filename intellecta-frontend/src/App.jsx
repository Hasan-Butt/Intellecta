import "./styles/global.css";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { ThemeProvider } from "./context/ThemeContext";

/**
 * App.jsx acts as the global wrapper. 
 * Keep this file thin so it's easy to manage global settings.
 */
function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* You can wrap AppRoutes in global Layouts here later 
           (e.g., a Navbar or Footer that appears on every page) 
        */}
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
