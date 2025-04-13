import { useRef, useState } from 'react';
import './style.css';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { messageAlert } from '../../utils/messageAlert';
import Spin from '../../components/Spin/Spin';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!user || !password) {
      messageAlert({
        type: 'error',
        message: 'Por favor, preencha todos os dados de login.'
      });
      if (inputRef && inputRef.current) inputRef.current.focus();
      return;
    }

    setLoading(true);
    
    try {
      await login(user, password);

      messageAlert({
        type: 'success',
        message: 'Login realizado com sucesso!'
      });

    } catch (e) {
      messageAlert({
        type: 'error',
        message: 'Erro ao fazer login'
      });
      console.log('Erro ao realizar login: ', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };
  const handleResetPassword = () => {
    navigate("/email-verification");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  if (!i18n.isInitialized || loading) {
    return (
      <Spin />
    );
  }

  return (
    <div className="container">
      <h1 className="title">{t("login_page.title")}</h1>
      <div className="form-token">
        <div className="card-content">
          <div className="card-content-area-login">
            <Input
              ref={inputRef}
              type="text"
              text={t("login_page.email_label")}
              required={true}
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Input
              type="password"
              text={t("login_page.password_label")}
              required={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <div className="card-footere">
          <p className="password">
            <a  href="#"
              onClick={handleResetPassword}>{t("login_page.forgot_password")}</a>
          </p>
        </div>

        <Button text={t("login_page.login_button")} onClick={handleLogin} />
        <div className="card-footer-not">
          <p style={{ color: "white", fontSize: "13px" }}>
            {/* {t("login_page.no_account")}{" "} */}
            <a
              href="#"
              onClick={handleRegister}
              style={{ color: "#007BFF", cursor: "pointer", textDecoration: "underline" }}
            >
              {t("login_page.signup")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
