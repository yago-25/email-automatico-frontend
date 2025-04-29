import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './index.css';
import Login from './pages/Login/Login';
import Ticket from './pages/Ticket/Ticket';
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
import Approve from './pages/Approve/Approve';
import Settings from './pages/Settings/UserTable';

import Clients from './pages/Clients/Clients';
import Profile from './pages/Profile/Profile';
import Calendar from './pages/Calendar/Calendar';
import SmsPage from './pages/Sms/SmsPage';
import SmsCreatePage from './pages/Sms/SmsCreatePage';
import Mails from './pages/Mails/Mails';
import MailsCreate from './pages/Mails/MailsCreate';

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
            <Route path="/ticket" element={
              <AuthenticatedLayout>
                <Ticket />
              </AuthenticatedLayout>
            } />
            <Route path="/profile" element={
              <AuthenticatedLayout>
                <Profile />
              </AuthenticatedLayout>
            } />
            <Route path="/approve" element={
              <AuthenticatedLayout>
                <Approve />
              </AuthenticatedLayout>
            } />
            <Route path="/ticket/:id" element={
              <AuthenticatedLayout>
                <Ticket />
              </AuthenticatedLayout>
            } />
            <Route path="/calendar" element={
              <AuthenticatedLayout>
                <Calendar />
              </AuthenticatedLayout>
            } />
             <Route path="/settings" element={
              <AuthenticatedLayout>
                <Settings />
              </AuthenticatedLayout>
            } />
             <Route path="/sms" element={
              <AuthenticatedLayout>
                <SmsPage />
              </AuthenticatedLayout>
            } />
             <Route path="/sms/create" element={
              <AuthenticatedLayout>
                <SmsCreatePage />
              </AuthenticatedLayout>
            } />
            <Route path="/mails" element={
              <AuthenticatedLayout>
                <Mails />
              </AuthenticatedLayout>
            } />
            <Route path="/mails/create" element={
              <AuthenticatedLayout>
                <MailsCreate />
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
