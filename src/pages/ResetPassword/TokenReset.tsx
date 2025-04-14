import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./TokenReset.css";
import Input from "../../components/Input/Input";
// import Button from "../../components/Button/Button";
import Spin from "../../components/Spin/Spin";
import { api } from '../../api/api';
import { messageAlert } from "../../utils/messageAlert";

const TokenReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const email = location.state?.email || "";

  const handleVerify = async () => {
    setLoading(true);

    if (!code || !email) {
      messageAlert({
        type: 'error',
        message: t("email_verification.missing_code_email"),
      });
      console.log(t("email_verification.console_missing_code_email"));
      setLoading(false);
      return;
    }

    console.log(t("email_verification.console_verification_start"), email);

    try {
      console.log(t("email_verification.console_sending_to_api"), { email, code });

      const response = await api.post('/reset-token', { email, code });

      if (response.status === 200) {
        console.log(t("email_verification.console_success"), email);

        messageAlert({
          type: 'success',
          message: t("email_verification.success"),
        });

        navigate("/reset-password", { state: { email, token: code } });
      } else {
        console.log(t("email_verification.console_failed"), email, response.data.message);

        messageAlert({
          type: 'error',
          message: response.data.message || t("email_verification.invalid_code"),
        });
      }
    } catch (error) {
      console.error(t("email_verification.console_error"), error);

      messageAlert({
        type: 'error',
        message: t("email_verification.server_error"),
      });
    } finally {
      setLoading(false);
      console.log(t("email_verification.console_verification_end"));
    }
  };

  const handleResend = async () => {
    console.log(t("email_verification.console_resend"), email);

    setLoading(true);

    try {
      const response = await api.post('/password/forgot', { email });

      if (response.status === 200) {
        messageAlert({
          type: 'success',
          message: t("email_verification.token_resent"),
        });
      }
    } catch (error) {
      messageAlert({
        type: 'error',
        message: t("email_verification.resend_error"),
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
          {t("email_verification.title")}
        </h1>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              {t("email_verification.verification_code")}
            </label>
            <Input
              type="text"
              required={true}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="text-center">
            <button
              onClick={handleVerify}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-200"
              >
              {t("email_verification.verify_button")}
            </button>
          </div>
          <div className="text-center text-sm">
            <p className="text-white">
              {t("email_verification.didnt_receive_code")}{" "}
              <a
                href="#"
                onClick={handleResend}
                className="text-blue-700 hover:underline cursor-pointer"
              >
                {t("email_verification.resend_button")}
              </a>
            </p>
          </div>
          <div className="text-center">
            <p
              onClick={handleLogin}
              className="text-blue-800 font-semibold cursor-pointer hover:underline"
            >
              {t("email_verification.back_button")}
            </p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default TokenReset;
