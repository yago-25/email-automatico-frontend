import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ResetPassword.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Spin from "../../components/Spin/Spin";
import { api } from '../../api/api';
import { messageAlert } from "../../utils/messageAlert";
// import ButtonRegister from "../../components/Button/ButtonRegiser";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const email = location.state?.email || "";

  const handleVerify = async () => {
    navigate("/reset-password");
    if (!code) {
      messageAlert({
        type: 'error',
        message: 'Por favor, insira o e-mail para verificação.'
      });
      return;
    }

    // setLoading(true);

    // if (!email) {
    //   alert("E-mail não encontrado. Tente se cadastrar novamente.");
    //   return;
    // }
    // try {

    //   const response = await api.post('/validate-token', { code });

    //   if (response.status === 200) {
    //     messageAlert({
    //       type: 'success',
    //       message: "Token verificado com sucesso! Aguarde a aprovação do administrador."
    //     });
    //     navigate("/");
    //   } else {
    //     messageAlert({
    //       type: 'error',
    //       message: response.data.message || "Código inválido. Tente novamente."
    //     });
    //   }
    // } catch (error) {
    //   console.error("Erro ao verificar token:", error);
    //   messageAlert({
    //     type: 'error',
    //     message: "Erro ao conectar ao servidor. Tente novamente mais tarde."
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleLogin = () => {
    navigate("/");
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
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>
          <div className="input-login">
            <div className="card-content-area-login">
              <Input
                text={t("password_reset.confirm_password")}
                type="password"
                required={true}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="btn-tokene">
          <Button text={t("password_reset.button_text")} onClick={handleVerify} />
        </div>
        <div className="p">
          <p onClick={handleLogin} className="btn-back-homee">{t("password_reset.back")}</p>
        </div>
      </div>
    </div>
  );
  
};

export default ResetPassword;
