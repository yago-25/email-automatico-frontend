import { useState } from "react";
import Input from "../../components/Input/Input";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";

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
    if (!fullName || !email || !cpfCnpj || !phone || !username || !password) {
      messageAlert({ type: "error", message: "Preencha todos os campos!" });
      return;
    }

    if (password !== confirmPassword) {
      messageAlert({ type: "error", message: "As senhas não coincidem!" });
      setLoading(false);
      return;
    }

    setLoading(true);

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
      messageAlert({ type: "error", message: "Erro ao conectar ao servidor." });
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
    <div className="mt-[5%] h-screen flex items-center justify-center">
      <div className="w-2/5 bg-white bg-opacity-50 rounded-xl border border-white p-6">
        <h1 className="text-white font-light text-4xl text-center mb-8">
          Solicitação de Cadastro
        </h1>
        <div className="flex flex-col items-center justify-start gap-5">
          <div className="w-full flex gap-5 justify-between">
            <Input
              type="text"
              text={t("register_page.full_name")}
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              styles={{ width: '50%' }}
            />
            <Input
              type="email"
              text={t("register_page.email")}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              styles={{ width: '50%' }}
            />
          </div>
          <div className="w-full flex gap-5 justify-between">
            <Input
              type="text"
              text={t("register_page.cpf_cnpj")}
              required
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              styles={{ width: '50%' }}
            />
            <Input
              type="text"
              text={t("register_page.phone")}
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              styles={{ width: '50%' }}
            />
          </div>
          <h1 className="text-white font-light text-xl mt-5 text-center">
            Dados de acesso
          </h1>
          <div className="w-full flex gap-5 justify-between">
            <Input
              type="password"
              text={t("register_page.password")}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              styles={{ width: '50%' }}
            />
            <Input
              type="password"
              text={t("register_page.confirm_password")}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              styles={{ width: '50%' }}
            />
          </div>
          <div className="w-full flex gap-5 justify-between">
            <Input
              type="text"
              text={t("register_page.username")}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              styles={{ width: '110%' }}
            />
            <button
              className="h-12 w-full rounded-xl border-none outline-none bg-blue-500 text-white text-lg cursor-pointer flex items-center justify-center transition-all duration-200 p-4 hover:bg-blue-800"
              onClick={handleRegister}
            >
              Cadastrar
            </button>
          </div>
          <p
            onClick={handleLogin}
            className="cursor-pointer text-white text-center mt-4"
          >
            Voltar
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
