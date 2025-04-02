import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Token from './pages/Token/TokenEmail';
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import AuthenticatedLayout from './pages/AuthenticatedLayout/AuthenticatedLayout';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/token" element={<Token />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
