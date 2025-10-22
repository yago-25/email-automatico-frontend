/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header/Header";
import "./clients.css";
import { Pencil, Trash } from "lucide-react";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import {
  MdArrowBackIos,
  MdArrowForwardIos,
  MdLoop,
  MdEmail,
  MdOutlinePassword,
} from "react-icons/md";
import { User } from "../../models/User";
import { useTranslation } from "react-i18next";
import { MdOutlineFormatListNumbered } from "react-icons/md";
import { CiFilter, CiPhone } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import { FaGear, FaTruckRampBox } from "react-icons/fa6";
import { HiOutlineUser } from "react-icons/hi";
import { IoTicketOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";
import { HiMail, HiPhone, HiUser } from "react-icons/hi";
import { HiUserAdd, HiX } from "react-icons/hi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaCog, FaEraser, FaFilter, FaPhoneAlt, FaTruck, FaUser } from "react-icons/fa";
import useSwr from "swr";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Tooltip } from "antd";
import { RiSortNumberAsc } from "react-icons/ri";
import { HiOutlineNumberedList } from "react-icons/hi2";

interface Client {
  id: number;
  name: string;
  phone: string;
  mail: string;
  active: boolean;
  dot_number: string;
  operation_type: string;
  user?: string;
  password?: string;
}

interface DeleteConfirmModal {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

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
  const [clientDot, setClientDot] = useState("");
  const [clientOperationType, setClientOperationType] = useState("");

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

  const availableClientNames = useMemo(() => {
    return clients.map((client) => ({
      value: client.name,
      label: client.name,
    }));
  }, [clients]);

  const availableClientEmails = useMemo(() => {
    return clients.map((client) => ({
      value: client.mail,
      label: client.mail,
    }));
  }, [clients]);

  const availableClientPhones = useMemo(() => {
    return clients.map((client) => ({
      value: client.phone,
      label: client.phone,
    }));
  }, [clients]);

  const availableClientDotNumbers = useMemo(() => {
    return clients.map((client) => ({
      value: client.dot_number,
      label: client.dot_number,
    }));
  }, [clients]);

  const availableOperationTypes = useMemo(() => {
    const types = clients
      .map(client => client.operation_type)
      .filter((type, index, self) => type && self.indexOf(type) === index);
    return types.map(type => ({ value: type, label: type }));
  }, [clients]);

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
          dot_number: clientDot,
          operation_type: clientOperationType,
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

  const handleClearFilters = () => {
    setFilterName("");
    setFilterEmail("");
    setFilterPhone("");
    setFilterDotNumber("");
    setFilterOperationType("");
  }

  const handleFilterToggle = () => {
    setShowModalFilter(true);
  };

  const handleFilterChange = () => {
    mutate();

    const filtered = clients.filter((client) => {
      const matchesName = filterName
        ? client.name?.toLowerCase().includes(filterName.toLowerCase())
        : true;

      const matchesEmail = filterEmail
        ? client.mail?.toLowerCase().includes(filterEmail.toLowerCase())
        : true;

      const matchesPhone = filterPhone
        ? client.phone?.toLowerCase().includes(filterPhone.toLowerCase())
        : true;

      const matchesDot = filterDotNumber
        ? client.dot_number?.toString().toLowerCase().includes(filterDotNumber.toLowerCase())
        : true;

      const matchesOperationType = filterOperationType
        ? client.operation_type?.toLowerCase().includes(filterOperationType.toLowerCase())
        : true;

      return (
        matchesName &&
        matchesEmail &&
        matchesPhone &&
        matchesDot &&
        matchesOperationType
      );
    });

    setFilteredClients(filtered);
  };

  const handleClearFilters = () => {
    setFilterName("");
    setFilterEmail("");
    setFilterPhone("");
    setFilterDotNumber("");
    setFilterOperationType("");
  }

  const handleFilterToggle = () => {
    setShowModalFilter(true);
  };

