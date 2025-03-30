import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ResetPassword.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
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

  // Pegue o token e o email da URL
  const { email, token } = location.state || {};

  const handleResetPassword = async () => {
    if (!password || !passwordConfirmation) {
      messageAlert({
        type: 'error',
        message: 'Por favor, preencha todos os campos.',
      });
      return;
    }

    if (password !== passwordConfirmation) {
      messageAlert({
        type: 'error',
        message: 'As senhas não coincidem.',
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
          message: 'Senha redefinida com sucesso!',
        });
        navigate("/");
      }
    } catch (error) {
      messageAlert({
        type: 'error',
        message: "Erro ao redefinir senha. Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!i18n.isInitialized || loading) {
    return <Spin />;
  }

  return (
    <div className="container">
      <h1 className="title">{t("password_reset.title")}</h1>
      <div className="form-tokenee">
        <div className="card-contentee">
          <div className="input-login">
            <div className="card-content-area-login">
              <Input
                text={t("password_reset.new_password")}
                type="password"
                required={true}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="input-login">
            <div className="card-content-area-login">
              <Input
                text={t("password_reset.confirm_password")}
                type="password"
                required={true}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="btn-tokene">
          <Button text={t("password_reset.button_text")} onClick={handleResetPassword} />
        </div>
        <div className="p">
          <p onClick={() => navigate("/")} className="btn-back-homee">{t("password_reset.back")}</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
