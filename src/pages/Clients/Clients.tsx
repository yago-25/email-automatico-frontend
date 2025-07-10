/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import "./clients.css";
import { Eye, EyeOff, Pencil, Trash } from "lucide-react";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import {
  MdArrowBackIos,
  MdArrowForwardIos,
  MdOutlinePassword,
} from "react-icons/md";
import { User } from "../../models/User";
import { useTranslation } from "react-i18next";
import { MdOutlineFormatListNumbered } from "react-icons/md";
import { CiPhone, CiUser } from "react-icons/ci";
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
import useSwr from "swr";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Tooltip } from "antd";

interface Client {
  id: number;
  name: string;
  phone: string;
  mail: string;
  user?: string;
  password?: string;
}

interface DeleteConfirmModal {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PasswordCell = ({ password }: { password: string }) => {
  const [visible, setVisible] = useState(false);
  const toggleVisibility = () => setVisible((prev) => !prev);

  return (
    <div className="flex items-center justify-center gap-2 max-w-[220px] group">
      <Tooltip
        title={
          password ? (visible ? password : "*".repeat(password.length)) : null
        }
      >
        <p className="text-center text-gray-700 max-w-[100px] truncate">
          {password ? (visible ? password : "*".repeat(password.length)) : "-"}
        </p>
      </Tooltip>
      {password && (
        <button
          type="button"
          onClick={toggleVisibility}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
};

const Clients = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const cargo = user.cargo_id;

  const navigate = useNavigate();
  const { t } = useTranslation();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const [addClient, setAddClient] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientMail, setClientMail] = useState("");
  const [clientUser, setClientUser] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCrashOpen, setIsModalCrashOpen] = useState(false);
  const [filteredTxt, setFilteredTxt] = useState("");
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPost, setLoadingPost] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState<number | null>(null);

  const { state } = useLocation();
  const clientFromState = state?.client;

  const formatPhone = (phone: string): string => {
    try {
      const parsed = parsePhoneNumberFromString(phone);

      if (parsed && parsed.isValid()) {
        const countryCode = parsed.countryCallingCode;
        const national = parsed.formatNational();
        return `+${countryCode} ${national}`;
      }

      return phone;
    } catch (err) {
      console.error("Erro ao formatar número:", err);
      return phone;
    }
  };

  const {
    data: clients = [],
    isLoading,
    mutate,
  } = useSwr<Client[]>("/clients", {
    fetcher: (url) =>
      api
        .get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((res) => res.data),
  });

  useEffect(() => {
    if (clientFromState?.id) {
      mutate();
    }
  }, [clientFromState?.id]);

  const filteredClients = clientFromState
    ? clients.filter((client) => client.id === clientFromState.id)
    : clients
      .filter(
        (client) =>
          client.name.toLowerCase().includes(filteredTxt.toLowerCase()) ||
          client.mail.toLowerCase().includes(filteredTxt.toLowerCase())
      )
      .sort((a, b) => a.id - b.id);

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
          user: clientUser,
          password: clientPassword,
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

