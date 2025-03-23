import { useState } from 'react';
import './Register.css';
import Input from '../../components/Input/Input';
import ButtonRegister from '../../components/Button/ButtonRegiser';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Spin from '../../components/Spin/Spin';


const Register = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);

    // Campos do formulário
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [cpfCnpj, setCpfCnpj] = useState("");
    const [phone, setPhone] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const handleRegister = () => {
        setLoading(true);
        if (password !== confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }

        // Aqui você pode adicionar a lógica de envio dos dados para o backend
        console.log({
            fullName,
            email,
            cpfCnpj,
            phone,
            username,
            password,
        });

        navigate("/token");
    };
   
    if (!i18n.isInitialized || loading) {
        return (
            <Spin />
        );
    }

    return (
        
        <div className="container">
          
            <div className="forme">
                <div className="card">
                    <div className="card-header">
                        <h3>Cadastro de Usuário</h3>
                    </div>
                    <div className="card-content">
                        <div className="card-content-area">
                            
                            <Input type="text" text={t("register_page.full_name")} required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div className="card-content-area">
                            
                            <Input type="email" text={t("register_page.email")} required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="card-content-area">
                           
                            <Input type="text" text={t("register_page.cpf_cnpj")} required value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} />
                        </div>
                        <div className="card-content-area">
                           
                            <Input type="text" text={t("register_page.phone")} required value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <h3>Dados de Acesso</h3>
                        <div className="card-content-area">
                            
                            <Input type="text" text={t("register_page.username")} required value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="card-content-area">
                            
                            <Input type="password" text={t("register_page.password")} required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="card-content-area">
                            
                            <Input type="password" text={t("register_page.confirm_password")} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </div>
                    <div className="card-footer">
                        <ButtonRegister text={t("Cadastre-se")} onClick={handleRegister} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;