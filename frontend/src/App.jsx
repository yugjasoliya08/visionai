import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CodeEditor from "./components/CodeEditor";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";

// Protected Route Helper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Editor Route: Dynamic docId */}
        <Route
          path="/editor/:docId"
          element={
            <ProtectedRoute>
              <CodeEditor />
            </ProtectedRoute>
          }
        />

        {/* Initial Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Catch-all Redirect to Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;