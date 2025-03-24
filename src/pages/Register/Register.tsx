import { useState } from 'react';
import './Register.css';
import Input from '../../components/Input/Input';
import ButtonRegister from '../../components/Button/ButtonRegiser';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Spin from '../../components/Spin/Spin';
import { api } from '../../api/api';
import { messageAlert } from '../../utils/messageAlert';


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


    const handleRegister = async () => {
        setLoading(true);
    
        if (password !== confirmPassword) {
            messageAlert({
                type: "error",
                message: "As senhas não coincidem!"
            });
            setLoading(false);
            return;
        }
    
        const userData = {
            nome_completo: fullName,
            email,
            cpf: cpfCnpj,
            telefone: phone,
            nome_usuario: username,
            senha: password,
        };
    
        try {
            const response = await api.post('/register', userData);
    
            if (response.data.status === 201) {
                messageAlert({
                    type: "success",
                    message: "Cadastro realizado com sucesso! Verifique seu e-mail."
                });
                navigate("/token");
            } else {
                messageAlert({
                    type: "error",
                    message: response.data.message || "Erro ao cadastrar. Tente novamente."
                });
            }
    
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            messageAlert({
                type: "error",
                message: "Erro ao conectar ao servidor."
            });
        } finally {
            setLoading(false);
        }
    };
    
    
   
    if (!i18n.isInitialized || loading) {
        return (
            <Spin />
        );
    }
    const handleLogin = () => {
        navigate("/");
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
                    <div className="card-footer">
                        <ButtonRegister text={t("Voltar")} onClick={handleLogin} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;