/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import "./clients.css";
import { Pencil, Trash } from "lucide-react";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { User } from "../../models/User";
import { useTranslation } from "react-i18next";
import { MdOutlineFormatListNumbered } from "react-icons/md";
import { CiPhone } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import { FaGear } from "react-icons/fa6";
import { HiOutlineUser } from "react-icons/hi";
import { IoTicketOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";
import { HiMail, HiPhone, HiUser } from "react-icons/hi";
import { HiUserAdd, HiX } from "react-icons/hi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaEraser } from "react-icons/fa";

interface Client {
  id: number;
  name: string;
  phone: string;
  mail: string;
}

interface ButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
}
interface DeleteConfirmModal {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer w-44 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all group active:w-11 active:h-11 active:rounded-full active:duration-300 ease-in-out"
    >
      <svg
        className="animate-spin hidden group-active:block mx-auto"
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      ></svg>
      <span className="group-active:hidden">{text}</span>
    </button>
  );
};

const Clients = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const [clients, setClients] = useState<Client[]>([]);
  const [addClient, setAddClient] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientMail, setClientMail] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCrashOpen, setIsModalCrashOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredTxt, setFilteredTxt] = useState("");
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPost, setLoadingPost] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState<number | null>(null);

  const location = useLocation();
  const params = location?.state || [];

  const formatPhone = (phone: string): string => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };

  const filteredClients = clients.filter(
    (client: Client) =>
      client.name.toLowerCase().includes(filteredTxt.toLowerCase()) ||
      client.mail.toLowerCase().includes(filteredTxt.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getClients = async () => {
    setLoading(true);
    try {
      const response = await api.get("/clients", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setClients(response.data);
    } catch (e) {
      console.log("Erro ao listar clientes: ", e);
      messageAlert({
        type: "error",
        message: t("clients.fetch_error"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.client?.id && params?.client) {
      if (clients.length !== 1 || clients[0].id !== params?.client?.id) {
        setClients([params.client]);
      }
    } else {
      getClients();
    }
  }, [params?.client?.id, params.client]);

  const handleAddClient = async () => {
    setLoadingPost(true);
    try {
      if (!clientName || !clientPhone || !clientMail) {
        messageAlert({
          type: "error",
          message: t("clients.fill_all_fields"),
        });
        return;
      }

      await api.post(
        "/clients",
        {
          name: clientName,
          phone: clientPhone,
          mail: clientMail,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      messageAlert({
        type: "success",
        message: t("clients.created_successfully"),
      });
      setAddClient(false);
      setClientName("");
      setClientPhone("");
      setClientMail("");
    } catch (e) {
      console.log("Erro ao criar usuário: ", e);
      messageAlert({
        type: "error",
        message: t("clients.create_error"),
      });
    } finally {
      setLoadingPost(false);
    }
  };

  const handleDelete = async () => {
    if (clientIdToDelete === null) return;

    setLoading(true);
    try {
      await api.delete(`/clients/${clientIdToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setClients(clients.filter((client) => client.id !== clientIdToDelete));
      messageAlert({
        type: "success",
        message: t("clients.deleted_successfully"),
      });
    } catch (error) {
      messageAlert({
        type: "error",
        message: t("clients.delete_error"),
      });
      console.log(error, "Error");
    } finally {
      setLoading(false);
      setIsModalCrashOpen(false);
      setClientIdToDelete(null);
    }
  };

  const openDeleteModal = (id: number) => {
    setClientIdToDelete(id);
    setIsModalCrashOpen(true);
  };
  if (loading) {
    return <Spin />;
  }

  const handleEdit = async () => {
    if (!editingClient) return;

    setLoading(true);
    try {
      await api.put(`/clients/${editingClient.id}`, editingClient, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setClients(
        clients.map((c) => (c.id === editingClient.id ? editingClient : c))
      );
      messageAlert({
        type: "success",
        message: t("clients.updated_successfully"),
      });
      setIsModalOpen(false);
    } catch (error) {
      messageAlert({
        type: "error",
        message: t("clients.update_error"),
      });
      console.log(error, "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleTicket = (ticket: Client) => {
    navigate(`/ticket`, { state: { ticket } });
  };

  const handleClearFilter = () => {
    setFilteredTxt("");
    navigate("/clients", { replace: true, state: null });
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="body">
      <Header name={authUser?.nome_completo} />
      <div className="max-w-[1500px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-white">{`📝 ${t(
            "clients.clients"
          )}`}</h1>

          <div className="flex w-full sm:w-auto gap-2">
            <input
              placeholder={t("clients.search_placeholder")}
              type="text"
              name="text"
              className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              onChange={(e) => {
                setFilteredTxt(e.target.value);
                setCurrentPage(1);
              }}
              value={filteredTxt}
            />
            <button
              onClick={handleClearFilter}
              className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-200"
            >
              <FaEraser className="w-5 h-5" />
              {t("filters.clear")}
            </button>
            <button
              onClick={() => setAddClient(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              <HiUserAdd className="w-5 h-5" />
              {t("dashboard.add_client")}
            </button>
          </div>
        </div>

        <div className="w-full rounded-xl overflow-hidden shadow-md">
          <div className="grid grid-cols-5 gap-x-6 items-center px-6 py-4 bg-blue-100 border-b text-blue-900 font-semibold text-sm">
            <p className="flex items-center gap-2">
              <MdOutlineFormatListNumbered /> ID
            </p>
            <p className="flex items-center gap-2">
              <HiOutlineUser /> {t("clients.name")}
            </p>
            <p className="flex items-center gap-2">
              <CiMail /> {t("clients.email")}
            </p>
            <p className="flex items-center gap-2">
              <CiPhone /> {t("clients.phone")}
            </p>
            <p className="flex items-center justify-center gap-2">
              <FaGear /> {t("clients.actions")}
            </p>
          </div>

          {currentClients.map((client) => (
            <div
              key={client.id}
              className="grid grid-cols-5 gap-x-6 items-center px-6 py-4 bg-white border-b hover:bg-gray-50 text-sm"
            >
              <p>{client.id}</p>
              <p title={client.name}>{client.name}</p>
              <p
                title={client.mail}
                className="max-w-96 overflow-hidden text-ellipsis truncate"
              >
                {client.mail}
              </p>
              <p title={client.phone}>{formatPhone(client.phone)}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleTicket(client)}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  <IoTicketOutline className="h-5 w-5" />
                </button>

                <button
                  onClick={() => {
                    setEditingClient(client);
                    setIsModalOpen(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Pencil className="h-5 w-5" />
                </button>

                <button
                  onClick={() => openDeleteModal(client.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <DeleteConfirmModal
          isVisible={isModalCrashOpen}
          onClose={() => {
            setIsModalCrashOpen(false);
            setClientIdToDelete(null);
          }}
          onConfirm={handleDelete}
        />

        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-[#00448d] text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <MdArrowBackIos />
          </button>
          <span className="font-medium text-gray-700">
            {currentPage} {t("clients.of")} {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-[#00448d] text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <MdArrowForwardIos />
          </button>
        </div>

        <Modal
          title={t("clients.edit_client")}
          isVisible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <Spin />
            </div>
          ) : editingClient ? (
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <div>
                <p>{t("clients.name")}</p>
                <Input
                  text={t("clients.name")}
                  type="text"
                  required
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, name: e.target.value })
                  }
                  value={editingClient.name}
                />
              </div>
              <div>
                <p>{t("clients.phone")}</p>
                <Input
                  text={t("clients.phone")}
                  type="text"
                  required
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      phone: e.target.value,
                    })
                  }
                  value={editingClient.phone}
                />
              </div>
              <div>
                <p>{t("clients.email")}</p>
                <Input
                  text={t("clients.email")}
                  type="email"
                  required
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, mail: e.target.value })
                  }
                  value={editingClient.mail}
                />
              </div>
              <Button text={t("clients.save_changes")} onClick={handleEdit} />
            </div>
          ) : (
            <div className="text-center text-red-500">
              {t("clients.load_error")}
            </div>
          )}
        </Modal>

        <Modal
          title={
            <div className="flex items-center gap-3 text-blue-600">
              <HiUserAdd className="w-6 h-6" />
              <span className="text-2xl font-bold">
                {t("dashboard.add_client")}
              </span>
            </div>
          }
          isVisible={addClient}
          onClose={() => setAddClient(false)}
        >
          {loadingPost ? (
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <Spin />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-2xl shadow-lg space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <HiUser className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("dashboard.name")}
                  </label>
                </div>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  placeholder={t("dashboard.name")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-green-100 rounded-xl text-green-600">
                    <HiPhone className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("dashboard.phone")}
                  </label>
                </div>
                <PhoneInput
                  country={"br"}
                  value={clientPhone}
                  onChange={setClientPhone}
                  prefix="+"
                  inputProps={{
                    required: true,
                    className:
                      "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/70 backdrop-blur-sm transition-all duration-200",
                  }}
                  containerStyle={{ width: "100%" }}
                  inputStyle={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "0.75rem",
                    border: "1px solid #E5E7EB",
                    fontSize: "16px",
                    paddingLeft: "43px",
                  }}
                  buttonStyle={{
                    borderTopLeftRadius: "0.75rem",
                    borderBottomLeftRadius: "0.75rem",
                    backgroundColor: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                    borderRight: "none",
                  }}
                  enableSearch={false}
                  disableSearchIcon={true}
                  countryCodeEditable={false}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                    <HiMail className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("dashboard.email")}
                  </label>
                </div>
                <input
                  type="email"
                  value={clientMail}
                  onChange={(e) => setClientMail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  placeholder={t("dashboard.email")}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleAddClient}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  <HiUserAdd className="w-5 h-5" />
                  {t("dashboard.add_client")}
                </button>
                <button
                  onClick={() => setAddClient(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  <HiX className="w-5 h-5" />
                  {t("buttons.cancel")}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Clients;
