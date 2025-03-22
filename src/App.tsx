import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login/Login'
import { useState } from 'react';
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} redirectPath="/" />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;