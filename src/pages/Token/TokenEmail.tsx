import { useState } from "react";
import './TokenEmail.css';
import Input from '../../components/Input/Input';
import ButtonToken from '../../components/Button/ButtonToken';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Spin from '../../components/Spin/Spin';

const EmailVerification = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleVerify = async () => {
    setLoading(true);

    if (!code) {
        alert("Por favor, insira o código de verificação.");
        setLoading(false);
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/api/verify-token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: code }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Token verificado com sucesso! Aguarde a aprovação do administrador.");
            navigate("/");
        } else {
            alert(data.message || "Código inválido. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro ao verificar token:", error);
        alert("Erro ao conectar ao servidor.");
    } finally {
        setLoading(false);
    }
};


const handleResend = async () => {
  setLoading(true);

  try {
      const response = await fetch("http://localhost:8000/api/resend-token", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }) // Certifique-se de ter o e-mail salvo no localStorage ou estado
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
  }
  if (!i18n.isInitialized || loading) {
    return (
      <Spin />
    );
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
