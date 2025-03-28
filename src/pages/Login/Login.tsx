import React, { useState } from 'react';
import './style.css';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { messageAlert } from '../../utils/messageAlert';
import Spin from '../../components/Spin/Spin';

interface LoginProps {
  setIsAuthenticated: (auth: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!user || !password) {
      messageAlert({
        type: 'error',
        message: 'Por favor, preencha todos os dados de login.'
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/login', {
        email: user,
        password: password
      });

      if (response.data.status === 200) {
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
        messageAlert({
          type: 'success',
          message: 'Login realizado com sucesso!'
        });
      }

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
              type="text"
              text={t("login_page.email_label")}
              required={true}
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            <Input
              type="password"
              text={t("login_page.password_label")}
              required={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="card-footer">
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
