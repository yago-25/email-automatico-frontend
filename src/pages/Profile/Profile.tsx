import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { FaEdit } from "react-icons/fa";
import { api } from "../../api/api";
import { useTranslation } from "react-i18next";
import Modal from "../../components/Modal/Modal";
import './profile.css';
// import axios from "axios";
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
  text: any;
  onClick: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button onClick={onClick} className="cursor-pointer w-44 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all group active:w-11 active:h-11 active:rounded-full active:duration-300 ease-in-out">
      <svg className="animate-spin hidden group-active:block mx-auto" width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      </svg>
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
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
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

  const { mutate: mutateUsers } = useSwr('/usersTable');


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
  const [_users, setUsers] = useState<User[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        messageAlert({
          type: 'error',
          message: 'Por favor, selecione um arquivo de imagem.',
        });
        return;
      }
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const formatPhone = (phone: string): string => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };


  const handleUploadPhoto = async () => {
    console.log('[Upload] Iniciando processo de upload da imagem...');
    setLoading(true);

    if (!profileFile || !authUser) {
      console.log('[Upload] Falha: arquivo ou usuário não definidos.');
      messageAlert({
        type: 'error',
        message: 'Por favor, selecione um arquivo.',
      });
      setLoading(false);
      return;
    }

    if (!(profileFile instanceof File)) {
      console.log('[Upload] Falha: profileFile não é uma instância de File.');
      messageAlert({
        type: 'error',
        message: 'O arquivo selecionado é inválido.',
      });
      setLoading(false);
      return;
    }

    console.log('[Upload] Arquivo válido:', profileFile);
    console.log('[Upload] Usuário autenticado:', authUser);

    try {
      const formData = new FormData();
      formData.append('image', profileFile);

      console.log('[Upload] FormData montado. Conteúdo:');
      for (const [key, value] of formData.entries()) {
        console.log(`- ${key}:`, value);
      }

      const accessToken = localStorage.getItem('accessToken');
      console.log('[Upload] Token de acesso:', accessToken);

      console.log(`[Upload] Enviando POST para /users/${authUser.id}/photo...`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${authUser.id}/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      console.log('[Upload] Resposta recebida da API:', response);

      const data = await response.json();

      if (!response.ok) {
        console.error('[Upload] Erro na resposta da API:', data);
        throw new Error(data?.message || 'Erro ao enviar imagem.');
      }

      const updatedUser = { ...authUser, url: data.url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfilePreview(data.url);
      setOpenModalPhoto(false);
      setLoading(false);

      console.log('[Upload] Upload concluído com sucesso. Foto atualizada.');

      messageAlert({
        type: 'success',
        message: 'Imagem de perfil atualizada com sucesso!',
      });

    } catch (error) {
      console.log('[Upload] Erro capturado no catch:');

      if (error instanceof Error) {
        console.error('Erro:', error.message);
        messageAlert({
          type: 'error',
          message: error.message,
        });
      } else {
        console.error('Erro inesperado:', error);
        messageAlert({
          type: 'error',
          message: 'Erro inesperado. Tente novamente.',
        });
      }
    } finally {
      setLoading(false);
      console.log('[Upload] Processo finalizado (finally).');
    }
  };

  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/usersTable", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
      });
      setUsers(response.data);
    } catch (e) {
      messageAlert({ type: "error", message: t("users.fetch_error") });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    console.log("clicou em Salvar");
    setLoadingPost(true);

    if (!editingUser) {
      console.log("Nenhum usuário em edição.");
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

      messageAlert({ type: "success", message: t("users.updated_successfully") });
      getUsers();
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
      <Header name={authUser?.nome_completo} />

      {loadingPost || loadingUser ? (
        <div className="flex items-center justify-center w-full h-96">
          <Spin />
        </div>
      ) : (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 mt-[6rem]">

          {/* Avatar com botão editar */}
          <div
            className="relative group"
            onClick={() => setOpenModalPhoto(true)}
          >
            <img
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md transition-opacity duration-300 group-hover:opacity-80"
              src={
                profilePreview || authUser?.url ||
                `https://ui-avatars.com/api/?name=${authUser?.nome_completo}&background=0D8ABC&color=fff&size=128&rounded=true`
              }
              alt="Avatar"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <FaEdit className="text-white text-2xl bg-black/50 p-2 rounded-full" />
            </div>
          </div>

          {/* Input: Nome */}
          <div className="relative w-full">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-300 bg-white/90 text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Nome Completo"
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Input: Email */}
          <div className="relative w-full">
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-300 bg-white/90 text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="E-mail"
              value={mail ?? ""}
              onChange={(e) => setMail(e.target.value)}
            />
          </div>

          {/* Input: Telefone */}
          <div className="relative w-full">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-300 bg-white/90 text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Telefone"
              value={formatPhone(phone) ?? ""}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
            />
          </div>

          {/* Input: Nome de usuário */}
          <div className="relative w-full">
            <FaUserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-300 bg-white/90 text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Nome de usuário"
              value={username ?? ""}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Botão */}
          <Button
            text="Salvar"
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
        title="Alterar foto"
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
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15"
                      stroke="#000000"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>{" "}
                  </g>
                </svg>{" "}
                <p>Selecione um arquivo</p>
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
                <p>{profileFile ? profileFile.name : 'Nada selecionado'}</p>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setProfilePreview('');
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
              <input id="file" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <Button text="Salvar" onClick={handleUploadPhoto} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Profile;
