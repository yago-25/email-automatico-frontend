import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./TokenEmail.css";
import Input from "../../components/Input/Input";
// import Button from "../../components/Button/Button";
import Spin from "../../components/Spin/Spin";
import { api } from '../../api/api';
import axios from 'axios';
import { messageAlert } from "../../utils/messageAlert";
// import ButtonRegister from "../../components/Button/ButtonRegiser";

const TokenEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const email = location.state?.email || "";

  const handleVerify = async () => {
    setLoading(true);

    if (!code) {
      messageAlert({
        type: 'error',
        message: t("email_verification.missing_code_email")
      });
      setLoading(false);
      return;
    }
    try {
      const response = await api.post('/validate-token', { code });

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
        message: t("email_verification.server_error")
      });
    } finally {
      setLoading(false);
    }
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
      console.error(t("email_verification.resend_error"));
    
      if (axios.isAxiosError(error)) {
      
        messageAlert({
          type: 'error',
          message: error.response?.data?.message ||t("email_verification.resend_error")
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
      return <Spin />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 px-4">
        <div className="w-full max-w-md bg-blue-100 rounded-2xl shadow-xl p-10 space-y-6 bg-opacity-75">
          <h1 className="text-3xl font-bold text-center text-blue-800">
            {t("email_verification.title")}
          </h1>

          <div className="space-y-5">
            {/* Código de Verificação */}
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">
                {t("email_verification.verification_code")}
              </label>
              <Input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}

              />
            </div>

            {/* Botão de Verificação */}
            <div>
              <button
                onClick={handleVerify}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-200"
              >
                {t("email_verification.verify_button")}
              </button>

            </div>

            {/* Aviso de reenvio do código */}
            <div className="text-center">
              <p style={{ color: "white", fontSize: "12px" }}>
                {t("email_verification.didnt_receive_code")}{" "}
                <a
                  href="#"
                  onClick={handleResend}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  {t("email_verification.resend_button")}
                </a>
              </p>
            </div>

            {/* Spacer */}
            <div className="p"></div>

            {/* Voltar ao Login */}
            <div className="text-center">
              <p
                onClick={handleLogin}
                className="text-sm text-blue-700 hover:underline cursor-pointer"
              >
                {t("email_verification.back_button")}
              </p>
            </div>
          </div>
        </div>
      </div>

    );
  };

  export default TokenEmail;
