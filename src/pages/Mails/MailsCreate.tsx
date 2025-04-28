import { useState } from "react";
import MultiSelectClient from "../../components/Select/MultiSelectClient";
import Spin from "../../components/Spin/Spin";
import { useSwr } from "../../api/useSwr";
import { messageAlert } from "../../utils/messageAlert";
import { api } from "../../api/api";

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
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
    const [sendDate, setSendDate] = useState<string>("");
    const [sendTime, setSendTime] = useState<string>("");
    const [showPreview, setShowPreview] = useState(false);

    const { data: rawClients = [], loading: loadingClients } = useSwr<Clients[]>("/clients");

    const clientOptions: Option[] = rawClients.map((client) => ({
        value: String(client.id),
        label: client.name,
        mail: client.mail,

    }));

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
        setShowPreview(true); // Exibe a prévia quando o usuário clica em "Visualizar"
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

    return (
        <div className="flex flex-col p-8 gap-8">
            <h1 className="text-2xl text-blue-50 font-semibold ml-2">Crie seu Email</h1>
            <div className="flex gap-12"> {/* Contêiner flex para alinhar o formulário e preview lado a lado */}
                {/* Formulário */}
                <form onSubmit={handlePreview} className="p-6 rounded-2xl shadow-md bg-white w-[800px] flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-blue-500">Clientes</label>
                            {loadingClients ? (
                                <Spin />
                            ) : (
                                <MultiSelectClient
                                    options={clientOptions}
                                    value={selectedClients}
                                    onChange={(value) => setSelectedClients(value)}
                                    placeholder="Selecione os clientes"
                                />
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-blue-500">Título do E-mail</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Digite o título"
                                className="w-full mt-1 p-2 rounded-md bg-gray-100 text-gray-700"
                            />
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

                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <label className="text-sm text-blue-500">Data de Envio</label>
                            <input
                                type="date"
                                value={sendDate}
                                onChange={(e) => setSendDate(e.target.value)}
                                className="w-full mt-1 p-2 rounded-md bg-gray-100 text-gray-700"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-blue-500">Hora de Envio</label>
                            <input
                                type="time"
                                value={sendTime}
                                onChange={(e) => setSendTime(e.target.value)}
                                className="w-full mt-1 p-2 rounded-md bg-gray-100 text-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-blue-500">Anexos</label>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="w-full mt-1 p-2 rounded-md bg-gray-100 text-gray-700"
                        />
                        {attachments.length > 0 && (
                            <ul className="mt-2 text-sm text-gray-600">
                                {attachments.map((file, idx) => (
                                    <li key={idx}>{file.name} ({(file.size! / 1024).toFixed(2)} KB)</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded"
                        >
                            Visualizar E-mail
                        </button>
                    </div>
                </form>

                {/* Preview */}
                {showPreview && (
                    <div className="p-6 rounded-2xl shadow-md bg-white w-[800px]">
                        <h2 className="text-xl font-semibold text-blue-500">Prévia do E-mail</h2>
                        <div className="mt-4">
                            <h3 className="text-lg font-medium">Assunto: {subject}</h3>
                            <p className="mt-2 text-sm">
                                Para: {selectedClients.map(clientId => {
                                    const client = clientOptions.find(c => c.value === clientId);
                                    return client ? client.mail : '';
                                }).join(", ")}
                            </p>
                            <p className="mt-2 text-sm">Data de envio: {sendDate} às {sendTime}</p>
                            <div className="mt-4">
                                <h4 className="font-medium">Corpo do E-mail:</h4>
                                <p>{body}</p>
                            </div>

                            {attachments.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium">Anexos:</h4>
                                    <ul className="list-disc pl-4">
                                        {attachments.map((file, idx) => (
                                            <li key={idx}>{file.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleSend}
                                className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded"
                            >
                                Confirmar Envio
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

export default MailsCreate;