  const handleFilterChange = () => {
    mutate();

    const filtered = clients.filter((client) => {
      const matchesName = filterName
        ? client.name?.toLowerCase().includes(filterName.toLowerCase())
        : true;

      const matchesEmail = filterEmail
        ? client.mail?.toLowerCase().includes(filterEmail.toLowerCase())
        : true;

      const matchesPhone = filterPhone
        ? client.phone?.toLowerCase().includes(filterPhone.toLowerCase())
        : true;

      const matchesDot = filterDotNumber
        ? client.dot_number?.toString().toLowerCase().includes(filterDotNumber.toLowerCase())
        : true;

      const matchesOperationType = filterOperationType
        ? client.operation_type?.toLowerCase().includes(filterOperationType.toLowerCase())
        : true;

      return (
        matchesName &&
        matchesEmail &&
        matchesPhone &&
        matchesDot &&
        matchesOperationType
      );
    });

    setFilteredClients(filtered);
  };

  const handleStatus = async (client: Client) => {
    setLoadingChangeStatus(true);
    try {
      await api.patch(
        "/update-client-status",
        {
          clientId: client.id,
          active: !client.active,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      mutate();
      messageAlert({
        type: "success",
        message: "Status do Cliente atualizado com sucesso!.",
      });
    } catch (e) {
      console.log("Erro ao alterar status do cliente: ", e);
      messageAlert({
        type: "error",
        message: "Erro ao alterar status do cliente.",
      });
    } finally {
      setLoadingChangeStatus(false);
    }
  };

  if (isLoading || loadingChangeStatus) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spin />
      </div>
    );
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
            {(cargo === 1 || cargo === 2) && (
              <button
                onClick={() => setAddClient(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
              >
                <HiUserAdd className="w-5 h-5" />
                {t("dashboard.add_client")}
              </button>
            )}
            <button
              onClick={handleClearFilter}
              className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-200"
            >
              <FaEraser className="w-5 h-5" />
              {t("filters.clear")}
            </button>
            <button
              onClick={handleFilterToggle}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg shadow-md hover:bg-purple-700 hover:shadow-lg transition-all duration-200"
            >
              <CiFilter className="w-5 h-5" />
            </button>
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
              <HiOutlineNumberedList className="text-blue-700" /> DOT Number
            </p>
            <p className="flex items-center gap-2 justify-center">
              <FaTruckRampBox className="text-blue-700" /> Operation Type
            </p>
            <p className="flex items-center justify-center gap-2">
              <FaGear /> {t("clients.actions")}
            </p>
          </div>

          {currentClients.map((client, index) => (
            <Tooltip
              title={client.active === false ? "Inativo" : ""}
              key={client.id}
              placement="left"
            >
              <div
                className={`grid grid-cols-7 gap-x-6 items-center justify-items-center px-6 py-4 text-sm transition duration-200 ${client.active === false
                    ? "bg-red-300"
                    : index % 2 === 0
                      ? "bg-gray-50"
                      : "bg-white"
                  } ${client.active === false
                    ? "hover:bg-red-300"
                    : "hover:bg-blue-50"
                  }`}
              >
                <p className="text-center text-gray-800 font-medium">
                  {client.id}
                </p>
                <Tooltip title={client.name}>
                  <p>{client.name}</p>
                </Tooltip>
                <Tooltip title={client.mail}>
                  <p className="max-w-96 overflow-hidden text-ellipsis truncate">
                    {client.mail}
                  </p>
                </Tooltip>
                <p title={client.phone}>{formatPhone(client.phone)}</p>
                <p
                  className="text-center text-gray-700"
                  title={client.dot_number}
                >
                  {client.dot_number ?? "-"}
                </p>
                <p
                  className="text-center text-gray-700"
                  title={client.operation_type}
                >
                  {client.operation_type ?? "-"}
                </p>
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
                  {(cargo === 1 || cargo === 2) && (
                    <Tooltip title="Alterar Status">
                      <button
                        onClick={() => handleStatus(client)}
                        className="text-green-600 hover:text-green-800 transition-colors duration-200"
                        title={t("tooltips.viewTickets")}
                      >
                        <MdLoop className="h-5 w-5" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </Tooltip>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      setEditingClient({
                        ...editingClient,
                        name: e.target.value,
                      })
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
                    country={"us"}
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

                <div className="space-y-2 md:col-span-2">
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
                      setEditingClient({
                        ...editingClient,
                        mail: e.target.value,
                      })
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
                      setEditingClient({
                        ...editingClient,
                        user: e.target.value,
                      })
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

                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white shadow-sm">
                      <RiSortNumberAsc className="w-5 h-5" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">
                      DOT Number
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editingClient.dot_number || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        dot_number: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-yellow-300"
                    placeholder="Ex: 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white shadow-sm">
                      <FaTruck className="w-5 h-5" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">
                      Operation Type
                    </label>
                  </div>
                  <select
                    value={editingClient.operation_type || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        operation_type: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">{t("filters.all")}</option>
                    <option value="interstate">Interstate</option>
                    <option value="intrastate">Intrastate</option>
                  </select>
                </div>
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
            <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-3xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-sm">
                      <HiPhone className="w-5 h-5" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">
                      {t("dashboard.phone")}
                    </label>
                  </div>
                  <PhoneInput
                    country={"us"}
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

                <div className=" md:col-span-2">
                  <div className="flex items-center gap-3 mb-2 w-full">
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

                <div>
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

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white shadow-sm">
                      <MdOutlinePassword className="w-5 h-5" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">
                      {t("clients.password")} (Opcional)
                    </label>
                  </div>
                  <input
                    type="password"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                    placeholder={t("clients.password")}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white shadow-sm">
                      <RiSortNumberAsc className="w-5 h-5" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">
                      DOT Number
                    </label>
                  </div>
                  <input
                    type="text"
                    value={clientDot}
                    onChange={(e) => setClientDot(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                    placeholder="Ex: 1234567"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white shadow-sm">
                      <FaTruck className="w-5 h-5" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">
                      Operation Type
                    </label>
                  </div>
                  <select
                    value={clientOperationType}
                    onChange={(e) => setClientOperationType(e.target.value)}
                    className="w-full h-[55px] border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">{t("filters.all")}</option>
                    <option value="interstate">Interstate</option>
                    <option value="intrastate">Intrastate</option>
                  </select>
                </div>
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
        <Modal
          title={
            <div className="flex items-center gap-3 text-blue-600">
              <FaFilter className="w-6 h-6" />
              <span className="text-2xl font-bold">{t("filters.title")}</span>
            </div>
          }
          isVisible={showModalFilter}
          onClose={() => {
            setShowModalFilter(false);
            mutate(undefined, true);
          }}
        >
          <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-2xl shadow-lg mt-2 max-w-md mx-auto">

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                  <FaUser className="w-5 h-5" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("filters.name")}
                </label>
              </div>
              <select
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 backdrop-blur-sm"
              >
                <option value="">{t("filters.all")}</option>
                {availableClientNames.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>


            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                  <MdEmail className="w-5 h-5" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("filters.email")}
                </label>
              </div>
              <select
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/70 backdrop-blur-sm"
              >
                <option value="">{t("filters.all")}</option>
                {availableClientEmails.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-100 rounded-xl text-green-600">
                  <FaPhoneAlt className="w-5 h-5" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("filters.phone")}
                </label>
              </div>
              <select
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/70 backdrop-blur-sm"
              >
                <option value="">{t("filters.all")}</option>
                {availableClientPhones.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>


            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600">
                  <FaTruck className="w-5 h-5" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("filters.dot")}
                </label>
              </div>
              <select
                value={filterDotNumber}
                onChange={(e) => setFilterDotNumber(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/70 backdrop-blur-sm"
              >
                <option value="">{t("filters.all")}</option>
                {availableClientDotNumbers.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>


            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                  <FaCog className="w-5 h-5" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("filters.operationType")}
                </label>
              </div>
              <select
                value={filterOperationType}
                onChange={(e) => setFilterOperationType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm"
              >
                <option value="">{t("filters.all")}</option>
                {availableOperationTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  handleFilterChange();
                  setShowModalFilter(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                <FaFilter className="w-4 h-4" />
                {t("filters.apply")}
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                <FaEraser className="w-4 h-4" />
                {t("filters.clear")}
              </button>
            </div>
          </div>
        </Modal>


      </div>
    </div>
  );
};

export default Clients;
