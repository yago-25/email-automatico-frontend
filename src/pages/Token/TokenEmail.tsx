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

  const handleVerify = () => {
    setLoading(true);
    // Lógica para verificar código
    console.log("Código digitado:", code);
  };

  const handleResend = () => {
    // Lógica para reenviar código
    console.log("Reenviar código");
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
