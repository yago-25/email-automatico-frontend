import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlus, FaWhatsapp } from "react-icons/fa";
import { IoMdInformation } from "react-icons/io";
import { AiOutlineEye } from "react-icons/ai";
import { Pencil, Trash } from "lucide-react";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import {
  MdArrowBackIos,
  MdArrowForwardIos,
  MdScheduleSend,
} from "react-icons/md";
import { useSwr } from "../../api/useSwr";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import { FileTextOutlined } from "@ant-design/icons";
import VideoModal from "./VideoModal";
import { Tooltip } from "antd";
import { MessagePreviewModal } from "./MessagePreviewModal";

type WppScheduleData = {
  id: number;
  instance_id: string;
  name: string;
  phone: string;
  message: string;
  user_id: number;
  user_name: string;
  status: "sent" | "failed" | "pending";
  message_type: string;
  caption?: string;
  scheduled_at: string;
  file_path?: string;
};

const WhatsAppList = () => {
  const navigate = useNavigate();
  const { instance } = useParams<{ instance: string }>();
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] =
    useState<WppScheduleData | null>(null);
  const itemsPerPage = 8;

  const { data = [], loading } = useSwr<WppScheduleData[]>(
    `/wpp?instance_id=${instance}`
  );

  const totalPages = Math.ceil(data?.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviado";
      case "failed":
        return "Falho";
      case "pending":
        return "Pendente";
      default:
        return "Aguardando";
    }
  };

  const sendNow = async (id: number) => {
    try {
      await api.post(
        "/wpp/sendNow",
        { id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      messageAlert({
        type: "success",
        message: "Mensagem enviada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      messageAlert({
        type: "error",
        message: "Erro ao enviar mensagem.",
      });
    }
  };

  const renderMessage = (message: WppScheduleData) => {
    const fileUrl = encodeURI(message.file_path ?? "");
    const isVideo = fileUrl.toLowerCase().endsWith(".mp4");

    return (
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl shadow-lg p-5 w-full max-w-md transition-all duration-300 hover:shadow-xl space-y-4">
        {(() => {
          switch (message.message_type) {
            case "text":
              return (
                <p className="text-lg leading-relaxed text-slate-800">
                  {message.message}
                </p>
              );

            case "media":
              return (
                <div className="flex flex-col items-start gap-3">
                  {isVideo ? (
                    <VideoModal videoUrl={fileUrl} />
                  ) : (
                    <img
                      src={fileUrl}
                      alt="media"
                      className="rounded-lg max-w-xs shadow-md border border-gray-200 object-cover"
                    />
                  )}
                  {message.caption && (
                    <p className="italic text-sm text-gray-500">
                      {message.caption}
                    </p>
                  )}
                </div>
              );

            case "document":
              return (
                <Tooltip title="Clique para abrir">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-100 hover:bg-slate-200 border border-gray-300 rounded-xl transition cursor-pointer text-slate-800 font-medium shadow-inner"
                  >
                    <FileTextOutlined className="text-xl text-slate-600" />
                    <span className="truncate">
                      {decodeURIComponent(
                        fileUrl.split("/").pop() ?? "Documento"
                      )}
                    </span>
                  </a>
                </Tooltip>
              );

            case "poll":
              try {
                const poll = JSON.parse(message.message);
                return (
                  <div className="w-full">
                    <p className="font-semibold text-slate-700 text-base mb-2">
                      📊 {poll.question}
                    </p>
                    <div className="flex flex-col gap-2">
                      {poll.options?.map(
                        (option: { text: string }, idx: number) => (
                          <div
                            key={idx}
                            className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-slate-700 border border-gray-200 shadow-sm transition"
                          >
                            {option.text}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              } catch (err) {
                console.log("Erro ao renderizar enquete: ", err);
                return <p className="text-red-500">❌ Enquete inválida</p>;
              }

            default:
              return (
                <p className="text-gray-400 italic">
                  Tipo de mensagem desconhecido 😶
                </p>
              );
          }
        })()}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center text-gray-400">Carregando...</div>;
  }

  return (
    <div className="text-white">
      <Header name={authUser?.nome_completo} />

      <div className="max-w-7xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <FaWhatsapp className="text-green-400" />
              Mensagens WhatsApp
            </h1>
            <p className="text-white mt-2">Instância: {instance}</p>
          </div>

          <button
            onClick={() => navigate(`/whatsapp/mensagens/${instance}/create`)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl transition-all transform hover:scale-105"
          >
            <FaPlus />
            Nova Mensagem
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((message: WppScheduleData) => (
              <div
                key={message.id}
                className="bg-white backdrop-blur-lg rounded-xl text-blue-600 p-6 hover:bg-opacity-80 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        message.status
                      )}`}
                    />
                    <span className="text-sm font-medium capitalize">
                      {getStatusText(message.status)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {message.status !== "sent" && (
                      <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
                        <MdScheduleSend
                          className="w-5 h-5 text-blue-400"
                          onClick={() => sendNow(message.id)}
                        />
                      </button>
                    )}
                    <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
                      <AiOutlineEye
                        className="w-5 h-5 text-blue-400"
                        onClick={() => setSelectedMessage(message)}
                      />
                    </button>
                    <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
                      <Pencil className="w-5 h-5 text-yellow-400" />
                    </button>
                    <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
                      <Trash className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>

                <p className="text-sm line-clamp-3 mb-4">
                  {renderMessage(message)}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <IoMdInformation />
                    <span>Agendado para: {message.scheduled_at}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <MdArrowBackIos />
            </button>
            <span className="font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <MdArrowForwardIos />
            </button>
          </div>
        )}
      </div>
      {selectedMessage && (
        <MessagePreviewModal 
          message={selectedMessage} 
          isVisible={!!selectedMessage} 
          onClose={() => setSelectedMessage(null)} 
        />
      )}
    </div>
  );
};

export default WhatsAppList;
