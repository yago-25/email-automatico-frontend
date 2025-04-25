import { useRef, useState } from 'react';
import './style.css';
import Input from '../../components/Input/Input';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { messageAlert } from '../../utils/messageAlert';
import Spin from '../../components/Spin/Spin';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { loginWithGoogle, login } = useAuth();
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!user || !password) {
      messageAlert({
        type: 'error',
        message: t('login_page.fill_all_fields')
      });
      if (inputRef && inputRef.current) inputRef.current.focus();
      return;
    }
  
    setLoading(true);
  
    try {
      const { accessToken, cargo } = await login(user, password);  // Ajustado para acessar 'accessToken' em vez de 'token'
      
      // Salvar o accessToken e o cargo no localStorage
      localStorage.setItem('token', accessToken);  // Usando accessToken
      localStorage.setItem('cargo', cargo);  // Salvando o cargo
  
      messageAlert({
        type: 'success',
        message: t('login_page.success')
      });
  
      // Navegar para a dashboard ou página principal
      navigate('/dashboard');
    } catch (e) {
      messageAlert({
        type: 'error',
        message: t('login_page.error')
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setLoading(true);
      try {
        await loginWithGoogle(credentialResponse.credential);
        messageAlert({ type: 'success', message: t('login_page.success_google') });
      } catch {
        messageAlert({ type: 'error', message: t('login_page.error_google') });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleError = () => {
    messageAlert({ type: 'error', message: t('login_page.error_google') });
  };

  const handleRegister = () => {
    navigate("/register");
  };
  const handleResetPassword = () => {
    navigate("/email-verification");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  if (!i18n.isInitialized || loading) {
    return (
      <Spin />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 px-4">
      <div className="w-full max-w-md bg-blue-100 rounded-2xl shadow-xl p-10 space-y-6 bg-opacity-75">
        <h1 className="text-3xl font-bold text-center text-blue-800">
          {t("login_page.title")}
        </h1>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              {t("login_page.email_label")}
            </label>
            <Input
              ref={inputRef}
              type="text"
              required={true}
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onKeyDown={handleKeyDown}

            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              {t("login_page.password_label")}
            </label>
            <Input
              type="password"
              required={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="text-center">
            <button
              onClick={handleResetPassword}
              className="text-sm text-blue-700 hover:underline"
            >
              {t("login_page.forgot_password")}
            </button>
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-200"
          >
            {t("login_page.login_button")}
          </button>
          <div className="flex justify-center mt-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </div>
        </div>
        <div className="text-center text-sm text-blue-900">
          <p>
            {t("login_page.no_account")}{" "}
            <button
              onClick={handleRegister}
              className="text-blue-800 font-semibold hover:underline"
            >
              {t("login_page.signup")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
