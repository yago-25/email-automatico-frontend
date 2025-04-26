import { MdOutlineFormatListNumbered } from "react-icons/md";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { HiOutlineUser } from "react-icons/hi";
import { CiMail, CiPhone } from "react-icons/ci";
import { FaGear, FaPlus } from "react-icons/fa6";
import { MdSchedule, MdScheduleSend } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { RxPencil2 } from "react-icons/rx";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { AiOutlineEye } from "react-icons/ai";
import { useSwr } from "../../api/useSwr";
import Spin from "../../components/Spin/Spin";
import { useState } from "react";
import Modal from "../../components/Modal/Modal";
import { useNavigate } from "react-router-dom";

interface Sms {
  id: number;
  user_name: string;
  names: string;
  phones: string;
  message: string;
  scheduled_at: string;
  file_path: string | null;
  status: string;
}

const SmsPage = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const { data, loading } = useSwr<Sms[]>("/sms");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPhones, setModalPhones] = useState<string[]>([]);
  const [modalNames, setModalNames] = useState<string[]>([]);

  const now = new Date();

  const openModal = (phones: string, names: string) => {
    setModalPhones(JSON.parse(phones));
    setModalNames(JSON.parse(names));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  return (
    <div className="p-4">
      <Header name={authUser?.nome_completo} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <Spin />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-3xl font-bold text-white">Listagem de SMS</h1>
              <FaPlus
                className="cursor-pointer w-6 h-6 text-white"
                onClick={() => navigate("/sms/create")}
              />
            </div>
            <div className="w-full rounded-xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-blue-100 text-blue-900 font-semibold text-sm rounded-t-lg">
                  <div className="flex justify-center items-center truncate">
                    <MdOutlineFormatListNumbered /> ID
                  </div>
                  <div className="flex justify-center items-center truncate">
                    <HiOutlineUser /> Usuário
                  </div>
                  <div className="flex justify-center items-center truncate">
                    <CiMail /> Mensagem
                  </div>
                  <div className="flex justify-center items-center truncate">
                    <CiPhone /> Receptores
                  </div>
                  <div className="flex justify-center items-center truncate">
                    <MdSchedule /> Data de Envio
                  </div>
                  <div className="flex justify-center items-center truncate">
                    <IoIosInformationCircleOutline /> Status
                  </div>
                  <div className="flex justify-center items-center">
                    <FaGear /> Ações
                  </div>
                </div>

                {data &&
                  data.map((sms, i) => {
                    const isPast = new Date(sms.scheduled_at) < now;
                    return (
                      <div
                        key={sms.id}
                        className={`grid grid-cols-7 gap-4 px-6 py-4 text-sm text-blue-900 border-b ${
                          isPast ? "bg-red-100" : "bg-white"
                        } ${i === data.length - 1 ? "rounded-b-lg" : ""}`}
                      >
                        <div className="flex justify-center items-center truncate">
                          {sms.id}
                        </div>
                        <div className="flex justify-center items-center truncate">
                          {sms.user_name}
                        </div>
                        <div
                          className="flex justify-center items-center"
                          title={sms.message}
                        >
                          <div className="truncate max-w-[200px]">
                            {sms.message}
                          </div>
                        </div>
                        <div className="flex justify-center items-center">
                          <AiOutlineEye
                            onClick={() => openModal(sms.phones, sms.names)}
                            className="text-blue-500 cursor-pointer w-5 h-5"
                          />
                        </div>
                        <div className="flex justify-center items-center truncate">
                          {sms.scheduled_at}
                        </div>
                        <div className="flex justify-center items-center truncate">
                          {sms.status === "pending"
                            ? "Pendente"
                            : sms.status === "sent"
                            ? "Enviado"
                            : "Falha"}
                        </div>
                        <div className="flex justify-center items-center w-full gap-2">
                          <MdScheduleSend
                            className="cursor-pointer w-5 h-5"
                            title="Enviar agora"
                          />
                          <RxPencil2
                            className="cursor-pointer w-5 h-5"
                            title="Editar"
                          />
                          <FaRegTrashAlt
                            className="cursor-pointer w-5 h-5"
                            title="Deletar"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>

      <Modal title="Receptores" isVisible={isModalOpen} onClose={closeModal}>
        <div className="flex flex-col gap-3">
          {modalPhones.map((phone, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg shadow-sm hover:bg-blue-100 transition"
            >
              <CiPhone className="text-blue-500 w-5 h-5" />
              <div className="flex flex-col">
                <span className="text-blue-900 font-semibold">
                  {modalNames[index] || "Sem nome"}
                </span>
                <span className="text-blue-800 text-sm">
                  {formatPhoneNumber(phone)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={closeModal}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SmsPage;
