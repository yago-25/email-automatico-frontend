import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import "./UserTable.css";
import { Pencil, Trash } from "lucide-react";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { MdOutlineFormatListNumbered } from "react-icons/md";
import { CiPhone, CiMail } from "react-icons/ci";
import { FaGear } from "react-icons/fa6";
import { HiOutlineUser } from "react-icons/hi";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";

interface Cargo {
    id: number;
    nome: string;
}
interface User {
    cargo?: Cargo;
    cargo_id?: number;
    created_at: string;
    email: string;
    email_verificado_at: string | null;
    id: number;
    nome_completo: string;
    nome_usuario: string;
    telefone: string;
    updated_at: string;
    url: string;
}

interface ButtonProps {
    text: any;
    onClick: () => void;
    className?: string;
}

interface DeleteConfirmModal {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
    return (
        <button onClick={onClick} className="cursor-pointer w-44 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all group active:w-11 active:h-11 active:rounded-full active:duration-300 ease-in-out">
            <svg className="animate-spin hidden group-active:block mx-auto" width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            </svg>
            <span className="group-active:hidden">{text}</span>
        </button>
    );
};

const Users = () => {
    const { t } = useTranslation();
    const storedUser = localStorage.getItem("user");
    const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
    const [users, setUsers] = useState<User[]>([]);
    const [filteredTxt, setFilteredTxt] = useState("");
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCrashOpen, setIsModalCrashOpen] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const itemsPerPage = 5;

    const formatPhone = (phone: string): string => {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        return phone;
    };

    const filteredUsers = users.filter(
        (user) =>
            user.nome_completo.toLowerCase().includes(filteredTxt.toLowerCase()) ||
            user.email.toLowerCase().includes(filteredTxt.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get("/usersTable", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                },
            });
            setUsers(response.data);
        } catch (e) {
            messageAlert({ type: "error", message: t("users.fetch_error") });
        } finally {
            setLoading(false);
        }
    };
    const getCargos = async () => {
        try {
            const response = await api.get("/cargos", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            setCargos(response.data);
        } catch (e) {
            messageAlert({ type: "error", message: t("users.fetch_cargos_error") });
        }
    };

    useEffect(() => {
        getCargos();
    }, []);



    const handleEdit = async () => {
        if (!editingUser) return;
        setLoading(true);
        try {
            await api.put(
                `/usersTable/${editingUser.id}`,
                {
                    ...editingUser,
                    cargo_id: editingUser.cargo_id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            messageAlert({ type: "success", message: t("users.updated_successfully") });
            setIsModalOpen(false);
            getUsers();
        } catch (error) {
            messageAlert({ type: "error", message: t("users.update_error") });
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async () => {
        if (userIdToDelete === null) return;

        setLoading(true);
        try {
            await api.delete(`/usersTable/${userIdToDelete}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            setUsers(users.filter((user) => user.id !== userIdToDelete));

            messageAlert({
                type: "success",
                message: t("users.deleted_successfully"),
            });
        } catch (error) {
            messageAlert({
                type: "error",
                message: t("users.delete_error"),
            });
            console.log(error, "Error");
        } finally {
            setLoading(false);
            setIsModalCrashOpen(false);
            setUserIdToDelete(null);
        }
    };


    useEffect(() => {
        getUsers();
    }, []);

    if (loading) return <Spin />;

    return (
        <div className="body">
            <Header name={authUser?.nome_completo} />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-white">👤 {t("users.users")}</h1>
                    <input
                        placeholder={t("users.search_placeholder")}
                        type="text"
                        className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        onChange={(e) => {
                            setFilteredTxt(e.target.value);
                            setCurrentPage(1);
                        }}
                        value={filteredTxt}
                    />
                </div>

                <div className="w-full rounded-xl overflow-hidden shadow-md">
                    <div className="grid grid-cols-6 gap-x-6 items-center px-6 py-4 bg-blue-100 border-b text-blue-900 font-semibold text-sm">
                        <p className="flex items-center gap-2"><MdOutlineFormatListNumbered /> ID</p>
                        <p className="flex items-center gap-2"><HiOutlineUser /> {t("users.name")}</p>
                        <p className="flex items-center gap-2"><CiMail /> {t("users.email")}</p>
                        <p className="flex items-center gap-2"><CiPhone /> {t("users.phone")}</p>
                        <p className="flex items-center gap-2"><FaGear /> {t("users.cargo_id")}</p> {/* Cargo */}
                        <p className="flex items-center justify-center gap-2"><FaGear /> {t("users.actions")}</p>
                    </div>

                    {currentUsers.map((user) => (
                        <div key={user.id} className="grid grid-cols-6 gap-x-6 items-center px-6 py-4 bg-white border-b hover:bg-gray-50 text-sm">
                            <p>{user.id}</p>
                            <p title={user.nome_completo}>{user.nome_completo}</p>
                            <p title={user.email} className="max-w-96 overflow-hidden text-ellipsis truncate">{user.email}</p>
                            <p title={user.telefone}>{formatPhone(user.telefone)}</p>
                            <p title={user.cargo?.nome}>{user.cargo?.nome || "-"}</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700">
                                    <Pencil className="h-5 w-5" />
                                </button>
                                <button onClick={() => { setUserIdToDelete(user.id); setIsModalCrashOpen(true); }} className="text-red-500 hover:text-red-700">
                                    <Trash className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <DeleteConfirmModal
                    isVisible={isModalCrashOpen}
                    onClose={() => { setIsModalCrashOpen(false); setUserIdToDelete(null); }}
                    onConfirm={handleDelete}
                    loading={loading}
                />

                <div className="flex justify-center items-center gap-4 mt-8">
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        <MdArrowBackIos />
                    </button>
                    <span className="font-medium text-gray-700">
                        {currentPage} {t("users.of")} {totalPages}
                    </span>
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        <MdArrowForwardIos />
                    </button>
                </div>

                <div className="flex justify-end mt-10">

                </div>

                <Modal title={t("users.edit_user")} isVisible={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    {editingUser ? (
                        <div className="flex flex-col items-center justify-center w-full gap-4">
                            <div className="w-full">
                                <p>{t("users.name")}</p>
                                <Input
                                    type="text"
                                    required
                                    onChange={(e) => setEditingUser({ ...editingUser, nome_completo: e.target.value })}
                                    value={editingUser.nome_completo}
                                />
                            </div>
                            <div className="w-full">
                                <p>{t("users.phone")}</p>
                                <Input
                                    type="text"
                                    required
                                    onChange={(e) => setEditingUser({ ...editingUser, telefone: e.target.value })}
                                    value={editingUser.telefone}
                                />
                            </div>
                            <div className="w-full">
                                <p>{t("users.email")}</p>
                                <Input
                                    type="email"
                                    required
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    value={editingUser.email}
                                />
                            </div>
                            <div className="w-full">
                                <p>{t("users.cargo_id")}</p>
                                <select
                                    value={editingUser.cargo_id || ""}
                                    onChange={(e) => setEditingUser({ ...editingUser, cargo_id: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    {cargos.map((cargo) => (
                                        <option key={cargo.id} value={cargo.id}>
                                            {cargo.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button text={t("users.save_changes") as string} onClick={handleEdit} />
                        </div>
                    ) : (
                        <Spin />
                    )}
                </Modal>



            </div>
        </div>
    );
};

export default Users;