      await mutate();
      setAddClient(false);
      setClientName("");
      setClientPhone("");
      setClientMail("");
    } catch (e) {
      messageAlert({
        type: "error",
        message: t("clients.create_error"),
      });
      console.log("Erro ao criar cliente:", e);
    } finally {
      setLoadingPost(false);
    }
  };

  const handleDelete = async () => {
    if (clientIdToDelete === null) return;

    setLoadingPost(true);
    try {
      await api.delete(`/clients/${clientIdToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      messageAlert({
        type: "success",
        message: t("clients.deleted_successfully"),
      });
      await mutate();
    } catch (error) {
      messageAlert({ type: "error", message: t("clients.delete_error") });
      console.log(error, "Error");
    } finally {
      setIsModalCrashOpen(false);
      setClientIdToDelete(null);
      setLoadingPost(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setClientIdToDelete(id);
    setIsModalCrashOpen(true);
  };
  if (isLoading) {
    return <Spin />;
  }

  const handleEdit = async () => {
    if (!editingClient) return;
    try {
      await api.put(`/clients/${editingClient.id}`, editingClient, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      messageAlert({
        type: "success",
        message: t("clients.updated_successfully"),
      });
      await mutate();
      setIsModalOpen(false);
    } catch (error) {
      messageAlert({ type: "error", message: t("clients.update_error") });
      console.log(error, "Error");
    }
  };

  const handleTicket = (ticket: Client) => {
    navigate(`/ticket`, { state: { ticket } });
  };

  const handleClearFilter = () => {
    setFilteredTxt("");
    navigate("/clients", { replace: true, state: null });
  };

  if (isLoading) {
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
            {(cargo === 1 || cargo === 2) && (
              <button
                onClick={() => setAddClient(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
              >
                <HiUserAdd className="w-5 h-5" />
                {t("dashboard.add_client")}
              </button>
            )}
          </div>
        </div>

        <div className="w-full rounded-xl overflow-hidden shadow-md">
          <div className="grid grid-cols-7 gap-x-6 items-center px-6 py-4 bg-blue-100 border-b text-blue-900 font-semibold text-sm">
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
            <p className="flex items-center gap-2 justify-center">
              <CiUser className="text-blue-700" /> {t("clients.user")}
            </p>
            <p className="flex items-center gap-2 justify-center">
              <MdOutlinePassword className="text-blue-700" />{" "}
              {t("clients.password")}
            </p>
            <p className="flex items-center justify-center gap-2">
              <FaGear /> {t("clients.actions")}
            </p>
          </div>

          {currentClients.map((client) => (
            <div
              key={client.id}
              className="grid grid-cols-7 gap-x-6 items-center px-6 py-4 bg-white border-b hover:bg-gray-50 text-sm"
            >
              <p>{client.id}</p>
              <Tooltip title={client.name}>
                <p>{client.name}</p>
              </Tooltip>
              <Tooltip title={client.mail}>
                <p className="max-w-96 overflow-hidden text-ellipsis truncate">
                  {client.mail}
                </p>
              </Tooltip>
              <p title={client.phone}>{formatPhone(client.phone)}</p>
              <Tooltip title={client.user ?? null}>
                <p className="text-center truncate text-gray-700">
                  {client.user ?? "-"}
                </p>
              </Tooltip>
              <PasswordCell key={client.id} password={client.password ?? ""} />
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleTicket(client)}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  <IoTicketOutline className="h-5 w-5" />
                </button>

                {(cargo === 1 || cargo === 2) && (
                  <button
                    onClick={() => {
                      setEditingClient(client);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                )}

                {(cargo === 1 || cargo === 2) && (
                  <button
                    onClick={() => openDeleteModal(client.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                )}
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
          title={
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-md">
                <Pencil className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {t("clients.edit_client")}
                </h2>
              </div>
            </div>
          }
          isVisible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <Spin />
            </div>
          ) : editingClient ? (
            <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-3xl shadow-lg space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-sm">
                    <HiUser className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("clients.name")}
                  </label>
                </div>
                <input
                  type="text"
                  value={editingClient.name}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, name: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-blue-300"
                  placeholder={t("clients.name")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-sm">
                    <HiPhone className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("clients.phone")}
                  </label>
                </div>
                <PhoneInput
                  country={"br"}
                  value={editingClient.phone}
                  onChange={(phone) =>
                    setEditingClient({ ...editingClient, phone })
                  }
                  prefix="+"
                  inputProps={{
                    required: true,
                    className:
                      "w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-green-300",
                  }}
                  containerStyle={{ width: "100%" }}
                  inputStyle={{
                    width: "100%",
                    height: "56px",
                    borderRadius: "1rem",
                    border: "1px solid #E5E7EB",
                    fontSize: "16px",
                    paddingLeft: "48px",
                  }}
                  buttonStyle={{
                    borderTopLeftRadius: "1rem",
                    borderBottomLeftRadius: "1rem",
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
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-sm">
                    <HiMail className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("clients.email")}
                  </label>
                </div>
                <input
                  type="email"
                  value={editingClient.mail}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, mail: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                  placeholder={t("clients.email")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-sm">
                    <HiUser className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("clients.user")} (Opcional)
                  </label>
                </div>
                <input
                  type="text"
                  value={editingClient.user}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, user: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                  placeholder={t("clients.user")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white shadow-sm">
                    <MdOutlinePassword className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("clients.password")} (Opcional)
                  </label>
                </div>
                <input
                  type="text"
                  value={editingClient.password}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      password: e.target.value,
                    })
                  }
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                  placeholder={t("clients.password")}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleEdit}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Pencil className="w-5 h-5" />
                  {t("clients.save_changes")}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl font-medium transform hover:scale-[1.02] active:scale-[0.98] border border-gray-200"
                >
                  <HiX className="w-5 h-5" />
                  {t("buttons.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500">
              {t("clients.load_error")}
            </div>
          )}
        </Modal>

        <Modal
          title={
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-md">
                <HiUserAdd className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {t("dashboard.add_client")}
                </h2>
              </div>
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
            <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-3xl shadow-lg space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-sm">
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
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-blue-300"
                  placeholder={t("dashboard.name")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-sm">
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
                      "w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-green-300",
                  }}
                  containerStyle={{ width: "100%" }}
                  inputStyle={{
                    width: "100%",
                    height: "56px",
                    borderRadius: "1rem",
                    border: "1px solid #E5E7EB",
                    fontSize: "16px",
                    paddingLeft: "48px",
                  }}
                  buttonStyle={{
                    borderTopLeftRadius: "1rem",
                    borderBottomLeftRadius: "1rem",
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
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-sm">
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
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                  placeholder={t("dashboard.email")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-sm">
                    <HiUser className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("clients.user")} (Opcional)
                  </label>
                </div>
                <input
                  type="text"
                  value={clientUser}
                  onChange={(e) => setClientUser(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                  placeholder={t("clients.user")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white shadow-sm">
                    <MdOutlinePassword className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("clients.password")} (Opcional)
                  </label>
                </div>
                <input
                  type="email"
                  value={clientPassword}
                  onChange={(e) => setClientPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                  placeholder={t("clients.password")}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleAddClient}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <HiUserAdd className="w-5 h-5" />
                  {t("dashboard.add_client")}
                </button>
                <button
                  onClick={() => setAddClient(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl font-medium transform hover:scale-[1.02] active:scale-[0.98] border border-gray-200"
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
