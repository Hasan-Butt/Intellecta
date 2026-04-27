import "./styles/global.css";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
/**
 * App.jsx acts as the global wrapper. 
 * Keep this file thin so it's easy to manage global settings.
 */
function App() {
  return (
    <Router>
      {/* You can wrap AppRoutes in global Layouts here later 
         (e.g., a Navbar or Footer that appears on every page) 
      */}
      <AppRoutes />
    </Router>
  );
}

export default App;