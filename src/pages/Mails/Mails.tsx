import { useNavigate } from "react-router-dom";
import { useSwr } from "../../api/useSwr";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaGear, FaPlus } from "react-icons/fa6";
import { MdOutlineFormatListNumbered, MdSchedule } from "react-icons/md";
import { HiOutlineUser } from "react-icons/hi";
import { CiMail } from "react-icons/ci";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { RxPencil2 } from "react-icons/rx";
import { AiOutlineEye } from "react-icons/ai";
import Spin from "../../components/Spin/Spin";
import { MdCheckCircle, MdAccessTime, MdErrorOutline } from "react-icons/md";

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
}

const Mails = () => {
    const navigate = useNavigate();
    const { data, loading } = useSwr<EmailItem[]>("/emails");
    const now = new Date();

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
                                    <div className="flex justify-center items-center gap-1"><FaGear /> Ações</div>
                                </div>

                                {data &&
                                    data.map((mail, i) => {
                                        const agendamento = new Date(`${mail.send_date}T${mail.send_time}`);
                                        const isPast = agendamento < now;

                                        return (
                                            <div
                                                key={mail.id}
                                                className={`grid grid-cols-6 gap-4 px-4 py-4 text-sm text-blue-900 text-center border-b ${isPast ? "bg-white" : "bg-white"
                                                    } ${i === data.length - 1 ? "rounded-b-xl" : ""}`}
                                            >
                                                <div>{mail.id}</div>
                                                <div className="truncate max-w-[200px]" title={mail.subject}>{mail.subject}</div>
                                                <div className="truncate" title={mail.clients?.map(c => c.name).join(", ")}>{mail.clients?.map(c => c.name).join(", ")}</div>
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
                                                    <AiOutlineEye className="cursor-pointer w-5 h-5 text-blue-700 hover:text-blue-900" title="Visualizar" />
                                                    {/* <RxPencil2 className="cursor-pointer w-5 h-5 text-blue-700 hover:text-blue-900" title="Editar" /> */}
                                                    <FaRegTrashAlt className="cursor-pointer w-5 h-5 text-red-600 hover:text-red-800" title="Deletar" />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

};

export default Mails;
