import { useEffect, useState } from "react";
import MultiSelectClient from "../../components/Select/MultiSelectClient";
import Spin from "../../components/Spin/Spin";
import { useSwr } from "../../api/useSwr";
import { messageAlert } from "../../utils/messageAlert";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { Select, Skeleton, Switch } from "antd";
// import { Trash2 } from 'lucide-react';
import { useRef } from "react";
import { ConfigProvider, DatePicker, TimePicker } from "antd";
import ptBR from "antd/lib/locale/pt_BR";
import enUS from "antd/lib/locale/en_US";
import esES from "antd/lib/locale/es_ES";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  FiCalendar,
  FiClock,
  FiPaperclip,
  FiTrash2,
  FiMail,
  FiUsers,
} from "react-icons/fi";
import { FiSend } from "react-icons/fi";
import { CiMail } from "react-icons/ci";
// import { AxiosError } from 'axios';
import { CalendarClock, Check } from "lucide-react";
// import { useTranslation } from 'react-i18next';

const localeMap = {
  pt: ptBR,
  en: enUS,
  es: esES,
};

interface Clients {
  id: number;
  name: string;
  phone: string;
  mail: string;
}

interface Option {
  mail: string;
  label: string;
  value: string;
}

interface EmailAttachment {
  name: string;
  file: File;
  mime_type?: string;
  size?: number;
}

