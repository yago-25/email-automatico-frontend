import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import { MdRefresh, MdDelete, MdQrCode2 } from "react-icons/md";
import { IoMdInformation } from "react-icons/io";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { messageAlert } from "../../utils/messageAlert";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import { motion, AnimatePresence } from "framer-motion";
import { useSwr } from "../../api/useSwr";
import { IoChatboxEllipses } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

type WhatsAppInstance = {
  id: number;
  number: string;
  loading?: boolean;
  qrCodeBase64: string | null;
  instance_name: string;
  status?: string;
  name?: string;
  photo?: string;
  instance_id?: string;
};

type ResponseData = {
  data: WhatsAppInstance[];
};

const WhatsApp = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [newNumber, setNewNumber] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedInstance, setSelectedInstance] =
    useState<WhatsAppInstance | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, loading, mutate } = useSwr<ResponseData>("/whatsapp/instances");
  const instances: WhatsAppInstance[] = data?.data || [];

  const handleConnect = async () => {
    if (!newNumber.trim()) {
      return messageAlert({
        type: "error",
        message: "Por favor, preencha o número para conectar",
      });
    }

    setCreating(true);

    try {
      const response = await api.post(
        "/whatsapp/create",
        { number: newNumber.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const { qrcode, status, photo } = response.data.data.api_response;

      const instanceName =
        response.data.data.api_response.instance.instanceName;

      if (qrcode?.base64) {
        const newInstance = {
          id: Date.now(),
          number: newNumber.trim(),
          qrCodeBase64: qrcode.base64,
          instance_name: instanceName,
          status: status || "pending",
          photo,
          name: instanceName || newNumber.trim(),
        };

        mutate();
        setNewNumber("");
        setSelectedInstance(newInstance);
        setShowQRModal(true);
      } else {
        messageAlert({
          type: "error",
          message: "Não foi possível obter o QR Code. Tente novamente.",
        });
      }
    } catch (e) {
      messageAlert({
        type: "error",
        message: "Erro ao conectar número. Tente novamente.",
      });
      console.error("Erro ao conectar número: ", e);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (instanceName: string) => {
    if (!instanceName) {
      messageAlert({
        type: "error",
        message: "Nome da instância inválido para atualizar status.",
      });
      return;
    }

    mutate();

    try {
      const response = await api.get(`/instance/status/${instanceName}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.data.status === "success") {
        if (response.data.data.connectionStatus === "connecting") {
          messageAlert({
            type: "info",
            message: "A instância está conectando. Aguarde alguns minutos.",
          });
          return;
        }
        mutate();
        setShowQRModal(false);
        messageAlert({
          type: "success",
          message: "Status atualizado com sucesso!",
        });
      } else {
        messageAlert({
          type: "error",
          message: "Não foi possível atualizar o status da instância.",
        });
      }
    } catch (error) {
      messageAlert({
        type: "error",
        message: "Erro ao atualizar status da instância.",
      });
      console.error(error);
    } finally {
      mutate();
    }
  };

  const handleDeleteInstance = async (instance: WhatsAppInstance) => {
    try {
      await api.delete(`/whatsapp/instance/${instance.instance_name}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      mutate();

      messageAlert({
        type: "success",
        message: "Instância excluída com sucesso!",
      });
    } catch (error) {
      messageAlert({
        type: "error",
        message: "Erro ao excluir instância.",
      });
      console.error(error);
    }
    setShowDeleteModal(false);
    setSelectedInstance(null);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-green-500";
      case "disconnected":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div>
      <Header name={authUser?.nome_completo} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <FaWhatsapp className="text-green-400" />
              Suas Instâncias do WhatsApp
            </h1>
            <p className="text-blue-100">
              Crie e conecte múltiplas instâncias para enviar mensagens
              automáticas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Input
              text="Número com DDD"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              styles={{ width: "256px" }}
            />
            <button
              onClick={handleConnect}
              disabled={creating}
              className="h-12 px-6 bg-green-500 text-white rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AiOutlinePlus size={20} />
              Adicionar Instância
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {instances.map((instance) => {
                return (
                  <motion.div
                    key={instance.instance_name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {instance.photo ? (
                            <img
                              src={instance.photo}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaWhatsapp className="text-gray-400 text-2xl" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {instance.name || instance.number}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${getStatusColor(
                                  instance.status
                                )}`}
                              ></span>
                              <span className="text-sm text-gray-600 capitalize">
                                {instance.status || "Desconhecido"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {instance.qrCodeBase64 && (
                            <button
                              onClick={() => {
                                setSelectedInstance(instance);
                                setShowQRModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mostrar QR Code"
                            >
                              <MdQrCode2 size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleUpdateStatus(instance.instance_name);
                            }}
                            disabled={instance.loading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Atualizar Status"
                          >
                            <MdRefresh
                              size={20}
                              className={instance.loading ? "animate-spin" : ""}
                            />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInstance(instance);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir Instância"
                          >
                            <MdDelete size={20} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/whatsapp/mensagens/${instance.instance_id}`
                              )
                            }
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Ver Mensagens"
                          >
                            <IoChatboxEllipses size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <IoMdInformation className="text-blue-500" />
                          <span>Informações da Instância</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>
                            <strong>Número:</strong> {instance.number}
                          </p>
                          <p>
                            <strong>Nome da Instância:</strong>{" "}
                            {instance.instance_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal
        title="QR Code de Conexão"
        isVisible={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedInstance(null);
        }}
      >
        <div className="flex flex-col items-center gap-4">
          {selectedInstance?.qrCodeBase64 && (
            <>
              <img
                src={selectedInstance.qrCodeBase64}
                alt="QR Code"
                className="w-64 h-64"
              />
              <p className="text-center text-gray-600">
                Escaneie o QR Code para finalizar a conexão.
              </p>
              <button
                onClick={() => {
                  handleUpdateStatus(selectedInstance.instance_name);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Verificar Conexão
              </button>
            </>
          )}
        </div>
      </Modal>

      <Modal
        title="Confirmar Exclusão"
        isVisible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedInstance(null);
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-gray-600">
            Tem certeza que deseja excluir esta instância do WhatsApp?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedInstance(null);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                selectedInstance && handleDeleteInstance(selectedInstance)
              }
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WhatsApp;
