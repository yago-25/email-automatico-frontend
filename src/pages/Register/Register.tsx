import { useState } from "react";
import "./Register.css";
import Input from "../../components/Input/Input";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import { IoArrowBackCircleOutline } from "react-icons/io5";

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
        message: "As senhas não coincidem!",
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
      const response = await api.post("/register", userData);

      if (response.status === 201) {
        messageAlert({
          type: "success",
          message: "Cadastro realizado com sucesso! Verifique seu e-mail.",
        });

        // Redireciona para a tela de confirmação do token, passando o email para identificar o usuário
        navigate("/token", { state: { email } });
      } else {
        messageAlert({
          type: "error",
          message:
            response.data.message || "Erro ao cadastrar. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      messageAlert({
        type: "error",
        message: "Erro ao conectar ao servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!i18n.isInitialized || loading) {
    return <Spin />;
  }
  const handleLogin = () => {
    navigate("/");
  };

  return (
    <div className="container">
      <h1 className="title">Solicitação de Cadastro</h1>
      <div className="forme">
        <div className="card">
          <div className="card-content">
            <div className="grid">
              <Input
                type="text"
                text={t("register_page.full_name")}
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                type="email"
                text={t("register_page.email")}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid">
              <Input
                type="text"
                text={t("register_page.cpf_cnpj")}
                required
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
              />
              <Input
                type="text"
                text={t("register_page.phone")}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <h1 className="subtitle">Dados de acesso</h1>
            <div className="second-grid">
              <div className="grid">
                <Input
                  type="password"
                  text={t("register_page.password")}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  type="password"
                  text={t("register_page.confirm_password")}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="grid-2">
                <Input
                  type="text"
                  text={t("register_page.username")}
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div>
                  <button className="btn-register" onClick={handleRegister}>
                    Cadastrar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer">
          </div>
        </div>
            <button className="back-button" onClick={handleLogin}>
              <IoArrowBackCircleOutline className="back-icon" />
            </button>
      </div>
    </div>
  );
};

export default Register;
