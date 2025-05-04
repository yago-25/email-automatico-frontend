import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwr } from "../../api/useSwr";
import { FaRegTrashAlt } from "react-icons/fa";
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
    const now = new Date();
    const [modalNames, setModalNames] = useState<string[]>([]);
    const [modalMails, setModalMails] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCrashOpen, setIsModalCrashOpen] = useState(false);
    const [clientIdToDelete, setClientIdToDelete] = useState<number | null>(null);
    const [mails, setMails] = useState<EmailItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewEmail, setPreviewEmail] = useState<EmailItem | null>(null);

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const response = await api.get("/emails", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            setMails(response.data);
        } catch (error) {
            console.error("Erro ao carregar e-mails", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

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
        <div className="p-4">
            <h1 className="text-3xl font-bold text-white">Listagem de Email</h1>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {loading ? (
                    <Spin />
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-xl font-semibold text-blue-900">E-mails Agendados</h2>
                            <FaPlus
                                className="cursor-pointer w-6 h-6 text-blue-700 hover:text-blue-900 transition"
                                onClick={() => navigate("/mails/create")}
                            />
                        </div>

                        <div className="overflow-x-auto rounded-xl">
                            <div className="min-w-full">
                                <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-blue-100 text-blue-900 font-semibold text-sm text-center rounded-t-lg">
                                    <div className="flex justify-center items-center gap-1"><MdOutlineFormatListNumbered /> ID</div>
                                    <div className="flex justify-center items-center gap-1"><CiMail /> Assunto</div>
                                    <div className="flex justify-center items-center gap-1">Destinatários</div>
                                    <div className="flex justify-center items-center gap-1"><MdSchedule /> Agendamento</div>
                                    <div className="flex justify-center items-center gap-1"><IoIosInformationCircleOutline /> Status</div>
                                    <div className="flex justify-center items-center gap-1"><FaPlus /> Ações</div>
                                </div>

                                {mails.map((mail, i) => {
                                    const agendamento = new Date(`${mail.send_date}T${mail.send_time}`);
                                    const isPast = agendamento < now;

                                    return (
                                        <div
                                            key={mail.id}
                                            className={`grid grid-cols-6 gap-4 px-4 py-4 text-sm text-blue-900 text-center border-b ${isPast ? "bg-white" : "bg-white"} ${i === mails.length - 1 ? "rounded-b-xl" : ""}`}
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
                                                        className="text-red-500 cursor-pointer w-5 h-5"
                                                        title="Visualizar destinatários"
                                                    />
                                                )}
                                            </div>

                                            <div>{mail.send_date} às {mail.send_time}</div>

                                            <div className="flex items-center justify-center gap-1">
                                                {mail.status === "pending" && (
                                                    <>
                                                        <MdAccessTime className="text-yellow-500 w-4 h-4" />
                                                        <span>Pendente</span>
                                                    </>
                                                )}
                                                {mail.status === "sent" && (
                                                    <>
                                                        <MdCheckCircle className="text-green-600 w-4 h-4" />
                                                        <span>Enviado</span>
                                                    </>
                                                )}
                                                {mail.status === "failed" && (
                                                    <>
                                                        <MdErrorOutline className="text-red-600 w-4 h-4" />
                                                        <span>Falha</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex justify-center gap-2">
                                                <AiOutlineEye
                                                    className="cursor-pointer w-5 h-5 text-blue-700 hover:text-blue-900"
                                                    title="Visualizar"
                                                    onClick={() => {
                                                        setPreviewEmail(mail); // `mail` é o objeto do e-mail no .map
                                                        setPreviewModalOpen(true);
                                                    }}
                                                />

                                                <button
                                                    onClick={() => openDeleteModal(mail.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
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

            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
    );
};
export default Mails;