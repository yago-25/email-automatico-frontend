import {
  ArrowDownCircleIcon,
  FileIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";
import Header from "../../components/Header/Header";
import { SmsMessage } from "../../components/PhoneComponent/SmsMessage";
import SmsPhone from "../../components/PhoneComponent/SmsPhone";
import { User } from "../../models/User";
// import { Button } from "../Ticket/Ticket";
import { useSwr } from "../../api/useSwr";
import Spin from "../../components/Spin/Spin";
import { useEffect, useState } from "react";
import { messageAlert } from "../../utils/messageAlert";
import { api } from "../../api/api";
import dayjs from "dayjs";
import { ConfigProvider, DatePicker, TimePicker, Tooltip } from "antd";
import MultiSelectClient from "../../components/Select/MultiSelectClient";
import ptBR from "antd/lib/locale/pt_BR";
import enUS from "antd/lib/locale/en_US";
import esES from "antd/lib/locale/es_ES";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  MessageCircle,
  SendHorizonal,
} from "lucide-react";
import { Save } from "lucide-react";

const localeMap = {
  pt: ptBR,
  en: enUS,
  es: esES,
};

interface Message {
  id?: number;
  wuid?: string;
  mediatype: string;
  send_type?: string;
  endpoint?: string;
  fullName?: string;
  fileName?: string;
  phoneNumber?: string;
  message?: string;
  mentionsEveryOne?: boolean;
  linkPreview?: boolean;
  media?: string;
  file?: File | string;
  file_path?: string;
  file_url?: string;
  file_hash?: string;
  file_mime?: string;
  duration?: number;
  caption?: string | null;
}

interface Clients {
  id: number;
  name: string;
  phone: string;
  mail: string;
  value?: string;
}

interface Option {
  label: string;
  value: string;
}

interface SmsValue {
  selected: string[] | null;
  dateMessage: string | null;
  hourMessage: string | null;
  textMessage: string | null;
  names: string[] | null;
  phones?: string[] | null;
}

