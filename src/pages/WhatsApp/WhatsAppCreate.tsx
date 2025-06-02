import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiSend,
  FiArrowLeft,
} from "react-icons/fi";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { useTranslation } from "react-i18next";
import { ConfigProvider, DatePicker, TimePicker, Select } from "antd";
import ptBR from "antd/lib/locale/pt_BR";
import enUS from "antd/lib/locale/en_US";
import esES from "antd/lib/locale/es_ES";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import dayjs from "dayjs";
import { useSwr } from "../../api/useSwr";
import { messageAlert } from "../../utils/messageAlert";
import { api } from "../../api/api";

interface Clients {
  id: number;
  name: string;
  phone: string;
  mail: string;
  value?: string;
}

const localeMap = {
  pt: ptBR,
  en: enUS,
  es: esES,
};

interface Option {
  value: string;
  label: string;
  phone: string;
}

const WhatsAppCreate = () => {
  const navigate = useNavigate();
  const { instance } = useParams<{ instance: string }>();
  const { i18n } = useTranslation();
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [message, setMessage] = useState("");
  const [sendDate, setSendDate] = useState<string>("");
  const [sendTime, setSendTime] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<string | undefined>();
  const [valueSelect, setValueSelect] = useState<Option[]>([]);
  const antdLocale = localeMap[i18n.language as "pt" | "en" | "es"] || ptBR;
  const timeFormat = "HH:mm";

  const { data: rawClients = [], loading: loadingClients } =
    useSwr<Clients[]>("/clients");

  const handleSend = async () => {
    if (!selectedClient || !message || !sendDate || !sendTime) {
      messageAlert({
        type: "error",
        message: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    const clientData = valueSelect.find(
      (client) => client.value === selectedClient
    );

    if (!clientData) {
      messageAlert({
        type: "error",
        message: "Destinatário não encontrado.",
      });
      return;
    }

    try {
      const scheduledAt = new Date(`${sendDate}T${sendTime}`);

      const payload = {
        user_id: authUser?.id,
        instance_id: instance,
        name: clientData.label,
        phone: clientData.phone,
        message,
        scheduled_at: scheduledAt.toISOString(),
        file_path: null,
        status: "pending",
      };

      await api.post("/wpp", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      messageAlert({
        type: "success",
        message: "Mensagem agendada com sucesso!",
      });

      navigate(`/whatsapp/mensagens/${instance}`);
    } catch (e) {
      console.error("Erro ao agendar mensagem:", e);
      messageAlert({
        type: "error",
        message: "Erro ao agendar mensagem. Tente novamente.",
      });
    }
  };

  const onSearch = (searchText: string) => {
    const filtered = rawClients
      .filter((client) =>
        client.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .map((client) => ({
        value: String(client.id),
        label: client.name,
        phone: client.phone,
      }));
    setValueSelect(filtered);
  };

  useEffect(() => {
    if (rawClients.length) {
      const options = rawClients.map((client) => ({
        value: String(client.id),
        label: client.name,
        phone: client.phone,
      }));
      setValueSelect(options);
    }
  }, [rawClients]);

  if (loadingClients) {
    return (
      <div className="text-white text-center p-8">
        <p>Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="text-white">
      <Header name={authUser?.nome_completo} />

      <div className="max-w-7xl mx-auto p-8">
        <button
          onClick={() => navigate(`/whatsapp/mensagens/${instance}`)}
          className="flex items-center gap-2 text-white hover:text-white transition-colors mb-8"
        >
          <FiArrowLeft />
          Voltar para mensagens
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
              <FaWhatsapp className="text-green-400" />
              Nova Mensagem WhatsApp
            </h1>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-white flex items-center gap-2 mb-2">
                  <FiUsers />
                  Destinatário
                </label>
                <Select
                  showSearch
                  options={valueSelect}
                  value={selectedClient}
                  onChange={(value) => setSelectedClient(value)}
                  placeholder="Selecione o destinatário"
                  style={{ width: "100%" }}
                  allowClear
                  onSearch={onSearch}
                  className="mt-1 bg-gray-100 rounded-md text-black"
                />
              </div>

              <div>
                <label className="text-sm text-white flex items-center gap-2 mb-2">
                  <FaWhatsapp />
                  Mensagem
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="w-full p-4 h-48 bg-white rounded-xl text-black placeholder-gray-500 resize-none focus:ring-2 focus:ring-green-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white flex items-center gap-2 mb-2">
                    <FiCalendar />
                    Data de Envio
                  </label>
                  <ConfigProvider locale={antdLocale}>
                    <DatePicker
                      format={
                        i18n.language === "en" ? "MM/DD/YYYY" : "DD/MM/YYYY"
                      }
                      placeholder="Data da Mensagem"
                      value={sendDate ? dayjs(sendDate) : null}
                      onChange={(date) =>
                        setSendDate(
                          date ? date.toISOString().split("T")[0] : ""
                        )
                      }
                      className="w-full bg-white border-0 text-black"
                    />
                  </ConfigProvider>
                </div>

                <div>
                  <label className="text-sm text-white flex items-center gap-2 mb-2">
                    <FiClock />
                    Horário de Envio
                  </label>
                  <ConfigProvider locale={antdLocale}>
                    <TimePicker
                      className="w-full bg-white border-0 text-black"
                      value={sendTime ? dayjs(sendTime, timeFormat) : null}
                      onChange={(time) =>
                        setSendTime(time ? time.format(timeFormat) : "")
                      }
                      format={timeFormat}
                      placeholder="Horário da Mensagem"
                    />
                  </ConfigProvider>
                </div>
              </div>

              <button
                onClick={handleSend}
                disabled={!message || !selectedClient || !sendDate || !sendTime}
                className="w-full mt-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <FiSend />
                Enviar Mensagem
              </button>
            </div>
          </div>

          <div className="lg:w-1/3 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 h-fit sticky top-8">
            <h2 className="text-xl font-semibold mb-6">Preview da Mensagem</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-blue-800 mb-2">Destinatário</h3>
                <div className="space-y-1">
                  {(() => {
                    const selected = valueSelect.find(
                      (opt) => opt.value === selectedClient
                    );
                    return selected
                      ? `${selected.label} - ${selected.phone}`
                      : "Nenhum destinatário selecionado";
                  })()}
                </div>
              </div>

              <div>
                <h3 className="text-sm text-blue-800 mb-2">Mensagem</h3>
                <p className="text-sm whitespace-pre-line">
                  {message || "Sua mensagem aparecerá aqui..."}
                </p>
              </div>

              <div>
                <h3 className="text-sm text-blue-800 mb-2">Agendamento</h3>
                <p className="text-sm">
                  {sendDate && sendTime
                    ? `${sendDate} às ${sendTime}`
                    : "Data e hora do envio aparecerão aqui..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppCreate;
