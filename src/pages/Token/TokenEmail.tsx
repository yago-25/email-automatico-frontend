import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Input from "../../components/Input/Input";
import Spin from "../../components/Spin/Spin";
import { api } from '../../api/api';
import axios from 'axios';
import { messageAlert } from "../../utils/messageAlert";
import { BsShieldLock } from 'react-icons/bs';
import { HiArrowLeft } from 'react-icons/hi';

const TokenEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const email = location.state?.email || "";

  const handleVerify = async () => {
    setLoading(true);

    const trimmedCode = code.trim();

    if (trimmedCode.length !== 6) {
      messageAlert({
        type: 'error',
        message: t("email_verification.missing_code_email")
      });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/validate-token', { code: trimmedCode });

      if (response.status === 200) {
        messageAlert({
          type: 'success',
          message: t("email_verification.console_success")
        });
        navigate("/");
      } else {
        messageAlert({
          type: 'error',
          message: t("email_verification.invalid_code")
        });
      }
    } catch (error) {
      messageAlert({
        type: 'error',
        message: t("email_verification.token_error")
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendClick = () => {
    setResendTimer(30);
    handleResend();
  };
  
  const handleResend = async () => {
    if (!email) {
      messageAlert({
        type: 'error',
        message: t("password_reset_email.invalid_email")
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/resend-token", { email });
      if (response.status === 201) {
        messageAlert({
          type: 'success',
          message: t("email_verification.token_resent")
        });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        messageAlert({
          type: 'error',
          message: error.response?.data?.message || t("email_verification.resend_error")
        });
      } else {
        messageAlert({
          type: 'error',
          message: t("email_verification.server_error")
        });
      }
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
            {t("email_verification.title")}
          </h1>
          <p className="text-blue-100/80 text-sm">
            {t("email_verification.instructions")}
          </p>
        </div>
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <BsShieldLock className="h-5 w-5 text-blue-200" />
            </div>
            <Input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="pl-10 w-full bg-white/10 border border-blue-200/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500"
              text={t("email_verification.verification_code")}
              placeholder={t("email_verification.code_placeholder")}
            />
          </div>
          <button
            onClick={handleVerify}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            {t("email_verification.verify_button")}
            <BsShieldLock className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <div className="text-center">
            <p className="text-blue-100/80 text-xs">
              {t("email_verification.didnt_receive_code")}{" "}
              <button
                type="button"
                onClick={handleResendClick}
                className={`text-blue-300 hover:underline cursor-pointer bg-transparent border-none outline-none disabled:text-gray-400 disabled:cursor-not-allowed`}
                disabled={resendTimer > 0}
              >
                {resendTimer > 0
                  ? `${t("email_verification.resend_button")} (${resendTimer}s)`
                  : t("email_verification.resend_button")}
              </button>
            </p>
          </div>
          <div className="text-center pt-2">
            <button
              onClick={handleLogin}
              className="text-blue-200 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm mx-auto"
            >
              <HiArrowLeft className="w-4 h-4" />
              {t("email_verification.back_button")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenEmail;