const SmsCreatePage = () => {
  const format = "HH:mm";
  const navigate = useNavigate();

  const { i18n } = useTranslation();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [antdLocale, setAntdLocale] = useState(
    localeMap[i18n.language as "pt" | "en" | "es"] || ptBR
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [dateMessage, setDateMessage] = useState<string | null>(null);
  const [hourMessage, setHourMessage] = useState<string | null>(null);
  const [textMessage, setTextMessage] = useState<string | null>(null);
  const [messagesToShow, setMessagesToShow] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [payload, setPayload] = useState<SmsValue>({
    selected: [],
    dateMessage: null,
    hourMessage: null,
    textMessage: null,
    names: [],
    phones: [],
  });

  const { data: rawClients = [], loading: loadingClients } =
    useSwr<Clients[]>("/clients");

  const optionsClient: Option[] = rawClients.map((client: Clients) => ({
    value: String(client.id),
    label: client.name,
  }));

  const handleSelectChange = (value: string[]) => {
    setSelected(value);
  };

  const renderMessagePreview = (message: Message) => {
    switch (message.mediatype) {
      case "text":
        return (
          <Tooltip title={message?.message}>
            <div className="max-h-[700px] overflow-hidden font-['poppins'] line-clamp-5">
              {message?.message}
            </div>
          </Tooltip>
        );

      case "audio":
        return (
          <div className="flex justify-center items-center gap-2 mt-2">
            <img
              className="w-9 h-9 rounded-full shadow-lg"
              src={authUser?.url}
              alt="Audio Image"
            />
            <div className="flex justify-center items-center gap-2">
              <button onClick={() => alert("teste")}>
                {authUser ? (
                  <PauseIcon className="size-5 text-secondary" />
                ) : (
                  <PlayIcon className="size-5 text-secondary" />
                )}
              </button>
              <input
                type="range"
                value={2 * 100}
                onChange={() => console.log("dasfjskdlgjfnbdsfkjg")}
                className="w-full h-1 bg-blue-500 rounded-lg range-sm cursor-pointer"
              />
            </div>
          </div>
        );

      case "document":
        return (
          <div>
            <div className="rounded-xl flex flex-col">
              <img
                src={"/images/work.jpg"}
                className="w-full h-32 rounded-t-xl object-cover object-center"
              />
              <div className="bg-[#cafba1] rounded-b-xl max-w-full w-full justify-between flex p-2">
                <div className="flex gap-1">
                  <FileIcon />
                  <div className="text-sm flex-1 flex flex-col">
                    <p>Arquivo Foto</p>
                    <p className="text-xs text-gray-600">26.2MB</p>
                  </div>
                </div>
                <button
                  onClick={() => alert("sodlgkhnsdf")}
                  disabled={false}
                  className="cursor-pointer"
                >
                  <ArrowDownCircleIcon className="size-9 text-gray-500" />
                </button>
              </div>
            </div>
            <pre className="max-w-full whitespace-pre-wrap break-words font-['lato']">
              Legenda do Documento
            </pre>
          </div>
        );

      case "contact":
        return (
          <div className="min-w-40 flex justify-start items-center gap-2 mt-2">
            <img
              className="w-9 h-9 rounded-full shadow-lg"
              src={"/images/avatar.png"}
              alt="Contact Avatar"
            />
            <pre className="max-w-full whitespace-pre-wrap break-words font-['lato'] text-secondary font-semibold flex justify-center items-center">
              {message?.fullName}
            </pre>
          </div>
        );
      case "image":
        return (
          <div className="mt-2">
            <img
              src={""}
              className="w-full max-w-full h-auto max-h-60 rounded-xl object-cover object-center"
            />
            <pre className="max-w-full whitespace-pre-wrap break-words font-['lato']">
              {message.caption}
            </pre>
          </div>
        );
      case "video":
        return (
          <div className="mt-2">
            <video
              controls
              src={""}
              className="w-full max-w-full h-auto max-h-60 rounded-xl object-cover object-center"
            />
            <pre className="max-w-full whitespace-pre-wrap break-words font-['lato']">
              {message.caption}
            </pre>
          </div>
        );
    }
  };

  const formatPhoneNumber = (phone: string, countryCode = "55") => {
    const digitsOnly = phone.replace(/\D/g, "");
    return `+${countryCode}${digitsOnly}`;
  };

  const handleSaveSms = async () => {
    setLoading(true);
    try {
      if (
        !payload.dateMessage ||
        !payload.hourMessage ||
        !payload.selected ||
        !payload.textMessage
      ) {
        messageAlert({
          type: "error",
          message: "Por favor, preencha todos os campos.",
        });
        return;
      }

      const selectedDate = dayjs(payload.dateMessage);
      const selectedTime = dayjs(payload.hourMessage).format("HH:mm");
      const selectedDateTime = dayjs(
        `${selectedDate.format("YYYY-MM-DD")}T${selectedTime}`
      );

      const scheduledAt = selectedDateTime.format("YYYY-MM-DD HH:mm:ss");

      await api.post(
        "/sms",
        {
          user_id: authUser?.id,
          names: payload.names,
          phones: payload.phones?.map((phone) =>
            formatPhoneNumber(phone, "55")
          ),
          message: payload.textMessage,
          scheduled_at: scheduledAt,
          file_path: null,
          status: "pending",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      messageAlert({
        type: "success",
        message: "Mensagem programada criada com sucesso!",
      });
      navigate("/sms");
    } catch (e) {
      console.log("Erro ao cadastrar mensagem SMS: ", e);
      messageAlert({
        type: "error",
        message: "Erro ao cadastrar mensagem SMS",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = (id: number) => {
    setMessagesToShow((prev) => prev.filter((message) => message.id !== id));
  };

  useEffect(() => {
    const lang = i18n.language as "pt" | "en" | "es";
    dayjs.locale(lang);
    setAntdLocale(localeMap[lang] || ptBR);
  }, [i18n.language]);

  return (
    <div className="p-4">
      <Header name={authUser?.nome_completo} />
      {loadingClients || loading ? (
        <Spin />
      ) : (
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-3">
            <MessageCircle className="w-9 h-9 text-white animate-pulse" />
            Crie sua Mensagem de Texto
          </h1>

          <div className="flex flex-col lg:flex-row gap-10 items-start justify-between w-full">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full lg:w-2/3 flex flex-col gap-8 border border-gray-100">

              {/* Data */}
              <div className="flex flex-col gap-2">
                <label className="text-blue-700 text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dia da Mensagem
                </label>
                <ConfigProvider locale={antdLocale}>
                  <DatePicker
                    format={i18n.language === "en" ? "MM/DD/YYYY" : "DD/MM/YYYY"}
                    placeholder={
                      i18n.language === "en" ? "Date of Message" : "Dia da Mensagem"
                    }
                    value={dateMessage ? dayjs(dateMessage) : null}
                    onChange={(d) => setDateMessage(d ? d.toISOString() : null)}
                    className="bg-white border border-gray-300 rounded-xl px-4 py-2 outline-none w-full shadow-sm focus:border-blue-500 transition"
                  />
                </ConfigProvider>
              </div>

              {/* Hora */}
              <div className="flex flex-col gap-2">
                <label className="text-blue-700 text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Hora da Mensagem
                </label>
                <ConfigProvider locale={antdLocale}>
                  <TimePicker
                    className="bg-white border border-gray-300 rounded-xl px-4 py-2 outline-none w-full shadow-sm focus:border-blue-500 transition"
                    value={hourMessage ? dayjs(hourMessage) : null}
                    onChange={(d) => setHourMessage(d ? d.toISOString() : null)}
                    defaultValue={dayjs("00:00", format)}
                    format={format}
                  />
                </ConfigProvider>
              </div>

              {/* Cliente */}
              <div className="flex flex-col gap-2">
                <label className="text-blue-700 text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Cliente que receberá a Mensagem
                </label>
                <MultiSelectClient
                  options={optionsClient}
                  value={selected}
                  placeholder="Selecione o Cliente"
                  onChange={handleSelectChange}
                  showSearch={false}
                />
              </div>

              {/* Mensagem */}
              <div className="flex flex-col gap-2">
                <label className="text-blue-700 text-sm font-semibold flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Texto da Mensagem
                </label>
                <textarea
                  placeholder="Digite sua mensagem..."
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 h-32 resize-none outline-none shadow-sm focus:border-blue-500 transition"
                  value={textMessage || ""}
                  onChange={(e) => setTextMessage(e.target.value)}
                />
              </div>

              {/* Botão */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!dateMessage || !hourMessage || !selected || !textMessage) {
                      messageAlert({
                        type: "error",
                        message: "Por favor, preencha todos os campos.",
                      });
                      return;
                    }

                    const now = dayjs();
                    const selectedDate = dayjs(dateMessage);
                    const selectedDateTime = dayjs(
                      `${selectedDate.format("YYYY-MM-DD")}T${dayjs(hourMessage).format("HH:mm")}`
                    );

                    if (selectedDate.isBefore(now, "day")) {
                      messageAlert({
                        type: "error",
                        message: "Por favor, selecione uma data maior que a data atual.",
                      });
                      return;
                    }

                    if (
                      selectedDate.isSame(now, "day") &&
                      selectedDateTime.isBefore(now.add(5, "minute"))
                    ) {
                      messageAlert({
                        type: "error",
                        message:
                          "Por favor, selecione uma hora com no mínimo 5 minutos à frente do horário atual.",
                      });
                      return;
                    }

                    const newMessage: Message = {
                      id: Date.now(),
                      mediatype: "text",
                      message: textMessage,
                    };

                    const phones = selected
                      .map((id) => rawClients.find((c) => c.id === Number(id))?.phone)
                      .filter((phone): phone is string => !!phone);

                    const names = selected
                      .map((id) => rawClients.find((c) => c.id === Number(id))?.name)
                      .filter((name): name is string => !!name);
                      .map((id) => {
                        const client = rawClients.find(
                          (c) => c.id === Number(id)
                        );
                        return client ? client.phone : null;
                      })
                      .filter((phone): phone is string => phone !== null);

                    const names = selected
                      .map((id) => {
                        const client = rawClients.find(
                          (c) => c.id === Number(id)
                        );
                        return client ? client.name : null;
                      })
                      .filter((name): name is string => name !== null);

                    setMessagesToShow((prev) => [...prev, newMessage]);
                    setPayload({
                      selected,
                      dateMessage,
                      hourMessage,
                      textMessage,
                      names,
                      phones,
                    });
                    setSelected([]);
                    setDateMessage(null);
                    setHourMessage(null);
                    setTextMessage(null);
                  }}
                  disabled={messagesToShow.length >= 1}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <SendHorizonal className="w-4 h-4" />
                  Enviar Preview
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center gap-4 -mt-16">
              <div className="flex justify-center">
                <button
                  onClick={handleSaveSms}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition duration-200"
                >
                  <Save className="w-5 h-5" />
                  Salvar
                </button>
              </div>
              <SmsPhone>
                {messagesToShow.map((message) => (
                  <SmsMessage
                    key={message.id}
                    isEditable={true}
                    onDelete={() => handleDeleteMessage(Number(message.id))}
                  >
                    {renderMessagePreview(message)}
                  </SmsMessage>
                ))}
              </SmsPhone>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsCreatePage;
