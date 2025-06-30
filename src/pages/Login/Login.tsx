import { useRef, useState } from 'react';
import './style.css';
import Input from '../../components/Input/Input';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { messageAlert } from '../../utils/messageAlert';
import Spin from '../../components/Spin/Spin';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';
// import { FaGoogle } from 'react-icons/fa';
import { BsShieldLock } from 'react-icons/bs';

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
      const { accessToken, cargo } = await login(user, password);

      localStorage.setItem('token', accessToken);
      localStorage.setItem('cargo', cargo);

      messageAlert({
        type: 'success',
        message: t('login_page.success')
      });

      navigate('/dashboard');
    } catch (e) {
      messageAlert({
        type: 'error',
        message: t('login_page.loginorpassword')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
  if (credentialResponse.credential) {
    setLoading(true);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);

      if (res.status === 200) {
        messageAlert({ type: 'success', message: t('login_page.success_google') });
      } else if (res.status === 202) {
        messageAlert({ type: 'info', message: t('login_page.request_sent') });
      }
    } catch (error: any) {
      // ⬇️ Adicione isso pra debug (temporariamente)
      console.error("ERRO GOOGLE:", error.response?.status, error.response?.data);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 409) {
          messageAlert({ type: 'info', message: message || t('login_page.request_already_sent') });
        } else if (status === 401 || status === 422) {
          messageAlert({ type: 'error', message: message || t('login_page.error_google') });
        } else {
          messageAlert({ type: 'error', message: t('login_page.error_google') });
        }
      } else {
        messageAlert({ type: 'error', message: t('login_page.error_google') });
      }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900">
        <Spin />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block p-3 rounded-full bg-blue-600/20 mb-4">
            <BsShieldLock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            {t("login_page.title")}
          </h1>
          <p className="text-blue-100/80 text-sm">
            {t("login_page.welcome_back")}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <HiMail className="h-5 w-5 text-blue-200" />
              </div>
              <Input
                ref={inputRef}
                type="text"
                required={true}
                value={user}
                onChange={(e) => setUser(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 w-full bg-white/10 border border-blue-200/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500"
                text={t("login_page.email_label")}
                placeholder={t("login_page.email_placeholder")}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <HiLockClosed className="h-5 w-5 text-blue-200" />
              </div>
              <Input
                type="password"
                required={true}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 w-full bg-white/10 border border-blue-200/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500"
                text={t("login_page.password_label")}
                placeholder={t("login_page.password_placeholder")}
              />
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={handleResetPassword}
              className="text-sm text-blue-200 hover:text-white transition-colors"
            >
              {t("login_page.forgot_password")}
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              {t("login_page.login_button")}
              <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-200/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-blue-200">
                  {t("login_page.or_continue_with")}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                type="icon"
                shape="circle"
                theme="filled_blue"
                size="large"
              />
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-blue-100">
          <p>
            {t("login_page.no_account")}{" "}
            <button
              onClick={handleRegister}
              className="text-blue-300 font-semibold hover:text-white transition-colors"
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
