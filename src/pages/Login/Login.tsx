import { useState } from 'react';
import './style.css';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const Login = () => {
  const { t } = useTranslation();

  console.log(i18n.language);


  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="container">
      <h1 className='title'>{t("login-page.title")}</h1>
      <div className="form">
        <Input type='text' text={t("login-page.user-text")} required={true} value={user} onChange={(e) => setUser(e.target.value)} />
        <Input type="password" text={t("login-page.password-text")} required={true} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button text={t("login-page.button-text")} onClick={() => alert('login')}/>
      </div>
    </div>
  );
};

export default Login;