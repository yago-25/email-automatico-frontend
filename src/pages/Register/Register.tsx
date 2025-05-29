import { useState } from "react";
import Input from "../../components/Input/Input";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import { HiMail, HiLockClosed, HiUser, HiPhone, HiUserAdd, HiArrowLeft } from 'react-icons/hi';
import { BsShieldLock } from 'react-icons/bs';

const Register = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !username || !password) {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900">
        <Spin />
      </div>
    );
  }

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 px-4">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block p-3 rounded-full bg-blue-600/20 mb-4">
            <BsShieldLock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            {t("register_page.title")}
          </h1>
          <p className="text-blue-100/80 text-sm">
            {t("register_page.create_account_message")}
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <HiUser className="h-5 w-5 text-blue-200" />
              </div>
              <Input
                type="text"
                text={t("register_page.full_name")}
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 w-full bg-white/10 border border-blue-200/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <HiPhone className="h-5 w-5 text-blue-200" />
              </div>
              <Input
                type="text"
                text={t("register_page.phone")}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 w-full bg-white/10 border border-blue-200/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <HiMail className="h-5 w-5 text-blue-200" />
            </div>
            <Input
              type="email"
              text={t("register_page.email")}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 w-full bg-white/10 border border-blue-200/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative mt-8">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <HiUserAdd className="h-5 w-5 text-blue-200" />
            </div>
            <Input
              type="text"
              text={t("register_page.username")}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 w-full bg-white/10 border border-blue-200/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <HiLockClosed className="h-5 w-5 text-blue-200" />
              </div>
              <Input
                type="password"
                text={t("register_page.password")}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full bg-white/10 border border-blue-200/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <HiLockClosed className="h-5 w-5 text-blue-200" />
              </div>
              <Input
                type="password"
                text={t("register_page.confirm_password")}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 w-full bg-white/10 border border-blue-200/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleRegister}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              {t("register_page.button_text")}
              <HiUserAdd className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={handleLogin}
              className="w-full mt-4 text-blue-200 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <HiArrowLeft className="w-4 h-4" />
              {t("register_page.back_button")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
