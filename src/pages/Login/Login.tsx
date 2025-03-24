import React, { useState } from 'react';
import './style.css';

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
    setLoading(true);
    try {
      const response = await api.post('/login', {
        email: user,
        password: password
      });

      if (response.data.status === 200) {
        setIsAuthenticated(true);
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

  if (!i18n.isInitialized || loading) {
    return (
      <Spin />
    );
  }

  return (
    <div>
      <i className="bi bi-person" id="logo-profile"></i>
      <div className="meio">
        <div className="form-container">
          <div id="login">
            <form id="loginForm" className="card" onSubmit={handleLogin}>
              <div className="card-header">
                <div className="flex-column">
                  <label style={{ color: 'white' }}>{t("login_page.email_label")}</label>
                </div>
                <div className="inputForm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 32 32" height="20" fill="white">
                    <g data-name="Layer 3" id="Layer_3">
                      <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
                    </g>
                  </svg>
                  <input placeholder={t("login_page.email_placeholder")} className="input" type="text" name="email" required value={user} onChange={(e) => setUser(e.target.value)} />
                </div>

                <div className="flex-column">
                  <label style={{ color: 'white' }}>{t("login_page.password_label")}</label>
                </div>
                <div className="inputForm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="-64 0 512 512" height="20" fill="white">
                    <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                    <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
                  </svg>
                  <input placeholder={t("login_page.password_placeholder")} className="input" type="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
              <div className="card-footer-not">
                <p style={{ color: "white", fontSize: "13px" }}>
                  {t("login_page.no_account")}{" "}
                  <a
                    href="#"
                    onClick={handleRegister}
                    style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
                  >
                    {t("login_page.signup")}
                  </a>
                </p>
              </div>

              <div className="card-footer">
                <p className="password">
                  <a href="/password/reset">{t("login_page.forgot_password")}</a>
                </p>
              </div>

              <div className="card-footer">
                <Button text={t("login_page.login_button")} onClick={handleLogin} />
              </div>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
