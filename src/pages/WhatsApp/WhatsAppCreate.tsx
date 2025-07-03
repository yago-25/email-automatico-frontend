/* eslint-disable no-case-declarations */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaHourglassEnd, FaPollH, FaWhatsapp } from "react-icons/fa";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiSend,
  FiArrowLeft,
  FiImage,
  FiFile,
  FiMapPin,
  FiUser,
} from "react-icons/fi";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { useTranslation } from "react-i18next";
import {
  ConfigProvider,
  DatePicker,
  TimePicker,
  Select,
  Upload,
  Input,
  Switch,
} from "antd";
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

type MessageType =
  | "text"
  | "media"
  | "document"
  | "contact"
  | "poll"
  | "location";

interface MediaMessage {
  file: File;
  caption?: string;
}

interface PollOption {
  text: string;
}

interface PollMessage {
  question: string;
  options: PollOption[];
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
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { instance } = useParams<{ instance: string }>();
  const { i18n } = useTranslation();
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [messageType, setMessageType] = useState<MessageType>("text");
  const [textMessage, setTextMessage] = useState("");
  const [mediaMessage, setMediaMessage] = useState<MediaMessage | null>(null);
  const [documentMessage, setDocumentMessage] = useState<MediaMessage | null>(
    null
  );
  const [pollMessage, setPollMessage] = useState<PollMessage>({
    question: "",
    options: [{ text: "" }, { text: "" }],
  });
  const [sendDate, setSendDate] = useState<string>("");
  const [sendTime, setSendTime] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<string | undefined>();
  const [valueSelect, setValueSelect] = useState<Option[]>([]);
  const [recurrency, setRecurrency] = useState<boolean>(false);
  const [recurrencyType, setRecurrencyType] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | null
  >(null);
  const [recurrencyEndDate, setRecurrencyEndDate] = useState<string | null>(
    null
  );

  const antdLocale = localeMap[i18n.language as "pt" | "en" | "es"] || ptBR;
  const timeFormat = "HH:mm";

  const { data: rawClients = [], loading: loadingClients } =
    useSwr<Clients[]>("/clients");

