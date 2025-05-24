import { Avatar, Spin, Tooltip } from "antd";
import { FaWhatsapp } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { useEffect, useState } from "react";
import Input from "../../components/Input/Input";
import { messageAlert } from "../../utils/messageAlert";
import { api } from "../../api/api";

type WhatsAppInstance = {
  id: number;
  number: string;
  loading?: boolean;
  qrCodeBase64: string | null;
  instance_name?: string;
  status?: string;
  name?: string;
  photo?: string;
};

const WhatsApp = () => {
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);

  const [newNumber, setNewNumber] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchInstances = async () => {
      setLoading(true);
      try {
        const response = await api.get("/whatsapp/instances", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.data.status === "success") {
          setInstances(response.data.data);
        } else {
          messageAlert({
            type: "error",
            message: "Não foi possível carregar as instâncias.",
          });
        }
      } catch (error) {
        messageAlert({
          type: "error",
          message: "Erro ao buscar instâncias do servidor.",
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, []);

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

      const { qrcode, instance_name, status, photo, instanceName } =
        response.data.data.api_response;

      if (qrcode?.base64) {
        setInstances((prev) => [
          ...prev,
          {
            id: Date.now(),
            number: newNumber.trim(),
            qrCodeBase64: qrcode.base64,
            instance_name: instance_name || instanceName,
            status: status || "pending",
            photo,
            name: instanceName || newNumber.trim(),
          },
        ]);
        setNewNumber("");
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

  const handleUpdateStatus = async (instance_name?: string) => {
    if (!instance_name) {
      messageAlert({
        type: "error",
        message: "Nome da instância inválido para atualizar status.",
      });
      return;
    }

    setInstances((prev) =>
      prev.map((inst) =>
        inst.instance_name === instance_name ? { ...inst, loading: true } : inst
      )
    );

    try {
      const response = await api.get(`/instance/status/${instance_name}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.data.status === "success") {
        const instanceData = response.data.data;
        setInstances((prev) =>
          prev.map((inst) =>
            inst.instance_name === instance_name
              ? {
                  ...inst,
                  status: instanceData.status,
                  photo: instanceData.photo,
                  name: instanceData.instanceName || inst.name,
                  qrCodeBase64: null,
                  loading: false,
                }
              : inst
          )
        );
      } else {
        messageAlert({
          type: "error",
          message: "Não foi possível atualizar o status da instância.",
        });
        setInstances((prev) =>
          prev.map((inst) =>
            inst.instance_name === instance_name
              ? { ...inst, loading: false }
              : inst
          )
        );
      }
    } catch (error) {
      messageAlert({
        type: "error",
        message: "Erro ao atualizar status da instância.",
      });
      console.error(error);
      setInstances((prev) =>
        prev.map((inst) =>
          inst.instance_name === instance_name
            ? { ...inst, loading: false }
            : inst
        )
      );
    }
  };

  return (
    <div>
      <Header name={authUser?.nome_completo} />
      <div className="p-6">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex flex-col">
            <h1 className="text-[32px] flex items-center text-white mb-2">
              <FaWhatsapp color="#25D366" className="mr-2" />
              Suas Instâncias do WhatsApp
            </h1>
            <p className="text-white font-light text-lg">
              Crie e conecte múltiplas instâncias para enviar mensagens
              automáticas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              text="Número com DDD"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              styles={{
                width: "80%",
              }}
            />
            <Tooltip title="Adicionar nova instância">
              <button
                onClick={handleConnect}
                disabled={creating}
                className="w-16 h-16 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg hover:text-blue-700 transition-all"
              >
                {creating ? <Spin size="small" /> : <AiOutlinePlus size={28} />}
              </button>
            </Tooltip>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {instances.map((instance) => (
              <div
                key={instance.instance_name || instance.id}
                className="bg-white rounded-lg shadow p-5 flex flex-col items-center justify-between w-full min-h-[360px] max-w-[400px]"
              >
                {instance.qrCodeBase64 ? (
                  <>
                    <img
                      src={instance.qrCodeBase64}
                      alt="QR Code"
                      className="w-[180px] h-[180px] mb-4"
                    />
                    <p className="text-center text-gray-700 text-sm">
                      Escaneie o QR Code para finalizar a conexão.
                    </p>
                    <button
                      onClick={() => handleUpdateStatus(instance.instance_name)}
                      disabled={instance.loading}
                      className="mt-4 w-full h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {instance.loading ? (
                        <Spin size="small" />
                      ) : (
                        "Atualizar status"
                      )}
                    </button>
                  </>
                ) : instance.status ? (
                  <div className="flex flex-col items-center gap-4">
                    <Avatar
                      size={96}
                      src={instance.photo}
                      alt={instance.name || "Instância"}
                    />
                    <h3 className="text-lg font-semibold">
                      {instance.name || instance.instance_name}
                    </h3>
                    <p className="text-gray-600 capitalize">
                      Status: {instance.status}
                    </p>
                    <button
                      onClick={() => handleUpdateStatus(instance.instance_name)}
                      disabled={instance.loading}
                      className="mt-4 w-full h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {instance.loading ? (
                        <Spin size="small" />
                      ) : (
                        "Atualizar status"
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <Avatar
                      size={96}
                      icon={<FaWhatsapp size={60} color="#2563EB" />}
                      className="bg-white mb-4"
                    />
                    <p className="text-center text-gray-600">
                      Número: {instance.number || "Desconhecido"}
                    </p>
                    <p className="text-center text-sm text-gray-500">
                      Nenhum status disponível.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsApp;
