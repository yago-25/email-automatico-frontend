import { useEffect, useState } from "react";
import MultiSelectClient from "../../components/Select/MultiSelectClient";
import Spin from "../../components/Spin/Spin";
import { useSwr } from "../../api/useSwr";
import { messageAlert } from "../../utils/messageAlert";
import { api } from "../../api/api";
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { Skeleton } from 'antd';
import { Trash2 } from 'lucide-react';
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
    mail: any;
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
    const { i18n } = useTranslation();
    const { data: rawClients = [], loading: loadingClients } = useSwr<Clients[]>("/clients");
    const storedUser = localStorage.getItem("user");
    const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
    const [valueSelect, setValueSelect] = useState<Option[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
    const [sendDate, setSendDate] = useState<string>("");
    const [sendTime, setSendTime] = useState<string>("");
    // const isLoading = !subject || !body || selectedClients.length === 0;
    const [antdLocale, setAntdLocale] = useState(
        localeMap[i18n.language as "pt" | "en" | "es"] || ptBR
    );
    const timeFormat = 'HH:mm';

    const navigate = useNavigate();


    const onSearch = (searchText: string) => {
        if (!searchText) {
            setValueSelect(rawClients.map(client => ({
                value: String(client.id),
                label: client.name,
                mail: client.mail,
            })));
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

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleRemoveAttachment = (index: number) => {
        const updated = attachments.filter((_, i) => i !== index);
        setAttachments(updated);

        // Se todos foram removidos, limpa o input também
        if (updated.length === 0 && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSend = async () => {
        const formData = new FormData();
        formData.append("subject", subject);
        formData.append("body", body);
        formData.append("send_date", sendDate);
        formData.append("send_time", sendTime);
        selectedClients.forEach(clientId => formData.append("client_id[]", clientId));

        attachments.forEach((attachment, index) => {
            formData.append(`attachments[${index}]`, attachment.file);
        });

        try {
            const { data } = await api.post(`/agendar-email`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (data.success) {
                messageAlert({
                    type: "success",
                    message: "E-mail agendado com sucesso!",
                });
                navigate('/mails');
            } else {
                messageAlert({
                    type: "error",
                    message: "Erro ao agendar e-mail.",
                });
            }
        } catch (error) {
            console.error("Erro:", error);
            messageAlert({
                type: "error",
                message: "Erro inesperado.",
            });
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
            <div className="flex flex-col p-8 gap-8">
                <h1 className="text-2xl text-blue-50 font-semibold ml-2">Crie seu Email</h1>
                <div className="flex gap-12">
                    <form onSubmit={handlePreview} className="p-6 rounded-2xl shadow-md bg-white w-[800px] flex flex-col gap-6">

                        <div>
                            <label className="text-sm text-blue-500">Assunto do E-mail</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Digite o título"
                                className="w-full mt-1 p-2 rounded-md bg-gray-100 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-blue-500">Clientes</label>
                            {loadingClients ? (
                                <Spin />
                            ) : (
                                <MultiSelectClient
                                    options={valueSelect}
                                    value={selectedClients}
                                    onChange={(value) => setSelectedClients(value)}
                                    placeholder="Selecione os clientes"
                                    onSearch={onSearch}
                                />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-blue-500">Data do Email</label>
                            <ConfigProvider locale={antdLocale}>
                                <DatePicker
                                    format={i18n.language === "en" ? "MM/DD/YYYY" : "DD/MM/YYYY"}
                                    placeholder={i18n.language === "en" ? "Date of Message" : "Dia da Mensagem"}
                                    value={sendDate ? dayjs(sendDate) : null}
                                    onChange={(date) => setSendDate(date ? date.toISOString().split("T")[0] : "")}
                                    className="bg-white border rounded-md p-2 outline-none"
                                />
                            </ConfigProvider>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <label className="text-sm text-blue-500">Hora de Envio</label>
                                <ConfigProvider locale={antdLocale}>
                                    <TimePicker
                                        className="w-full mt-1 p-2 rounded-md bg-gray-100 text-gray-700"
                                        value={sendTime ? dayjs(sendTime, timeFormat) : null}
                                        onChange={(time) =>
                                            setSendTime(time ? time.format(timeFormat) : "")
                                        }
                                        format={timeFormat}
                                        placeholder="00:00"
                                    />
                                </ConfigProvider>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-blue-500">Corpo do E-mail</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className="w-full mt-1 p-2 h-48 rounded-md bg-gray-100 text-gray-700 resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-blue-500">Anexos</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="w-full mt-1 p-2 rounded-md bg-gray-100 text-gray-700"
                            />

                            {attachments.length > 0 && (
                                <ul className="mt-2 text-sm text-gray-600">
                                    {attachments.map((file, idx) => (
                                        <li key={idx} className="flex items-center justify-between mb-1">
                                            <span>{file.name}</span>
                                            <button
                                                onClick={() => handleRemoveAttachment(idx)}
                                                className="text-red-500 hover:text-red-700 ml-2"
                                                title="Remover anexo"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </form>
                    <div className="p-6 rounded-2xl shadow-md bg-white w-[800px]">
                        <h2 className="text-xl font-semibold text-blue-500">Prévia do E-mail</h2>
                        <div className="mt-4">

                            <h3 className="text-lg font-medium">
                                Assunto: {subject ? subject : <Skeleton title={false} paragraph={{ rows: 1, width: '60%' }} active />}
                            </h3>

                            <p className="mt-2 text-sm">
                                Para: {selectedClients.length > 0 ? (
                                    selectedClients.map(clientId => {
                                        const client = valueSelect.find(c => c.value === clientId);
                                        return client ? client.mail : '';
                                    }).join(", ")
                                ) : (
                                    <Skeleton title={false} paragraph={{ rows: 1, width: '40%' }} active />
                                )}
                            </p>

                            <div className="mt-2 text-sm">
                                <div>
                                    <span className="font-medium">Data do envio:</span>{' '}
                                    {sendDate ? (
                                        sendDate
                                    ) : (
                                        <Skeleton title={false} paragraph={{ rows: 1, width: '50%' }} active />
                                    )}
                                </div>
                                <div className="mt-1">
                                    <span className="font-medium">Horário do envio:</span>{' '}
                                    {sendTime ? (
                                        sendTime
                                    ) : (
                                        <Skeleton title={false} paragraph={{ rows: 1, width: '30%' }} active />
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <h4 className="font-medium">Corpo do E-mail:</h4>
                                {body ? (
                                    <p style={{ whiteSpace: "pre-line" }}>{body}</p>
                                ) : (
                                    <Skeleton title={false} paragraph={{ rows: 3 }} active />
                                )}
                            </div>

                            {attachments.length > 0 ? (
                                <div className="mt-4">
                                    <h4 className="font-medium">Anexos:</h4>
                                    <ul className="pl-4">
                                        {attachments.map((file, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-center justify-between text-sm text-gray-700 mb-1"
                                            >
                                                <span>{file.name}</span>
                                                <button
                                                    onClick={() => handleRemoveAttachment(idx)}
                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                    title="Remover"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleSend}
                                className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-4 cursor-pointer rounded"
                                disabled={!subject || !body || selectedClients.length === 0}
                            >
                                Confirmar Envio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MailsCreate;
