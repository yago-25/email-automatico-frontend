import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ResetPassword.css";
import Input from "../../components/Input/Input";
// import Button from "../../components/Button/Button";
import Spin from "../../components/Spin/Spin";
import { api } from '../../api/api';
import { messageAlert } from "../../utils/messageAlert";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const { email, token } = location.state || {};

  const handleResetPassword = async () => {
    if (!password || !passwordConfirmation) {
      messageAlert({
        type: 'error',
        message: t("password_reset.fill_all_fields"),
      });
      return;
    }

    if (password !== passwordConfirmation) {
      messageAlert({
        type: 'error',
        message: t("password_reset.passwords_do_not_match"),
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/reset-password', {
        email,
        senha: password,
        senha_confirmation: passwordConfirmation,
        token
      });

      if (response.status === 200) {
        messageAlert({
          type: 'success',
          message: t("password_reset.success"),
        });
        navigate("/");
      }
    } catch (error) {
      messageAlert({
        type: 'error',
        message: t("password_reset.error"),
      });
    } finally {
      setLoading(false);
    }
  };


  if (!i18n.isInitialized || loading) {
    return <Spin />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 px-4">
      <div className="w-full max-w-md bg-blue-100 rounded-2xl shadow-xl p-10 space-y-6 bg-opacity-75">
        <h1 className="text-3xl font-bold text-center text-blue-800">
          {t("password_reset.title")}
        </h1>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              {t("password_reset.new_password")}
            </label>
            <Input
              type="password"
              required={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              {t("password_reset.confirm_password")}
            </label>
            <Input
              type="password"
              required={true}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>
          <div className="text-center">
            <button
              onClick={handleResetPassword}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-200"
              > {t("password_reset.button_text")}
              </button>
          </div>
          <div className="text-center">
            <p
              onClick={() => navigate("/")}
              className="text-blue-800 font-semibold cursor-pointer hover:underline"
            >
              {t("password_reset.back")}
            </p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default ResetPassword;
