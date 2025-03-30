import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login/Login'
import Register from "./pages/Register/Register";
import Token from "./pages/Token/TokenEmail";
import EmailVerification from "./pages/ResetPassword/EmailVerification";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import TokenReset from "./pages/ResetPassword/TokenReset";
import { useState } from 'react';
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/token" element={<Token />} />
        <Route path="/token-reset" element={<TokenReset />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} redirectPath="/" />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;