  const handleSend = async () => {
    if (!selectedClient || !sendDate || !sendTime) {
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
      let message = "";
      let filePath = null;
      let caption = null;

      switch (messageType) {
        case "text":
          message = textMessage;
          break;

        case "media":
          if (!mediaMessage?.file) {
            messageAlert({
              type: "error",
              message: "Selecione uma mídia para enviar.",
            });
            return;
          }

          const presignResponse = await api.post(
            "/s3/upload-url",
            {
              file_name: mediaMessage.file.name,
              file_type: mediaMessage.file.type,
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
              "Content-Type": mediaMessage.file.type,
            },
            body: mediaMessage.file,
          });

          filePath = presignResponse.data.file_path;
          caption = mediaMessage.caption || "";
          break;

        case "document":
          if (!documentMessage?.file) {
            messageAlert({
              type: "error",
              message: "Selecione um documento para enviar.",
            });
            return;
          }

          const presignResponseDoc = await api.post(
            "/s3/upload-url",
            {
              file_name: documentMessage.file.name,
              file_type: documentMessage.file.type,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );

          await fetch(presignResponseDoc.data.upload_url, {
            method: "PUT",
            headers: {
              "Content-Type": documentMessage.file.type,
            },
            body: documentMessage.file,
          });

          filePath = presignResponseDoc.data.file_path;
          caption = documentMessage.caption || "";
          break;

        case "poll":
          if (
            !pollMessage.question ||
            pollMessage.options.some((opt) => !opt.text)
          ) {
            messageAlert({
              type: "error",
              message: "Preencha a pergunta e todas as opções da enquete.",
            });
            return;
          }
          message = JSON.stringify(pollMessage);
          break;
      }

      if (!message && caption) {
        message = caption;
      }

      const startDateTime = dayjs(`${sendDate}T${sendTime}`);

      const generateDates = (): string[] => {
        if (!recurrency || !recurrencyType || !recurrencyEndDate) {
          return [startDateTime.format("YYYY-MM-DDTHH:mm:ssZ")];
        }

        const endDate = dayjs(recurrencyEndDate);

        const dates: string[] = [];
        let current = startDateTime;

        while (current.isSameOrBefore(endDate)) {
          dates.push(current.format("YYYY-MM-DDTHH:mm:ssZ"));

          switch (recurrencyType) {
            case "daily":
              current = current.add(1, "day");
              break;
            case "weekly":
              current = current.add(1, "week");
              break;
            case "monthly":
              current = current.add(1, "month");
              break;
            case "yearly":
              current = current.add(1, "year");
              break;
            default:
              return dates;
          }
        }

        return dates;
      };

      const allDates = generateDates();

      await Promise.all(
        allDates.map((scheduledAt) => {
          try {
            api.post(
              "/wpp",
              {
                user_id: authUser?.id,
                instance_id: instance,
                name: clientData.label,
                phone: clientData.phone,
                message,
                scheduled_at: scheduledAt,
                file_path: filePath,
                caption,
                message_type: messageType,
                status: "pending",
                recurrency,
                recurrencyType,
                recurrencyEndDate,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
          } catch (e) {
            console.error("Erro ao enviar para a data", scheduledAt, e);
            throw e;
          }
        })
      );

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

  const handleAddPollOption = () => {
    setPollMessage((prev) => ({
      ...prev,
      options: [...prev.options, { text: "" }],
    }));
  };

  const handleRemovePollOption = (index: number) => {
    if (pollMessage.options.length <= 2) return;
    setPollMessage((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
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

  const renderMessageInput = () => {
    switch (messageType) {
      case "text":
        return (
          <textarea
            value={textMessage}
            onChange={(e) => setTextMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="w-full p-4 h-48 bg-white rounded-xl text-black placeholder-gray-500 resize-none focus:ring-2 focus:ring-green-400 outline-none"
          />
        );
      case "media":
        return (
          <div className="space-y-4">
            <Upload
              accept="image/*,video/*"
              beforeUpload={(file) => {
                setMediaMessage({ file, caption: mediaMessage?.caption });
                return false;
              }}
              maxCount={1}
              className="w-[300px]"
            >
              <button className="w-full p-4 bg-white rounded-xl text-black border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
                <FiImage className="w-8 h-8 mx-auto mb-2" />
                <span>Clique ou arraste para adicionar foto/vídeo</span>
              </button>
            </Upload>
            {mediaMessage?.file && (
              <textarea
                value={mediaMessage.caption || ""}
                onChange={(e) =>
                  setMediaMessage({ ...mediaMessage, caption: e.target.value })
                }
                placeholder="Adicione uma legenda..."
                className="w-full p-4 h-24 bg-white rounded-xl text-black placeholder-gray-500 resize-none focus:ring-2 focus:ring-green-400 outline-none"
              />
            )}
          </div>
        );
      case "document":
        return (
          <div className="space-y-4">
            <Upload
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              beforeUpload={(file) => {
                setDocumentMessage({ file, caption: documentMessage?.caption });
                return false;
              }}
              maxCount={1}
            >
              <button className="w-full p-4 bg-white rounded-xl text-black border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
                <FiFile className="w-8 h-8 mx-auto mb-2" />
                <span>Clique ou arraste para adicionar arquivo</span>
              </button>
            </Upload>
            {documentMessage?.file && (
              <textarea
                value={documentMessage.caption || ""}
                onChange={(e) =>
                  setDocumentMessage({
                    ...documentMessage,
                    caption: e.target.value,
                  })
                }
                placeholder="Adicione uma legenda..."
                className="w-full p-4 h-24 bg-white rounded-xl text-black placeholder-gray-500 resize-none focus:ring-2 focus:ring-green-400 outline-none"
              />
            )}
          </div>
        );
      case "poll":
        return (
          <div className="space-y-4">
            <Input
              placeholder="Pergunta da enquete"
              value={pollMessage.question}
              onChange={(e) =>
                setPollMessage({ ...pollMessage, question: e.target.value })
              }
              className="bg-white rounded-xl h-[40px]"
            />
            {pollMessage.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Opção ${index + 1}`}
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...pollMessage.options];
                    newOptions[index] = { text: e.target.value };
                    setPollMessage({ ...pollMessage, options: newOptions });
                  }}
                  className="bg-white rounded-xl h-[40px]"
                />
                {index >= 2 && (
                  <button
                    onClick={() => handleRemovePollOption(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddPollOption}
              className="w-full p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            >
              Adicionar Opção
            </button>
          </div>
        );
      default:
        return null;
    }
  };

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

        <div className="flex items-start justify-between gap-8">
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
                  Tipo de Mensagem
                </label>
                <Select
                  value={messageType}
                  onChange={(value: MessageType) => setMessageType(value)}
                  style={{ width: "100%" }}
                  className="mt-1 bg-gray-100 rounded-md text-black"
                  options={[
                    { value: "text", label: "Texto" },
                    { value: "media", label: "Foto/Vídeo" },
                    { value: "document", label: "Arquivo" },
                    { value: "poll", label: "Enquete" },
                  ]}
                />
              </div>

              <div className="w-full">
                <label className="text-sm text-white flex items-center gap-2 mb-2 w-full">
                  {messageType === "text" && <FaWhatsapp />}
                  {messageType === "media" && <FiImage />}
                  {messageType === "document" && <FiFile />}
                  {messageType === "contact" && <FiUser />}
                  {messageType === "poll" && <FaPollH />}
                  {messageType === "location" && <FiMapPin />}
                  {messageType === "text" && "Mensagem"}
                  {messageType === "media" && "Foto/Vídeo"}
                  {messageType === "document" && "Arquivo"}
                  {messageType === "contact" && "Contato"}
                  {messageType === "poll" && "Enquete"}
                  {messageType === "location" && "Localização"}
                </label>
                {renderMessageInput()}
              </div>

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
                      setSendDate(date ? date.toISOString().split("T")[0] : "")
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

              <div>
                <label className="text-sm text-white flex items-center gap-2 mb-2">
                  <FiClock />
                  Recorrência
                </label>
                <Switch
                  onChange={(e) => setRecurrency(e)}
                  value={recurrency}
                  checked={recurrency}
                  style={{
                    backgroundColor: !recurrency ? "#666666" : undefined,
                  }}
                />
                {recurrency && (
                  <div className="flex flex-col gap-4 w-full mt-4">
                    <div className="flex w-full flex-col gap-2">
                      <label className="text-white text-sm font-semibold flex items-center justify-start gap-2">
                        <FaHourglassEnd />
                        {t("create_email.frequency")}
                      </label>
                      <Select
                        value={recurrencyType}
                        onChange={(value) => setRecurrencyType(value)}
                        placeholder={t("create_email.select_frequency")}
                        options={[
                          { label: t("create_email.daily"), value: "daily" },
                          { label: t("create_email.weekly"), value: "weekly" },
                          {
                            label: t("create_email.monthly"),
                            value: "monthly",
                          },
                          { label: t("create_email.yearly"), value: "yearly" },
                        ]}
                        className="w-full h-[40px]"
                      />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <label className="text-white text-sm font-semibold">
                        {t("create_email.end_date")}
                      </label>
                      <ConfigProvider locale={antdLocale}>
                        <DatePicker
                          format={
                            i18n.language === "en" ? "MM/DD/YYYY" : "DD/MM/YYYY"
                          }
                          placeholder={t("create_email.select_end_date")}
                          value={
                            recurrencyEndDate ? dayjs(recurrencyEndDate) : null
                          }
                          onChange={(d) =>
                            setRecurrencyEndDate(d ? d.toISOString() : null)
                          }
                          className="bg-white border border-gray-300 rounded-xl px-4 py-2 outline-none w-full shadow-sm focus:border-blue-500 transition"
                        />
                      </ConfigProvider>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!selectedClient || !sendDate || !sendTime}
              className="w-full mt-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <FiSend />
              Enviar Mensagem
            </button>
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
                <h3 className="text-sm text-blue-800 mb-2">Tipo de Mensagem</h3>
                <p className="text-sm">
                  {messageType === "text" && "Texto"}
                  {messageType === "media" && "Foto/Vídeo"}
                  {messageType === "document" && "Arquivo"}
                  {messageType === "contact" && "Contato"}
                  {messageType === "poll" && "Enquete"}
                  {messageType === "location" && "Localização"}
                </p>
              </div>

              <div>
                <h3 className="text-sm text-blue-800 mb-2">Conteúdo</h3>
                <div className="text-sm whitespace-pre-line">
                  {messageType === "text" &&
                    (textMessage || "Sua mensagem aparecerá aqui...")}
                  {messageType === "media" && (
                    <>
                      <p>
                        Arquivo:{" "}
                        {mediaMessage?.file?.name ||
                          "Nenhum arquivo selecionado"}
                      </p>
                      {mediaMessage?.caption && (
                        <p>Legenda: {mediaMessage.caption}</p>
                      )}
                    </>
                  )}
                  {messageType === "document" && (
                    <>
                      <p>
                        Arquivo:{" "}
                        {documentMessage?.file?.name ||
                          "Nenhum arquivo selecionado"}
                      </p>
                      {documentMessage?.caption && (
                        <p>Legenda: {documentMessage.caption}</p>
                      )}
                    </>
                  )}
                  {messageType === "poll" && (
                    <>
                      <p>Pergunta: {pollMessage.question || "Não definida"}</p>
                      <p>Opções:</p>
                      <ul className="list-disc pl-4">
                        {pollMessage.options.map((opt, i) => (
                          <li key={i}>
                            {opt.text || `Opção ${i + 1} não definida`}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
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
