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
// import { IoMdAddCircleOutline } from "react-icons/io";
import { IoTicketOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";
import { HiMail, HiPhone, HiUser } from "react-icons/hi";
import { HiUserAdd } from "react-icons/hi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {  FaEraser } from "react-icons/fa";

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
  const queryParams = new URLSearchParams(location.search);
  const clientNameQuery = queryParams.get('name');
  const params = new URLSearchParams(location.search);
  const clientId = params.get('clientId');

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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get("/clients", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        let data: Client[] = response.data; // 👈 Aqui você tipa

        if (clientId) {
          data = data.filter((c) => c.id === Number(clientId));
        } else if (clientNameQuery) {
          data = data.filter(
            (c) => c.name.toLowerCase() === clientNameQuery.toLowerCase()
          );
          setFilteredTxt(clientNameQuery);
        }

        setClients(data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [clientId, clientNameQuery]);

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
    getClients();
  }, []);

  useEffect(() => {
    getClients();
  }, [loadingPost]);

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

  const handleTicket = (ticketName: string) => {
    navigate(`/ticket/${ticketName}`);
  };
  const handleClearFilter = () => {
    setFilteredTxt("");
    navigate("/clients");
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="body">
      <Header name={authUser?.nome_completo} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-white">{`📝 ${t("clients.clients")}`}</h1>

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
              {t('filters.clear')}
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
                  onClick={() => handleTicket(client.name)}
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
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <MdArrowBackIos />
          </button>
          <span className="font-medium text-gray-700">
            {currentPage} {t("clients.of")} {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
          title={t("dashboard.add_client")}
          isVisible={addClient}
          onClose={() => setAddClient(false)}
        >
          {loadingPost ? (
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <Spin />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full gap-6 p-6 bg-white rounded-xl shadow-lg">
              <div className="w-full space-y-4">
                <div className="flex items-center gap-2">
                  <HiUser className="w-5 h-5 text-gray-500" />
                  <p className="text-gray-700 text-sm font-semibold">
                    {t("dashboard.name")}
                  </p>
                </div>
                <input
                  placeholder={t("dashboard.name")}
                  type="text"
                  required
                  onChange={(e) => setClientName(e.target.value)}
                  value={clientName}
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition duration-200"
                />

                <div className="w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <HiPhone className="w-5 h-5 text-gray-500" />
                    <p className="text-gray-700 text-sm font-semibold">
                      {t("dashboard.phone")}
                    </p>
                  </div>
                  <PhoneInput
                    country={"br"}
                    value={clientPhone}
                    onChange={setClientPhone}
                    inputProps={{
                      required: true,
                      name: "phone",
                    }}
                    containerStyle={{ width: "100%" }}
                    inputStyle={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "0.75rem",
                      border: "1px solid #D1D5DB",
                      paddingLeft: "48px",
                      fontSize: "16px",
                    }}
                    buttonStyle={{
                      borderTopLeftRadius: "0.75rem",
                      borderBottomLeftRadius: "0.75rem",
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <HiMail className="w-5 h-5 text-gray-500" />
                  <p className="text-gray-700 text-sm font-semibold">
                    {t("dashboard.email")}
                  </p>
                </div>
                <input
                  placeholder={t("dashboard.email")}
                  type="email"
                  required
                  onChange={(e) => setClientMail(e.target.value)}
                  value={clientMail}
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition duration-200"
                />

                <div className="w-full mt-6">
                  <button
                    value="Cadastrar Cliente"
                    onClick={handleAddClient}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <HiUserAdd className="w-5 h-5" />
                    {t("dashboard.add_client")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Clients;
