import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./TokenEmail.css";
import Input from "../../components/Input/Input";
import ButtonToken from "../../components/Button/ButtonToken";
import Spin from "../../components/Spin/Spin";
import { api } from '../../api/api';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtém o e-mail passado via navigate (se houver)
  const email = location.state?.email || "";

  const handleVerify = async () => {
    setLoading(true);

    if (!code) {
        alert("Por favor, insira o código de verificação.");
        setLoading(false);
        return;
    }
    try {
        const response = await api.post('/validate-token', { code }); 

        if (response.status === 200) {
            alert("Token verificado com sucesso! Aguarde a aprovação do administrador.");
            navigate("/");
        } else {
            alert(response.data.message || "Código inválido. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro ao verificar token:", error);
        alert("Erro ao conectar ao servidor.");
    } finally {
        setLoading(false);
    }
};



  const handleResend = async () => {
    if (!email) {
      alert("E-mail não encontrado. Tente se cadastrar novamente.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/resend-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Novo código enviado para seu e-mail!");
      } else {
        alert(data.message || "Erro ao reenviar código.");
      }
    } catch (error) {
      console.error("Erro ao reenviar token:", error);
      alert("Erro ao conectar ao servidor.");
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
        <div className="card-content">
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
        <ButtonToken text={t("email_verification.verify_button")} onClick={handleVerify} />
        <ButtonToken text={t("email_verification.back_button")} onClick={handleLogin} />
        <div className="card-footer-not">
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
      </div>
    </div>
  );
};

export default EmailVerification;
