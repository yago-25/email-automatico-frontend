import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Input from "../../components/Input/Input";
import Spin from "../../components/Spin/Spin";
import { api } from '../../api/api';
import { messageAlert } from "../../utils/messageAlert";
import { BsShieldLock } from 'react-icons/bs';
import { HiArrowLeft, HiMail } from 'react-icons/hi';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state?.email]);

  const handleVerify = async () => {
    if (!email) {
      messageAlert({
        type: 'error',
        message: t('auth.forgot.email_required'),
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/password/forgot', { email });

      if (response.status === 200) {
        messageAlert({
          type: 'success',
          message: response.data.message,
        });
        navigate("/token-reset", { state: { email } });
      }
    } catch (error) {
      messageAlert({
        type: 'error',
        message: t('auth.forgot.invalid_email'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/");
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
            {t("password_reset_email.title")}
          </h1>
          <p className="text-blue-100/80 text-sm">
            {t("email_verification.instructions")}
          </p>
        </div>
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <HiMail className="h-5 w-5 text-blue-200" />
            </div>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 w-full bg-white/10 border border-blue-200/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500"
              text={t("password_reset_email.email_input")}
              placeholder={t("password_reset_email.email_placeholder")}
            />
          </div>
          <button
            onClick={handleVerify}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            {t("password_reset_email.verify_email_button")}
            <BsShieldLock className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <div className="text-center pt-2">
            <button
              onClick={handleLogin}
              className="text-blue-200 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm mx-auto"
            >
              <HiArrowLeft className="w-4 h-4" />
              {t("password_reset_email.back")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
