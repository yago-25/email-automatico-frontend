/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { Button } from "../Dashboard/Dashboard";
import { FaEdit } from "react-icons/fa";
import Modal from "../../components/Modal/Modal";
import './profile.css';
import { api } from "../../api/api";
import Spin from "../../components/Spin/Spin";
import { messageAlert } from "../../utils/messageAlert";

const Profile = () => {
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [openModalPhoto, setOpenModalPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    setLoading(true);
    if (!profileFile || !authUser) {
      messageAlert({
        type: 'error',
        message: 'por favor, selecione um arquivo.'
      });
      setLoading(false);
      return;
    };
  
    const formData = new FormData();
    formData.append("image", profileFile);
    console.log(profileFile, 'profileFile');
    for (const pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }
  
    try {
      const response = await api.post(`/users/${authUser.id}/photo`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
      });
  
      const data = response.data;
  
      const updatedUser = { ...authUser, url: data.url };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfilePreview(data.url);
      setOpenModalPhoto(false);
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      alert("Erro ao enviar imagem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      setName(authUser?.nome_completo);
      setMail(authUser?.email);
      setCpf(authUser?.cpf);
      setPhone(authUser?.telefone);
      setUsername(authUser?.nome_usuario);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Header name={authUser?.nome_completo} />
      <div
        style={{ width: "500px", height: "600px", backgroundColor: "#00448d" }}
        className="flex items-center justify-center flex-col gap-4 rounded-xl border border-white"
      >
        <div
          className="relative group cursor-pointer"
          onClick={() => setOpenModalPhoto(true)}
        >
          <img
            className="w-32 h-32 rounded-full transition-opacity duration-300 group-hover:opacity-70 cursor-pointer"
            src={
              profilePreview ||
              `https://ui-avatars.com/api/?name=${authUser?.nome_completo}&background=0D8ABC&color=fff&size=128&rounded=true`
            }
            alt="Avatar"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FaEdit className="text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full" />
          </div>
        </div>
        <div className="">
          <input
            type="text"
            className="relative bg-gray-50ring-0 outline-none border border-neutral-500 text-neutral-900 placeholder-violet-700 text-sm rounded-lg focus:ring-violet-500  focus:border-violet-500 block w-64 p-2.5 checked:bg-emerald-500"
            placeholder="Nome Completo"
            value={name ?? ""}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="">
          <input
            type="text"
            className="relative bg-gray-50ring-0 outline-none border border-neutral-500 text-neutral-900 placeholder-violet-700 text-sm rounded-lg focus:ring-violet-500  focus:border-violet-500 block w-64 p-2.5 checked:bg-emerald-500"
            placeholder="E-mail"
            value={mail ?? ""}
            onChange={(e) => setMail(e.target.value)}
          />
        </div>
        <div className="">
          <input
            type="text"
            className="relative bg-gray-50ring-0 outline-none border border-neutral-500 text-neutral-900 placeholder-violet-700 text-sm rounded-lg focus:ring-violet-500  focus:border-violet-500 block w-64 p-2.5 checked:bg-emerald-500"
            placeholder="CPF"
            value={cpf ?? ""}
            onChange={(e) => setCpf(e.target.value)}
          />
        </div>
        <div className="">
          <input
            type="text"
            className="relative bg-gray-50ring-0 outline-none border border-neutral-500 text-neutral-900 placeholder-violet-700 text-sm rounded-lg focus:ring-violet-500  focus:border-violet-500 block w-64 p-2.5 checked:bg-emerald-500"
            placeholder="Telefone"
            value={formatPhone(phone) ?? ""}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
          />
        </div>
        <div className="">
          <input
            type="text"
            className="relative bg-gray-50ring-0 outline-none border border-neutral-500 text-neutral-900 placeholder-violet-700 text-sm rounded-lg focus:ring-violet-500  focus:border-violet-500 block w-64 p-2.5 checked:bg-emerald-500"
            placeholder="Nome de usuário"
            value={username ?? ""}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <Button text="Salvar" onClick={() => alert("salvar")} />
      </div>
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
