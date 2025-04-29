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
import { Button } from "../Ticket/Ticket";
import Select from "../../components/Select/Select";
import { useSwr } from "../../api/useSwr";
import Spin from "../../components/Spin/Spin";
import { useState } from "react";
import { messageAlert } from "../../utils/messageAlert";
import { api } from "../../api/api";
import dayjs from 'dayjs';

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

const SmsCreatePage = () => {
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [selected, setSelected] = useState<string>("");
  const [dateMessage, setDateMessage] = useState<string | null>(null);
  const [hourMessage, setHourMessage] = useState<string | null>(null);
  const [textMessage, setTextMessage] = useState<string | null>(null);
  const [messagesToShow, setMessagesToShow] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { data: rawClients = [], loading: loadingClients } =
    useSwr<Clients[]>("/clients");

  const optionsClient: Option[] = rawClients.map((client: Clients) => ({
    value: String(client.id),
    label: client.name,
  }));

  const handleSelectChange = (value: string | number) => {
    setSelected(value.toString());
  };

  const renderMessagePreview = (message: Message) => {
    switch (message.mediatype) {
      case "text":
        return (
          <pre className="max-w-full whitespace-pre-wrap break-words font-['poppins']">
            {message?.message}
          </pre>
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

  console.log(selected, 'selected');

  const handleSaveSms = async () => {
    setLoading(true);
    try {
      if (
        !dateMessage ||
        !hourMessage ||
        !selected ||
        !textMessage
      ) {
        messageAlert({
          type: 'error',
          message: 'Por favor, preencha todos os campos.'
        });
        return;
      };

      const nameSelected = rawClients.find((c) => c.id === Number(selected));
      const scheduledAt = dayjs(`${dateMessage} ${hourMessage}`).format('YYYY-MM-DD HH:mm:ss');

      await api.post('/sms', {
        user_id: authUser?.id,
        names: [nameSelected?.name],
        phones: [nameSelected?.phone],
        message: textMessage,
        scheduled_at: scheduledAt,
        file_path: null,
        status: 'pending'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      messageAlert({
        type: 'success',
        message: 'Mensagem programada criada com sucesso!'
      });
    } catch(e) {
      console.log('Erro ao cadastrar mensagem SMS: ', e);
      messageAlert({
        type: 'error',
        message: 'Erro ao cadastrar mensagem SMS'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Header name={authUser?.nome_completo} />
      {loadingClients || loading ? (
        <Spin />
      ) : (
        <div>
          <h1 className="text-3xl font-semibold text-white">
            Crie sua Mensagem de Texto
          </h1>

          <div className="flex gap-10 items-center justify-between w-full">
            <div className="bg-white p-6 rounded-lg shadow-md w-2/3 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-blue-600 text-sm">Dia da Mensagem</label>
                <input
                  type="date"
                  placeholder="Dia da Mensagem"
                  className="bg-white border rounded-md p-2 outline-none"
                  value={dateMessage || ""}
                  onChange={(e) => setDateMessage(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-blue-600 text-sm">
                  Hora da Mensagem
                </label>
                <input
                  type="time"
                  placeholder="Hora da Mensagem"
                  className="bg-white border rounded-md p-2 outline-none"
                  value={hourMessage || ""}
                  onChange={(e) => setHourMessage(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-blue-600 text-sm">
                  Cliente que receberá a Mensagem
                </label>
                <Select
                  options={optionsClient}
                  value={selected}
                  onChange={handleSelectChange}
                  placeholder="Selecione o Cliente"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-blue-600 text-sm">
                  Texto da Mensagem
                </label>
                <textarea
                  placeholder="Digite sua mensagem..."
                  className="bg-white border rounded-md p-4 h-32 resize-none outline-none"
                  value={textMessage || ""}
                  onChange={(e) => setTextMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  text="Enviar Preview"
                  onClick={() => {
                    if (
                      !dateMessage ||
                      !hourMessage ||
                      !selected ||
                      !textMessage
                    ) {
                      messageAlert({
                        type: 'error',
                        message: 'Por favor, preencha todos os campos.'
                      });
                      return;
                    };

                    const newMessage: Message = {
                      id: Date.now(),
                      mediatype: "text",
                      message: textMessage,
                    };

                    setMessagesToShow((prev) => [...prev, newMessage]);
                    // setSelected('');
                    // setDateMessage(null);
                    // setHourMessage(null);
                    // setTextMessage(null);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-center items-center gap-6">
              <SmsPhone>
                {messagesToShow.map((message) => (
                  <SmsMessage
                    key={message.id}
                    isEditable={true}
                    onDelete={() => console.log("oiiii")}
                  >
                    {renderMessagePreview(message)}
                  </SmsMessage>
                ))}
              </SmsPhone>
            </div>
          </div>

          <div className="flex justify-center mt-5">
            <Button text="Salvar" onClick={handleSaveSms} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsCreatePage;
