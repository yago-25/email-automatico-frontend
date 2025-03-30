import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./TokenReset.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Spin from "../../components/Spin/Spin";
import { api } from '../../api/api';
import { messageAlert } from "../../utils/messageAlert";
// import ButtonRegister from "../../components/Button/ButtonRegiser";

const TokenReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const email = location.state?.email || "";

  const handleVerify = async () => {
    setLoading(true);

    // Verificando se o código foi inserido
    if (!code || !email) {
        messageAlert({
            type: 'error',
            message: 'Por favor, insira o código de verificação e o e-mail.',
        });
        console.log("Código de verificação ou e-mail não fornecido");
        setLoading(false);
        return;
    }

    console.log("Iniciando verificação do código de verificação para o e-mail:", email);

    try {
        // Verificando se o email e o código foram enviados corretamente
        console.log("Enviando para a API:", { email, code });

        const response = await api.post('/reset-token', { email, code });

        // Se a resposta for bem-sucedida
        if (response.status === 200) {
            console.log("Token verificado com sucesso para o e-mail:", email);

            messageAlert({
                type: 'success',
                message: 'Token verificado com sucesso!',
            });

            // Navegar para a página de redefinir senha com o estado do e-mail
            navigate("/reset-password", { state: { email, token: code } });
        } else {
            // Em caso de falha
            console.log("Falha na verificação do token para o e-mail:", email, "Mensagem:", response.data.message);

            messageAlert({
                type: 'error',
                message: response.data.message || 'Código inválido. Tente novamente.',
            });
        }
    } catch (error) {
        // Log de erro
        console.error("Erro ao verificar token:", error);

        messageAlert({
            type: 'error',
            message: 'Erro ao conectar ao servidor.',
        });
    } finally {
        setLoading(false);
        console.log("Processo de verificação finalizado.");
    }
};



const handleResend = async () => {

  console.log("e-mail:", email);

  setLoading(true);
  
  try {
        const response = await api.post('/password/forgot', { email });
  
        if (response.status === 200) {
          messageAlert({
            type: 'success',
            message: 'O token de redefinição de senha foi reenviado para o seu e-mail.',
          });
        }
      } catch (error) {
        messageAlert({
          type: 'error',
          message: "Erro ao reenviar o token de redefinição. Tente novamente mais tarde.",
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
    <div className="container">
      <h1 className="title">{t("email_verification.title")}</h1>
      <div className="form-token">
        <div className="card-contente">
          <div className="card-content-area-login">
            <Input
              text={t("email_verification.verification_code")}
              type="text"
              required={true}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>
        <div className="btn-tokene">
          <Button text={t("email_verification.verify_button")} onClick={handleVerify} />
        </div>
        <div className="card-footer-note">
          <p style={{ color: "white", fontSize: "12px" }}>
            {t("email_verification.didnt_receive_code")}{" "}
            <a
              href="#"
              onClick={handleResend}
              style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
            >
              {t("email_verification.resend_button")}
            </a>
          </p>
        </div>
        <div className="p"></div>
        {/* <Button text={t("email_verification.back_button")} onClick={handleLogin} /> */}
        <p onClick={handleLogin} className="btn-back-homee">Voltar</p>

      </div>
    </div>
  );
};

export default TokenReset;
