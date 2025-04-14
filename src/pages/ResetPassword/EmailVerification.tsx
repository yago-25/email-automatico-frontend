import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./EmailVerification.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
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
        message: 'Por favor, insira o e-mail para verificação.',
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
        message: "E-mail invalido. Tente novamente mais tarde.",
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
          {/* Email Input */}
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

          {/* Verificar Email Button */}
          <div>
            <Button
              text={t("password_reset_email.verify_email_button")}
              onClick={handleVerify}
             
            />
          </div>

          {/* Spacer */}
          <div className="p"></div>

          {/* Back to Login Button */}
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
