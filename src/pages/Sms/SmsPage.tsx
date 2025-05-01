import { MdOutlineFormatListNumbered } from "react-icons/md";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { HiOutlineUser } from "react-icons/hi";
import { CiMail, CiPhone } from "react-icons/ci";
import { FaGear, FaPlus } from "react-icons/fa6";
import { MdSchedule, MdScheduleSend } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { AiOutlineEye } from "react-icons/ai";
import { useSwr } from "../../api/useSwr";
import Spin from "../../components/Spin/Spin";
import { useState } from "react";
import Modal from "../../components/Modal/Modal";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";

interface Sms {
  id: number;
  user_name: string;
  names: string[];
  phones: string[];
  message: string;
  scheduled_at: string;
  file_path: string | null;
  status: string;
}

const SmsPage = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const { data, loading, mutate } = useSwr<Sms[]>("/sms");

  const { i18n } = useTranslation();
  const lang = i18n.language as "pt" | "en" | "es";

  const dateFormatMap: Record<string, string> = {
    'pt-BR': 'DD/MM/YYYY HH:mm',
    en: 'MM/DD/YYYY hh:mm A',
    es: 'DD/MM/YYYY HH:mm',
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPhones, setModalPhones] = useState<string[]>([]);
  const [modalNames, setModalNames] = useState<string[]>([]);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingPost, setLoadingPost] = useState<boolean>(false);

  const now = new Date();

  const openModal = (phones: string[], names: string[]) => {
    setModalPhones(phones);
    setModalNames(names);
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

  const handleSendNow = async (id: number) => {
    setLoadingPost(true);
    try {
      await api.post(`/sms/send?id=${id}`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      messageAlert({
        type: "success",
        message: "Mensagem enviada com sucesso!",
      });
      mutate();
    } catch (e) {
      messageAlert({
        type: "error",
        message: "Erro ao enviar mensagem.",
      });
      console.log("Erro ao enviar mensagem: ", e);
    } finally {
      setLoadingPost(false);
    }
  };

  const handleDeleteSms = async (id: number) => {
    setLoadingDelete(true);
    try {
      await api.delete(`/sms/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      messageAlert({
        type: "success",
        message: "SMS deletado com sucesso!",
      });

      mutate();
    } catch(e) {
      messageAlert({
        type: "error",
        message: "Erro ao deletar SMS",
      });
      console.log('Erro ao deletar SMS: ', e);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="p-4">
      <Header name={authUser?.nome_completo} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading || loadingPost || loadingDelete ? (
          <Spin />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center justify-center gap-5">
                <h1 className="text-3xl font-bold text-white">
                  Listagem de SMS
                </h1>
                <div className="flex items-center gap-1 text-white">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-200"></span>
                  Enviados
                </div>
                <div className="flex items-center gap-1 text-white">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-200"></span>
                  Falhas
                </div>
                <div className="flex items-center gap-1 text-white">
                  <span className="inline-block w-3 h-3 rounded-full bg-white"></span>
                  Pendentes
                </div>
              </div>
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
                    const isSend = sms.status === "sent";
                    return (
                      <div
                        key={sms.id}
                        className={`grid grid-cols-7 gap-4 px-6 py-4 text-sm text-blue-900 border-b ${
                          isPast
                            ? "bg-red-200"
                            : isSend
                            ? "bg-green-200"
                            : "bg-white"
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
                        <div className="flex justify-center items-center truncate min-w-[150px]">
                          {dayjs(sms.scheduled_at)
                            .locale(lang)
                            .format(dateFormatMap[lang])}
                        </div>
                        <div className="flex justify-center items-center truncate">
                          {sms.status === "pending"
                            ? "Pendente"
                            : sms.status === "sent"
                            ? "Enviado"
                            : "Falha"}
                        </div>
                        <div className="flex justify-center items-center w-full gap-2">
                          {sms.status !== "sent" && (
                            <MdScheduleSend
                              className="cursor-pointer w-5 h-5"
                              title="Enviar agora"
                              onClick={() => handleSendNow(sms.id)}
                            />
                          )}
                          <FaRegTrashAlt
                            className="cursor-pointer w-5 h-5"
                            title="Deletar"
                            onClick={() => handleDeleteSms(sms.id)}
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
