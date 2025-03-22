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
      
    } catch(e) {
      messageAlert({
        type: 'error',
        message: 'Erro ao fazer login'
      });
      console.log('Erro ao realizar login: ', e);
    } finally {
      setLoading(false);
    }
  };

  if (!i18n.isInitialized || loading) {
    return (
      <Spin />
    );
  }

  return (
    <div className="container">
      <h1 className='title'>{t("login_page.title")}</h1>
      <div className="form">
        <Input type='text' text={t("login_page.user_text")} required={true} value={user} onChange={(e) => setUser(e.target.value)} />
        <Input type="password" text={t("login_page.password_text")} required={true} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button text={t("login_page.button_text")} onClick={handleLogin}/>
      </div>
    </div>
  );
};

export default Login;