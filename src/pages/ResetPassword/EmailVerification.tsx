import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./EmailVerification.css";
import Input from "../../components/Input/Input";
// import Button from "../../components/Button/Button";
import Spin from "../../components/Spin/Spin";
import { api } from '../../api/api';
import { messageAlert } from "../../utils/messageAlert";

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
    return <Spin />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 px-4">
      <div className="w-full max-w-md bg-blue-100 rounded-2xl shadow-xl p-10 space-y-6 bg-opacity-75">
        <h1 className="text-3xl font-bold text-center text-blue-800">
          {t("password_reset_email.title")}
        </h1>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              {t("password_reset_email.email_input")}
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}

            />
          </div>
          <div>
            <button
              onClick={handleVerify}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-200"
              >
              {t("password_reset_email.verify_email_button")}
            </button>
          </div>
          <div className="p"></div>

          <div className="text-center">
            <p
              onClick={handleLogin}
              className="text-sm text-blue-700 hover:underline cursor-pointer"
            >
              {t("password_reset_email.back")}
            </p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default EmailVerification;
