import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./TokenReset.css";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
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
