import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash } from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import { MdOutlineFormatListNumbered, MdSchedule } from "react-icons/md";
import { CiMail } from "react-icons/ci";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { AiOutlineEye } from "react-icons/ai";
import Spin from "../../components/Spin/Spin";
import { MdCheckCircle, MdAccessTime, MdErrorOutline } from "react-icons/md";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";
import { api } from "../../api/api";
import EmailPreviewModal from "../../components/Modal/EmailPreviewModal";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import EditEmailModal from "../../components/Modal/EditEmailModal";

interface EmailClient {
    id: number;
    name: string;
    mail: string;
}

interface EmailItem {
    id: number;
    subject: string;
    body: string;
    send_date: string;
    send_time: string;
    status: string;
    clients: EmailClient[];
    attachments: Attachment[];
}

interface Attachment {
    name: string;
}

const Mails = () => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("user");
    const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
    const now = new Date();
    const [modalNames, setModalNames] = useState<string[]>([]);
    const [modalMails, setModalMails] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCrashOpen, setIsModalCrashOpen] = useState(false);
    const [clientIdToDelete, setClientIdToDelete] = useState<number | null>(null);
    const [mails, setMails] = useState<EmailItem[]>([]);
    const [filteredMails, setFilteredMails] = useState<EmailItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const [isPreviewModalOpenEdit, setPreviewModalOpenEdit] = useState(false);
    const [previewEmail, setPreviewEmail] = useState<EmailItem | null>(null);
    const [subject, setSubject] = useState('');
    const [recipients, setRecipients] = useState('');
    const [status, setStatus] = useState({
        sent: false,
        pending: false,
        failed: false,
    });
    const [date, setDate] = useState('');
    const [id, setId] = useState('');

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const response = await api.get("/emails", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            setMails(response.data);
            setFilteredMails(response.data);
        } catch (error) {
            console.error("Erro ao carregar e-mails", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const applyFilters = () => {
        let filtered = mails;

        console.log('Aplicando filtros...');
        console.log('Filtros Ativos:', { subject, recipients, status, date, id });

        if (subject) {
            filtered = filtered.filter((email) =>
                email.subject.toLowerCase().includes(subject.toLowerCase())
            );
            console.log(`Filtrando por assunto: ${subject}`);
        }

        if (recipients) {
            filtered = filtered.filter((email) =>
                email.clients.some((client) =>
                    client.mail.toLowerCase().includes(recipients.toLowerCase())
                )
            );
            console.log(`Filtrando por destinatário: ${recipients}`);
        }

        if (status.sent) {
            filtered = filtered.filter((email) => email.status === "sent");
            console.log('Filtrando por status: Enviado');
        }
        if (status.pending) {
            filtered = filtered.filter((email) => email.status === "pending");
            console.log('Filtrando por status: Pendente');
        }
        if (status.failed) {
            filtered = filtered.filter((email) => email.status === "failed");
            console.log('Filtrando por status: Falha');
        }

        if (date) {
            filtered = filtered.filter(
                (email) => email.send_date === date
            );
            console.log(`Filtrando por data: ${date}`);
        }

        if (id) {
            filtered = filtered.filter((email) => email.id === Number(id));
            console.log(`Filtrando por ID: ${id}`);
        }

        console.log('Emails filtrados:', filtered);

        setFilteredMails(filtered);
    };

    const clearFilters = () => {
        console.log('Limpar filtros...');
        setSubject('');
        setRecipients('');
        setStatus({
            sent: false,
            pending: false,
            failed: false,
        });
        setDate('');
        setId('');
        setFilteredMails(mails);
        console.log('Filtros limpos, mostrando todos os e-mails');
    };

    const openModal = (clients: EmailClient[]) => {
        const names = clients.map((c) => c.name);
        const mails = clients.map((c) => c.mail);
        setModalNames(names);
        setModalMails(mails);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!clientIdToDelete) return;
        setLoading(true);
        try {
            await api.delete(`/emails/${clientIdToDelete}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            await fetchEmails();
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao deletar o e-mail.");
        } finally {
            setIsModalCrashOpen(false);
            setClientIdToDelete(null);
            setLoading(false);
        }
    };

    const openDeleteModal = (id: number) => {
        setClientIdToDelete(id);
        setIsModalCrashOpen(true);
    };

    if (loading) {
        return <Spin />;
    }

    return (
        <div className="p-4 min-h-screen bg-gradient-to-br text-white relative overflow-hidden">
            <Header name={authUser?.nome_completo} />
            <div className="max-w-1xl mx-auto py-7 z-10 relative">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/5 w-full bg-white/80 text-blue-900 rounded-2xl shadow-xl p-6 h-fit animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Filtros</h2>

                        {/* Filtro de ID */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-1">ID</label>
                            <input
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="Buscar por ID..."
                                className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring focus:ring-blue-200"
                            />
                        </div>

                        {/* Filtro de Destinatários */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-1">Destinatários</label>
                            <input
                                type="text"
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                                placeholder="Buscar por destinatário..."
                                className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring focus:ring-blue-200"
                            />
                        </div>

                        {/* Filtro de Assunto */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-1">Assunto</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Buscar por assunto..."
                                className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring focus:ring-blue-200"
                            />
                        </div>

                        {/* Filtro de Status */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-1">Status</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={status.sent}
                                        onChange={() => setStatus((prevStatus) => ({
                                            ...prevStatus,
                                            sent: !prevStatus.sent,
                                        }))}
                                        className="accent-green-500"
                                    />
                                    Enviado
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={status.pending}
                                        onChange={() => setStatus((prevStatus) => ({
                                            ...prevStatus,
                                            pending: !prevStatus.pending,
                                        }))}
                                        className="accent-yellow-500"
                                    />
                                    Pendente
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={status.failed}
                                        onChange={() => setStatus((prevStatus) => ({
                                            ...prevStatus,
                                            failed: !prevStatus.failed,
                                        }))}
                                        className="accent-red-500"
                                    />
                                    Falha
                                </label>
                            </div>
                        </div>


                        {/* Filtro de Data de Envio */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-1">Data de envio</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring focus:ring-blue-200"
                            />
                        </div>

                        {/* Botões de Aplicar e Limpar */}
                        <div className="flex justify-between gap-2">
                            <button
                                onClick={applyFilters}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Aplicar
                            </button>
                            <button
                                onClick={clearFilters}
                                className="bg-gray-300 text-blue-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>

                    <div className="lg:w-3/4 w-full">
                        {loading ? (
                            <Spin />
                        ) : (
                            <>
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 animate-fade-in">
                                    <div className="flex items-center justify-center gap-5 flex-wrap">
                                        <h1 className="text-4xl font-extrabold drop-shadow-xl flex items-center gap-2">
                                            <CiMail className="w-8 h-8 animate-bounce" /> E-mails Agendados
                                        </h1>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <span className="inline-block w-3 h-3 rounded-full bg-green-300 animate-ping"></span>
                                            Enviados
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <span className="inline-block w-3 h-3 rounded-full bg-red-300 animate-ping"></span>
                                            Falhas
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <span className="inline-block w-3 h-3 rounded-full bg-white animate-pulse"></span>
                                            Pendentes
                                        </div>
                                    </div>
                                    <FaPlus
                                        className="cursor-pointer w-8 h-8 text-white hover:text-green-300 transition-transform transform hover:scale-110"
                                        onClick={() => navigate("/mails/create")}
                                        title="Agendar novo e-mail"
                                    />
                                </div>

                                {/* Tabela */}
                                <div className="overflow-x-auto rounded-2xl shadow-2xl animate-slide-up">
                                    <div className="min-w-full">
                                        <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-blue-200 text-blue-900 font-semibold text-sm text-center rounded-t-2xl">
                                            <div className="flex justify-center items-center gap-1"><MdOutlineFormatListNumbered /> ID</div>
                                            <div className="flex justify-center items-center gap-1"><CiMail /> Assunto</div>
                                            <div className="flex justify-center items-center gap-1">Destinatários</div>
                                            <div className="flex justify-center items-center gap-1"><MdSchedule /> Agendamento</div>
                                            <div className="flex justify-center items-center gap-1"><IoIosInformationCircleOutline /> Status</div>
                                            <div className="flex justify-center items-center gap-1"><FaPlus /> Ações</div>
                                        </div>

                                        {/* Renderizando os e-mails filtrados */}
                                        {filteredMails.map((mail, i) => {
                                            const agendamento = new Date(`${mail.send_date}T${mail.send_time}`);
                                            const isPast = agendamento < now;
                                            const isSent = mail.status === "sent";
                                            const isFailed = mail.status === "failed";
                                            const isPending = mail.status === "pending";

                                            let rowBg = "bg-white"; // Cor de fundo padrão
                                            if (isSent) rowBg = "bg-green-200";
                                            if (isFailed) rowBg = "bg-red-200";
                                            if (isPending) rowBg = "bg-white";

                                            console.log(`ID: ${mail.id}`, {
                                                status: mail.status,
                                                isPast,
                                                isFailed,
                                                isSent,
                                                isPending
                                            });
                                            return (
                                                <div
                                                    key={mail.id}
                                                    className={`grid grid-cols-6 gap-4 px-4 py-4 text-sm text-blue-900 text-center border-b ${rowBg} ${i === mails.length - 1 ? "rounded-b-2xl" : ""}`}
                                                >
                                                    <div>{mail.id}</div>
                                                    <div className="truncate max-w-[200px]" title={mail.subject}>{mail.subject}</div>
                                                    <div className="flex justify-center items-center gap-1 max-w-[200px]" title={mail.clients?.map(c => c.name).join(", ")}>
                                                        <span className="truncate">
                                                            {mail.clients?.slice(0, 2).map(c => c.name).join(", ")}
                                                        </span>
                                                        {mail.clients.length > 2 && (
                                                            <AiOutlineEye
                                                                onClick={() => openModal(mail.clients)}
                                                                className="text-red-500 cursor-pointer w-5 h-5 hover:scale-110 transition-transform"
                                                                title="Visualizar destinatários"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>{mail.send_date} às {mail.send_time}</div>
                                                    <div className="flex items-center justify-center gap-1">
                                                        {isPending && <><MdAccessTime className="text-yellow-500 w-4 h-4 animate-pulse" /><span>Pendente</span></>}
                                                        {isSent && <><MdCheckCircle className="text-green-600 w-4 h-4" /><span>Enviado</span></>}
                                                        {isFailed && <><MdErrorOutline className="text-red-600 w-4 h-4" /><span>Falha</span></>}
                                                    </div>
                                                    <div className="flex justify-center gap-2">
                                                        <AiOutlineEye
                                                            className="cursor-pointer w-5 h-5 text-blue-700 hover:text-blue-900"
                                                            title="Visualizar"
                                                            onClick={() => {
                                                                setPreviewEmail(mail);
                                                                setPreviewModalOpen(true);
                                                            }}
                                                        />
                                                        <button onClick={() => {
                                                            setPreviewEmail(mail);
                                                            setPreviewModalOpenEdit(true);
                                                        }}>
                                                            <Pencil className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                                                        </button>
                                                        <button onClick={() => openDeleteModal(mail.id)} className="text-red-500 hover:text-red-700">
                                                            <Trash className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        <DeleteConfirmModal
                            isVisible={isModalCrashOpen}
                            onClose={() => {
                                setIsModalCrashOpen(false);
                                setClientIdToDelete(null);
                            }}
                            onConfirm={handleDelete}
                            loading={loading}
                        />

                        <EmailPreviewModal
                            isVisible={isPreviewModalOpen}
                            onClose={() => {
                                setPreviewModalOpen(false);
                                setPreviewEmail(null);
                            }}
                            email={previewEmail}
                        />

                        <EditEmailModal
                            isVisible={isPreviewModalOpenEdit}
                            onClose={() => {
                                setPreviewModalOpenEdit(false);
                                setPreviewEmail(null);
                            }}
                            email={previewEmail}
                            onUpdate={async (updatedEmail) => {
                                try {
                                    await api.put(`/emails/${updatedEmail.id}`, updatedEmail, {
                                        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                                    });
                                    setPreviewEmail(updatedEmail);
                                    await fetchEmails();
                                    setPreviewModalOpenEdit(false);
                                } catch (error) {
                                    console.error("Erro ao atualizar o e-mail:", error);
                                    alert("Erro ao salvar o e-mail.");
                                }
                            }}
                            onRemoveAttachment={(index) => {
                                if (!previewEmail) return;
                                const updated = {
                                    ...previewEmail,
                                    attachments: previewEmail.attachments.filter((_, i) => i !== index),
                                };
                                setPreviewEmail(updated);
                            }}
                        />

                        {isModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                                    <h3 className="text-lg font-bold text-blue-800 mb-4">Destinatários</h3>
                                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                                        {modalNames.map((name, index) => (
                                            <li key={index} className="border-b pb-2">
                                                <p className="font-medium text-gray-800">{name}</p>
                                                <p className="text-sm text-gray-600">{modalMails[index]}</p>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                                        onClick={() => setIsModalOpen(false)}
                                        title="Fechar"
                                    >
                                        ✖
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Mails;