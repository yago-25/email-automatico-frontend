import React, { useState, useEffect } from "react";  // Importar o useEffect junto com useState
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
  const [email, setEmail] = useState(""); // Variável de estado 'email'
  const [loading, setLoading] = useState(false);

  // Definir o e-mail de location.state, caso exista
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

  // Função para reenviar o token de verificação
  // const handleResend = async () => {
  //   if (!email) {
  //     messageAlert({
  //       type: 'error',
  //       message: 'Por favor, insira o e-mail para reenvio do token.',
  //     });
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const response = await api.post('/password/forgot', { email });

  //     if (response.status === 200) {
  //       messageAlert({
  //         type: 'success',
  //         message: 'O token de redefinição de senha foi reenviado para o seu e-mail.',
  //       });
  //     }
  //   } catch (error) {
  //     messageAlert({
  //       type: 'error',
  //       message: "Erro ao reenviar o token de redefinição. Tente novamente mais tarde.",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // Função de navegação para a tela de login
  const handleLogin = () => {
    navigate("/"); // Navega para a página de login
  };

  // Exibe a tela de carregamento se o i18n ainda não estiver inicializado ou se a requisição estiver carregando
  if (!i18n.isInitialized || loading) {
    return <Spin />;
  }

  return (
    <div className="container">
      <h1 className="title">{t("password_reset_email.title")}</h1>
      <div className="form-token">
        <div className="card-contente">
          <div className="card-content-area-login">
            <Input
              text={t("password_reset_email.email_input")}
              type="email" 
              required={true}
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Atualiza o estado 'email'
            />
          </div>
        </div>
        <div className="btn-tokene">
          <Button text={t("password_reset_email.verify_email_button")} onClick={handleVerify} />
        </div>
        {/* <div className="card-footer-note">
          <p style={{ color: "white", fontSize: "12px" }}>
            {t("password_reset_email.didnt_receive_code")}{" "}
            <a
              href="#"
              onClick={handleResend}
              style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
            >
              {t("password_reset_email.resend_button")}
            </a>
          </p>
        </div> */}
        <div className="p"></div>
        <p onClick={handleLogin} className="btn-back-homee">{t("password_reset_email.back")}</p>
      </div>
    </div>
  );
};

export default EmailVerification;
