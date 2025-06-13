/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { FaEdit } from "react-icons/fa";
import { api } from "../../api/api";
import { useTranslation } from "react-i18next";
import Modal from "../../components/Modal/Modal";
import "./profile.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Spin from "../../components/Spin/Spin";
import { messageAlert } from "../../utils/messageAlert";
import { useSwr } from "../../api/useSwr";
import { FaUser, FaPhone, FaUserCircle } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

interface Cargo {
  id: number;
  nome: string;
}
interface User {
  cargo?: Cargo;
  cargo_id?: number;
  created_at: string;
  email: string;
  email_verificado_at: string | null;
  id: number;
  nome_completo: string;
  nome_usuario: string;
  telefone: string;
  updated_at: string;
  url: string;
}
interface ButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer w-44 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all group active:w-11 active:h-11 active:rounded-full active:duration-300 ease-in-out"
    >
      <svg
        className="animate-spin hidden group-active:block mx-auto"
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      ></svg>
      <span className="group-active:hidden">{text}</span>
    </button>
  );
};

const Profile = () => {
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/usersTable/${authUser?.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        setEditingUser(response.data);
        setName(response.data.nome_completo);
        setMail(response.data.email);
        setPhone(response.data.telefone);
        setUsername(response.data.nome_usuario);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    if (authUser?.id) {
      fetchUser();
    }
  }, []);

  const { mutate: mutateUsers } = useSwr("/usersTable");

  const { t } = useTranslation();
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [openModalPhoto, setOpenModalPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [newUrl, setNewUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        messageAlert({
          type: "error",
          message: "Por favor, selecione um arquivo de imagem.",
        });
        return;
      }
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const formatPhone = (phone: string): string => {
    try {
      const parsed = parsePhoneNumberFromString(phone);

      if (parsed && parsed.isValid()) {
        const countryCode = parsed.countryCallingCode;
        const national = parsed.formatNational();
        return `+${countryCode} ${national}`;
      }

      return phone;
    } catch (err) {
      console.error("Erro ao formatar número:", err);
      return phone;
    }
  };

  const handleUploadPhoto = async () => {
    setLoading(true);

    if (!profileFile || !authUser) {
      console.log("[Upload] Falha: arquivo ou usuário não definidos.");
      messageAlert({
        type: "error",
        message: "Por favor, selecione um arquivo.",
      });
      setLoading(false);
      return;
    }

    if (!(profileFile instanceof File)) {
      messageAlert({
        type: "error",
        message: "O arquivo selecionado é inválido.",
      });
      setLoading(false);
      return;
    }

    try {
      const presignResponse = await api.post(
        "/s3/upload-url/profile",
        {
          file_name: profileFile.name,
          file_type: profileFile.type,
          user_id: String(authUser.id),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      await fetch(presignResponse.data.upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": profileFile.type,
        },
        body: profileFile,
      });

      const filePath = presignResponse.data.file_path;
      const encodedFilePath = encodeURI(filePath);
      setNewUrl(encodedFilePath);

      const updatedUser = { ...authUser, url: encodedFilePath };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      mutateUsers();
      setProfilePreview(encodedFilePath);
      setOpenModalPhoto(false);
      setLoading(false);

      messageAlert({
        type: "success",
        message: "Imagem de perfil atualizada com sucesso!",
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erro:", error.message);
        messageAlert({
          type: "error",
          message: error.message,
        });
      } else {
        console.error("Erro inesperado:", error);
        messageAlert({
          type: "error",
          message: "Erro inesperado. Tente novamente.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    setLoadingPost(true);

    if (!editingUser) {
      setLoadingPost(false);
      return;
    }

    setLoading(true);
    try {
      await api.put(
        `/usersTable/${editingUser.id}`,
        {
          nome_completo: name,
          email: mail,
          telefone: phone,
          username: username,
          cargo_id: editingUser.cargo_id,
          nome_usuario: username,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      messageAlert({
        type: "success",
        message: t("users.updated_successfully"),
      });
      mutateUsers();
    } catch (error) {
      console.log("Erro ao salvar:", error);
      messageAlert({ type: "error", message: t("users.update_error") });
    } finally {
      setLoading(false);
      setLoadingPost(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      setEditingUser(authUser);
      setName(authUser?.nome_completo);
      setMail(authUser?.email);
      setPhone(authUser?.telefone);
      setUsername(authUser?.nome_usuario);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center  to-blue-900 w-full p-4">
      <Header name={authUser?.nome_completo} url={newUrl} />

      {loadingPost || loadingUser ? (
        <div className="flex items-center justify-center w-full h-96">
          <Spin />
        </div>
      ) : (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 mt-[6rem]">
          <div
            className="relative group"
            onClick={() => setOpenModalPhoto(true)}
          >
            <img
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md transition-opacity duration-300 group-hover:opacity-80"
              src={
                profilePreview ||
                authUser?.url ||
                `https://ui-avatars.com/api/?name=${authUser?.nome_completo}&background=0D8ABC&color=fff&size=128&rounded=true`
              }
              alt="Avatar"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <FaEdit className="text-white text-2xl bg-black/50 p-2 rounded-full" />
            </div>
          </div>

          <div className="relative w-full">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-300 bg-white/90 text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={t("form.name")}
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-300 bg-white/90 text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={t("form.email")}
              value={mail ?? ""}
              onChange={(e) => setMail(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-300 bg-white/90 text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={t("form.phone")}
              value={formatPhone(phone) ?? ""}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
            />
          </div>

          <div className="relative w-full">
            <FaUserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-300 bg-white/90 text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={t("form.username")}
              value={username ?? ""}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <Button
            text={t("common.save")}
            onClick={() => {
              console.log("Botão clicado");
              handleEdit();
            }}
          />
        </div>
      )}
      <Modal
        isVisible={openModalPhoto}
        onClose={() => setOpenModalPhoto(false)}
        title={t("modal.change_photo")}
      >
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Spin color="blue" />
          </div>
        ) : (
          <div className="flex flex-col gap-5 items-center justify-center">
            <div className="container-input-doc">
              <div className="header-input-doc">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15"
                      stroke="#000000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
                <p>{t("modal.select_file")}</p>
              </div>
              <label htmlFor="file" className="footer">
                <svg
                  fill="#000000"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M15.331 6H8.5v20h15V14.154h-8.169z"></path>
                    <path d="M18.153 6h-.009v5.342H23.5v-.002z"></path>
                  </g>
                </svg>
                <p>
                  {profileFile ? profileFile.name : t("modal.no_file_selected")}
                </p>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setProfilePreview("");
                    setProfileFile(null);
                  }}
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M5.16565 10.1534C5.07629 8.99181 5.99473 8 7.15975 8H16.8402C18.0053 8 18.9237 8.9918 18.8344 10.1534L18.142 19.1534C18.0619 20.1954 17.193 21 16.1479 21H7.85206C6.80699 21 5.93811 20.1954 5.85795 19.1534L5.16565 10.1534Z"
                      stroke="#000000"
                      stroke-width="2"
                    ></path>{" "}
                    <path
                      d="M19.5 5H4.5"
                      stroke="#000000"
                      stroke-width="2"
                      stroke-linecap="round"
                    ></path>{" "}
                    <path
                      d="M10 3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V5H10V3Z"
                      stroke="#000000"
                      stroke-width="2"
                    ></path>{" "}
                  </g>
                </svg>
              </label>
              <input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <Button text={t("modal.save")} onClick={handleUploadPhoto} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Profile;
