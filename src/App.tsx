import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './index.css';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Token from './pages/Token/TokenEmail';
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import AuthenticatedLayout from './pages/AuthenticatedLayout/AuthenticatedLayout';
import { AuthProvider } from './context/AuthContext';
import TraductionButton from './components/TraductionButton/TraductionButton';
import TokenReset from './pages/ResetPassword/TokenReset';
import EmailVerification from './pages/ResetPassword/EmailVerification';
import ResetPassword from './pages/ResetPassword/ResetPassword';


import Clients from './pages/Clients/Clients';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/token" element={<Token />} />
          <Route path="/token-reset" element={<TokenReset />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            } />
            <Route path="/clients" element={
              <AuthenticatedLayout>
                <Clients />
              </AuthenticatedLayout>
            } />
          </Route>
        </Routes>
        <TraductionButton />
      </AuthProvider>
    </Router>
  );
}

export default App;