const MailsCreate = () => {
  const { i18n, t } = useTranslation();
  const { data: rawClients = [], loading: loadingClients } =
    useSwr<Clients[]>("/clients");
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const [valueSelect, setValueSelect] = useState<Option[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sendDate, setSendDate] = useState<string>("");
  const [sendTime, setSendTime] = useState<string>("");
  const [recurrency, setRecurrency] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [recurrencyType, setRecurrencyType] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | null
  >(null);
  const [recurrencyEndDate, setRecurrencyEndDate] = useState<string | null>(
    null
  );
  const [antdLocale, setAntdLocale] = useState(
    localeMap[i18n.language as "pt" | "en" | "es"] || ptBR
  );
  const timeFormat = "HH:mm";

  const navigate = useNavigate();

  const onSearch = (searchText: string) => {
    if (!searchText) {
      setValueSelect(
        rawClients.map((client) => ({
          value: String(client.id),
          label: client.name,
          mail: client.mail,
        }))
      );
      return;
    }

    const filteredClients = rawClients
      .filter((client) =>
        client.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .map((client) => ({
        value: String(client.id),
        label: client.name,
        mail: client.mail,
      }));

    setValueSelect(filteredClients);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      console.log("Arquivos recebidos:", filesArray);

      const newAttachments: EmailAttachment[] = filesArray.map(file => ({
        name: file.name,
        file: file,
        mime_type: file.type,
        size: file.size,
      }));

      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
  };



  const handleRemoveAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);

    if (updated.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleSend = async () => {
    try {
      setIsSending(true);

      const now = dayjs();
      const selectedDateTime = dayjs(`${sendDate}T${sendTime}`);

      if (selectedDateTime.isBefore(now.add(3, "minute"))) {
        messageAlert({
          type: "error",
          message: t("text_message.errors.time_invalid"),
        });
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const uploadedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          if (!(attachment.file instanceof File)) {
            console.warn("Attachment inválido:", attachment.file);
            return null;
          }

          const { data: uploadData } = await api.post(
            "/s3/upload-url/email",
            {
              file_name: attachment.file.name,
              file_type: attachment.file.type,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          await fetch(uploadData.upload_url, {
            method: "PUT",
            headers: {
              "Content-Type": attachment.file.type,
            },
            body: attachment.file,
          });

          return {
            name: attachment.file.name,
            url: uploadData.file_path,
          };
        })
      );

      const validAttachments = uploadedAttachments.filter((a) => a !== null);

      const sanitizedAttachments = validAttachments.map((att) => ({
        name: att.name,
        url: encodeURI(att.url),
      }));

      const payload = {
        subject,
        body,
        send_date: sendDate,
        send_time: sendTime,
        client_id: selectedClients,
        attachments: sanitizedAttachments,
      };

      const { data } = await api.post("/agendar-email", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        messageAlert({
          type: "success",
          message: "E-mail agendado com sucesso!",
        });
        navigate("/mails");
      } else {
        messageAlert({
          type: "error",
          message: "Erro ao agendar e-mail.",
        });
      }
    } catch (error) {
      console.error("Erro no envio:", error);
    } finally {
      setIsSending(false);
    }
  };


  useEffect(() => {
    if (!loadingClients && rawClients.length > 0) {
      const clientOptions = rawClients.map((client) => ({
        value: String(client.id),
        label: client.name,
        mail: client.mail,
      }));
      setValueSelect(clientOptions);
    }
  }, [loadingClients, rawClients]);

  useEffect(() => {
    const lang = i18n.language as "pt" | "en" | "es";
    dayjs.locale(lang);
    setAntdLocale(localeMap[lang] || ptBR);
  }, [i18n.language]);

  return (
    <>
      <Header name={authUser?.nome_completo} />
      <div className="flex items-start justify-start gap-6 w-full mt-5">
        <div className="flex flex-col gap-3 h-auto w-auto">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <CiMail className="w-8 h-8 animate-bounce" />
            {t("create_email.title")}
          </h1>
          <form
            onSubmit={handlePreview}
            className="p-8 rounded-3xl shadow-xl bg-white w-[800px] h-[85%] flex flex-col gap-6 border border-gray-100"
          >
            <div>
              <label className="text-sm text-blue-600 flex items-center gap-1">
                <FiMail />
                {t("create_email.subject")}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("create_email.subject_placeholder")}
                className="w-full mt-2 p-3 rounded-lg bg-gray-100 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-blue-600 flex items-center gap-1">
                <FiUsers />
                {t("create_email.clients")}
              </label>
              {loadingClients ? (
                <Spin />
              ) : (
                <MultiSelectClient
                  options={valueSelect}
                  value={selectedClients}
                  onChange={(value) => setSelectedClients(value)}
                  placeholder={t("create_email.select_clients")}
                  onSearch={onSearch}
                />
              )}
            </div>

            <div className="flex gap-6">
              <div className="flex-1">
                <label className="text-sm text-blue-600 flex items-center gap-1">
                  <FiCalendar />
                  {t("create_email.date")}
                </label>
                <ConfigProvider locale={antdLocale}>
                  <DatePicker
                    format={
                      i18n.language === "en" ? "MM/DD/YYYY" : "DD/MM/YYYY"
                    }
                    placeholder={
                      i18n.language === "en"
                        ? "Date of Message"
                        : "Dia da Mensagem"
                    }
                    value={sendDate ? dayjs(sendDate) : null}
                    onChange={(date) =>
                      setSendDate(date ? date.toISOString().split("T")[0] : "")
                    }
                    className="w-full mt-2 p-2 rounded-lg border-gray-300 outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </ConfigProvider>
              </div>

              <div className="flex-1">
                <label className="text-sm text-blue-600 flex items-center gap-1">
                  <FiClock />
                  {t("create_email.send_time")}
                </label>
                <ConfigProvider locale={antdLocale}>
                  <TimePicker
                    className="w-full mt-2 p-2 rounded-lg bg-gray-100 text-gray-700"
                    value={sendTime ? dayjs(sendTime, timeFormat) : null}
                    onChange={(time) =>
                      setSendTime(time ? time.format(timeFormat) : "")
                    }
                    format={timeFormat}
                    placeholder={t("create_email.body_placeholder")}
                  />
                </ConfigProvider>
              </div>
            </div>

            <div>
              <label className="text-sm text-blue-600"> {t("create_email.body")}</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("create_email.body_placeholder")}
                className="w-full mt-2 p-3 h-48 rounded-lg bg-gray-100 text-gray-700 resize-none focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-start justify-start gap-1">
                <label className="text-sm text-blue-600 flex items-center gap-1 mb-2">
                  <CalendarClock size={16} />
                  {t("create_email.recurrency")}
                </label>
                <Switch value={recurrency} onChange={(e) => setRecurrency(e)} />
              </div>
              {recurrency && (
                <div className="flex gap-4 w-full mt-4">
                  <div className="flex w-1/2 flex-col gap-2">
                    <label className="text-blue-700 text-sm font-semibold">
                      {t("create_email.frequency")}
                    </label>
                    <Select
                      value={recurrencyType}
                      onChange={(value) => setRecurrencyType(value)}
                      placeholder={t("create_email.select_frequency")}
                      options={[
                        { label: t("create_email.daily"), value: "daily" },
                        { label: t("create_email.weekly"), value: "weekly" },
                        { label: t("create_email.monthly"), value: "monthly" },
                        { label: t("create_email.yearly"), value: "yearly" }
                      ]}
                      className="w-full h-[40px]"
                    />
                  </div>

                  <div className="flex w-1/2 flex-col gap-2">
                    <label className="text-blue-700 text-sm font-semibold">
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

            <div>
              <label className="text-sm text-blue-600 flex items-center gap-1">
                <FiPaperclip />
                {t("create_email.attachments")}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full mt-2 p-2 rounded-lg bg-gray-100 text-gray-700"
              />

              {attachments.length > 0 && (
                <ul className="mt-2 text-sm text-gray-600 space-y-1 max-w-full overflow-auto">
                  {attachments.map((file, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md"
                    >
                      <span className="break-all max-w-xs">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-red-500 hover:text-red-700 ml-4"
                        title={t("create_email.remove_attachment")}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </form>
        </div>
        <div className="flex flex-col gap-3 h-auto w-auto">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <CiMail className="w-8 h-8 animate-bounce" />
            {t("email_preview.title")}
          </h1>
          <div className="p-8 rounded-3xl shadow-xl bg-white w-[800px] h-[85%] border border-gray-100">
            <div className="flex flex-col h-[85%] mt-6 space-y-4 text-sm text-gray-800">
              <div className="flex items-start gap-2">
                <FiMail className="mt-1 text-blue-400" />
                <h3 className="text-base font-semibold">
                  {t("email_preview.subject")}{" "}
                  {subject ? (
                    subject
                  ) : (
                    <Skeleton
                      title={false}
                      paragraph={{ rows: 1, width: "60%" }}
                      active
                    />
                  )}
                </h3>
              </div>

              <div className="flex items-start gap-2">
                <FiUsers className="mt-1 text-blue-400" />
                <p>
                  {t("email_preview.to")}{" "}
                  {selectedClients.length > 0 ? (
                    selectedClients
                      .map((clientId) => {
                        const client = valueSelect.find(
                          (c) => c.value === clientId
                        );
                        return client ? client.mail : "";
                      })
                      .join(", ")
                  ) : (
                    <Skeleton
                      title={false}
                      paragraph={{ rows: 1, width: "40%" }}
                      active
                    />
                  )}
                </p>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-blue-400" />
                  <span>
                    <strong>{t("email_preview.send_date")}:</strong>{" "}
                    {sendDate ? (
                      sendDate
                    ) : (
                      <Skeleton
                        title={false}
                        paragraph={{ rows: 1, width: "50%" }}
                        active
                      />
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-blue-400" />
                  <span>
                    <strong>{t("email_preview.send_time")}:</strong>{" "}
                    {sendTime ? (
                      sendTime
                    ) : (
                      <Skeleton
                        title={false}
                        paragraph={{ rows: 1, width: "30%" }}
                        active
                      />
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-1 flex items-center gap-1">
                  <FiMail className="text-blue-400" />
                  {t("email_preview.body")}
                </h4>
                {body ? (
                  <p className="whitespace-pre-line text-gray-700">{body}</p>
                ) : (
                  <Skeleton title={false} paragraph={{ rows: 3 }} active />
                )}
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-1 flex items-center gap-1">
                  <Check className="text-blue-400" size={16} />
                  {t("email_preview.recurrency")}
                </h4>
                {recurrency ? (
                  <div className="flex items-center">
                    <p>{t("email_preview.yes")}</p>
                    {recurrencyType && (
                      <p className="ml-2">
                        -{" "}
                        {recurrencyType === "daily"
                          ? t("create_email.daily")
                          : recurrencyType === "weekly"
                            ? t("create_email.weekly")
                            : recurrencyType === "monthly"
                              ? t("create_email.monthly")
                              : t("create_email.yearly")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p>{t("email_preview.no")}</p>
                )}
              </div>

              {attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-1 text-blue-500">
                    <FiPaperclip />
                    {t("email_preview.attachments")}
                  </h4>
                  <ul className="space-y-1">
                    {attachments.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md shadow-sm"
                      >
                        <span className="text-sm text-gray-700">
                          {file.name}
                        </span>
                        <button
                          onClick={() => handleRemoveAttachment(idx)}
                          className="text-red-500 hover:text-red-700 transition"
                          title={t("email_preview.remove_attachment")}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSend}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-md shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!subject || !body || selectedClients.length === 0 || isSending}
              >
                {isSending ? (
                  <Spin />
                ) : (
                  <>
                    <FiSend size={18} />
                    {t("email_preview.confirm_send")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MailsCreate;
