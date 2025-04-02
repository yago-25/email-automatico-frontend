import { useState, useEffect } from "react";  
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
  const [email, setEmail] = useState(""); 
  const [loading, setLoading] = useState(false);

  
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

 
  const handleLogin = () => {
    navigate("/"); 
  };

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
              onChange={(e) => setEmail(e.target.value)} 
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
