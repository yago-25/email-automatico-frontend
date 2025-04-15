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
      messageAlert({ type: "error", message: t("register_page.fill_all_fields") });
      return;
    }
  
    if (password !== confirmPassword) {
      messageAlert({ type: "error", message: t("register_page.password_mismatch") });
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
          message: t("register_page.success"),
        });
        navigate("/token", { state: { email } });
      } else {
        messageAlert({
          type: "error",
          message: response.data.message || t("register_page.error"),
        });
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      messageAlert({ type: "error", message: t("register_page.server_error") });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-700 to-blue-900 px-4">
      <div className="w-full max-w-3xl bg-white bg-opacity-25 border border-white rounded-2xl shadow-lg backdrop-blur-lg p-10">
        <h1 className="text-white text-4xl font-light text-center mb-8">
          {t("register_page.title")}
        </h1>

        <div className="flex flex-col items-center gap-6">
          <div className="w-full flex flex-col md:flex-row gap-6">
            <Input
              type="text"
              text={t("register_page.full_name")}
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              styles={{ width: "100%" }}
            />
            <Input
              type="email"
              text={t("register_page.email")}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              styles={{ width: "100%" }}
            />
          </div>
          <div className="w-full flex flex-col md:flex-row gap-6">
            <Input
              type="text"
              text={t("register_page.cpf_cnpj")}
              required
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              styles={{ width: "100%" }}
            />
            <Input
              type="text"
              text={t("register_page.phone")}
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              styles={{ width: "100%" }}
            />
          </div>
          <h2 className="text-white text-xl font-light text-center">
            {t("register_page.data_access")}
          </h2>

          <Input
              type="text"
              text={t("register_page.username")}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              styles={{ width: "100%" }}
            />
          <div className="w-full flex flex-col md:flex-row gap-6">
            <Input
              type="password"
              text={t("register_page.password")}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              styles={{ width: "100%" }}
            />
            <Input
              type="password"
              text={t("register_page.confirm_password")}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              styles={{ width: "100%" }}
            />
          </div>
          <div className="w-full flex flex-col gap-4">
            <button
              onClick={handleRegister}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-200"
            >
             {t("register_page.button_text")}
            </button>
          </div>
          <p
            onClick={handleLogin}
            className="text-white mt-4 cursor-pointer hover:underline text-center"
          >
            {t("register_page.back_button")}
          </p>
        </div>
      </div>
    </div>

  );
};

export default Register;
