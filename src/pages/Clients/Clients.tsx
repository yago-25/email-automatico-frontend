import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header/Header";
import "./clients.css";
import {
  Pencil,
  Trash,
  ClipboardList,
  XCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import {
  MdArrowBackIos,
  MdArrowForwardIos,
  MdEmail,
  MdLoop,
  MdWarning,
} from "react-icons/md";
import { User } from "../../models/User";
import { useTranslation } from "react-i18next";
import { MdOutlineFormatListNumbered } from "react-icons/md";
import { CiCalendarDate, CiFilter, CiPhone } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import { FaGear, FaTruckRampBox } from "react-icons/fa6";
import { HiOutlineUser } from "react-icons/hi";
import { IoTicketOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";
import { HiUserAdd } from "react-icons/hi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  FaCheckCircle,
  FaCog,
  FaEraser,
  FaFilter,
  FaPhoneAlt,
  FaTruck,
  FaUser,
} from "react-icons/fa";
import useSwr from "swr";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Tooltip } from "antd";
import { HiOutlineNumberedList } from "react-icons/hi2";
import { motion } from "framer-motion"
import { FiBriefcase, FiCalendar, FiHash, FiLock, FiMail, FiPhone, FiShare2, FiTruck, FiUser, FiUserCheck, FiUserPlus, FiX } from "react-icons/fi";
interface Permit {
  id: number;
  client_id: number;
  state: string;
  expiration_date: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: number;
  name: string;
  phone: string;
  mail: string;
  active: boolean;
  dot_number: string;
  operation_type: string;
  expiration_date: Date | null;
  permits: Permit[];
  user?: string;
  password?: string;
  empresa?: string;
  dono?: string;
  social?: string;
  ein?: string;
  mc?: string;
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
  const [clientDot, setClientDot] = useState("");
  const [clientOperationType, setClientOperationType] = useState("");
  const [clientEmpresa, setClientEmpresa] = useState("");
  const [clientDono, setClientDono] = useState("");
  const [clientSocial, setClientSocial] = useState("");
  const [clientEin, setClientEin] = useState("");
  const [clientMc, setClientMc] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCrashOpen, setIsModalCrashOpen] = useState(false);
  const [showModalFilter, setShowModalFilter] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState<number | null>(null);
  const [filteredTxt, setFilteredTxt] = useState("");
  const [clientExpirationDate, setClientExpirationDate] = useState<string>("");
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterDotNumber, setFilterDotNumber] = useState("");
  const [filterOperationType, setFilterOperationType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingChangeStatus, setLoadingChangeStatus] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showPermits, setShowPermits] = useState<boolean>(false);
  const getPermitStatus = (expiration: string) => {
    const today = new Date();
    const exp = new Date(expiration);
    const diffDays = Math.ceil(
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0)
      return { key: "expired", label: t("permits_page.expired") || "Expired" };
    if (diffDays <= 30)
      return {
        key: "expiring",
        label: t("permits_page.expiring_soon") || "Expiring soon",
      };
    return { key: "active", label: t("permits_page.active") || "Active" };
  };

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const { state } = useLocation();
  const clientFromState = state?.client;
  const [hasFilteredByState, setHasFilteredByState] = useState(!!state?.client);

  useEffect(() => {
    if (clientFromState && !hasFilteredByState) {
      setHasFilteredByState(true);
    }
  }, [clientFromState, hasFilteredByState]);

  const handleViewPermits = (client: Client) => {
    setSelectedClient(client);
    setShowPermits(true);
  };

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
  }, [clientFromState?.id, mutate]);

  const filteredClients = useMemo(() => {
    if (!clients.length) return [];

    let filtered = [...clients];

    if (hasFilteredByState && clientFromState) {
      filtered = filtered.filter(
        (client) => client.id.toString() === clientFromState.id.toString()
      );
      return filtered.sort((a, b) => a.id - b.id);
    }

    if (
      filterName ||
      filterEmail ||
      filterPhone ||
      filterDotNumber ||
      filterOperationType
    ) {
      filtered = filtered.filter((client) => {
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
          ? client.dot_number
            ?.toString()
            .toLowerCase()
            .includes(filterDotNumber.toLowerCase())
          : true;

        const matchesOperationType = filterOperationType
          ? client.operation_type
            ?.toLowerCase()
            .includes(filterOperationType.toLowerCase())
          : true;

        return (
          matchesName &&
          matchesEmail &&
          matchesPhone &&
          matchesDot &&
          matchesOperationType
        );
      });
    }

    if (filteredTxt) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(filteredTxt.toLowerCase()) ||
          client.mail.toLowerCase().includes(filteredTxt.toLowerCase())
      );
    }

    return filtered.sort((a, b) => a.id - b.id);
  }, [
    clients,
    hasFilteredByState,
    clientFromState,
    filterName,
    filterEmail,
    filterPhone,
    filterDotNumber,
    filterOperationType,
    filteredTxt,
  ]);

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
      .map((client) => client.operation_type)
      .filter((type, index, self) => type && self.indexOf(type) === index);
    return types.map((type) => ({ value: type, label: type }));
    return types.map((type) => ({ value: type, label: type }));
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
          expiration_date: clientExpirationDate,
          empresa: clientEmpresa,
          dono: clientDono,
          social: clientSocial,
          ein: clientEin,
          mc: clientMc,
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
      setClientUser("");
      setClientPassword("");
      setClientDot("");
      setClientOperationType("");
      setClientExpirationDate("");
      setClientEmpresa("");
      setClientDono("");
      setClientSocial("");
      setClientEin("");
      setClientMc("");
    } catch (e) {
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

  const handleClearFilters = () => {
    setFilteredTxt("");
    setFilterName("");
    setFilterEmail("");
    setFilterPhone("");
    setFilterDotNumber("");
    setFilterOperationType("");
    setFilterStatus("");
    setHasFilteredByState(false);
    setCurrentPage(1);
    navigate("/clients", { replace: true, state: null });
  };

  const handleFilterToggle = () => {
    setShowModalFilter(true);
  };

  const handleFilterChange = () => {
    setShowModalFilter(false);
    setCurrentPage(1);
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

      await mutate();
      messageAlert({
        type: "success",
        message: t("alerts.client_status_updated"),
      });
    } catch (e) {
      messageAlert({
        type: "error",
        message: t("alerts.client_status_update_error"),
      });
    } finally {
      setLoadingChangeStatus(false);
    }
  };

  const calculateDaysLeft = (expirationDate: string | Date) => {
    const currentDate = new Date();
    const expiration = new Date(expirationDate);
    const timeDiff = expiration.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
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
              onClick={handleFilterToggle}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg shadow-md hover:bg-purple-700 hover:shadow-lg transition-all duration-200"
            >
              <CiFilter className="w-5 h-5" />
              {t("filters.titleup")}
            </button>
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-200"
            >
              <FaEraser className="w-5 h-5" />
              {t("filters.clear")}
            </button>
          </div>
        </div>

        <div className="w-full rounded-xl overflow-hidden shadow-md">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <Spin />
            </div>
          ) : currentClients.length > 0 ? (
            <>
              <div className="grid grid-cols-8 gap-x-6 items-center px-6 py-4 bg-blue-100 border-b text-blue-900 font-semibold text-sm">
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
                <p className="flex items-center gap-2 justify-center">
                  <CiCalendarDate className="text-blue-700" /> Expiration Date
                </p>
                <p className="flex items-center justify-center gap-2">
                  <FaGear /> {t("clients.actions")}
                </p>
              </div>

              {currentClients.map((client, index) => {
                const daysLeft = client.expiration_date
                  ? calculateDaysLeft(client.expiration_date)
                  : 0;

                const getAlertIconStyle = () => {
                  if (daysLeft <= 0) {
                    return { color: "red", animation: "shake 0.5s infinite" };
                  } else if (daysLeft <= 15) {
                    return { color: "red" };
                  } else if (daysLeft <= 30) {
                    return { color: "yellow" };
                  } else {
                    return { color: "transparent" };
                  }
                };

                return (
                  <Tooltip
                    title={client.active === false ? "Inativo" : ""}
                    key={client.id}
                    placement="left"
                  >
                    <div
                      className={`grid grid-cols-8 gap-x-6 items-center justify-items-center px-6 py-4 text-sm transition duration-200 ${client.active === false
                        ? "bg-red-300"
                        : index % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white"
                        } ${client.active === false ? "hover:bg-red-300" : "hover:bg-blue-50"
                        }`}
                    >
                      <p className="text-center text-gray-800 font-medium">{client.id}</p>

                      <Tooltip title={client.name}>
                        <p>{client.name}</p>
                      </Tooltip>

                      <Tooltip title={client.mail}>
                        <p className="max-w-96 overflow-hidden text-ellipsis truncate">
                          {client.mail}
                        </p>
                      </Tooltip>

                      <p title={client.phone}>{formatPhone(client.phone)}</p>
                      <p className="text-center text-gray-700" title={client.dot_number}>
                        {client.dot_number ?? "-"}
                      </p>
                      <p className="text-center text-gray-700" title={client.operation_type}>
                        {client.operation_type ?? "-"}
                      </p>

                      <div className="flex items-center justify-center gap-2">
                        <p
                          className="text-center text-gray-700"
                          title={
                            client.expiration_date
                              ? new Date(client.expiration_date).toLocaleDateString()
                              : "-"
                          }
                        >
                          {client.expiration_date
                            ? new Date(client.expiration_date).toLocaleDateString()
                            : "-"}
                        </p>
                        <Tooltip title={`Faltam ${daysLeft} dias`}>
                          <MdWarning style={getAlertIconStyle()} className="h-6 w-6" />
                        </Tooltip>
                      </div>

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
                            >
                              <MdLoop className="h-5 w-5" />
                            </button>
                          </Tooltip>
                        )}

                        <Tooltip title={t("permits_page.title") || "View Permits"}>
                          <button
                            onClick={() => handleViewPermits(client)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ClipboardList className="h-5 w-5" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </Tooltip>
                );
              })}
            </>
          ) : (<div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <IoTicketOutline className="w-16 h-16 mb-4 text-white" />
            <p className="text-lg font-medium text-white">
              {t("messages.noClientsFound")} </p>
          </div>)}
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
              <Pencil className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                {t("clients.edit_client")}
              </h2>
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
            <div className="bg-white p-6 rounded-3xl shadow-lg space-y-4 max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiUser className="w-5 h-5 text-blue-600" />
                    {t("clients.name")}
                  </label>
                  <input
                    type="text"
                    value={editingClient.name}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, name: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    placeholder={t("clients.name")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiPhone className="w-5 h-5 text-green-600" />
                    {t("clients.phone")}
                  </label>
                  <PhoneInput
                    country={"us"}
                    value={editingClient.phone}
                    onChange={(phone) => setEditingClient({ ...editingClient, phone })}
                    prefix="+"
                    inputProps={{
                      required: true,
                      className:
                        "w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200",
                    }}
                    containerStyle={{ width: "100%" }}
                    inputStyle={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "0.75rem",
                      border: "1px solid #E5E7EB",
                      fontSize: "16px",
                      paddingLeft: "48px",
                    }}
                    buttonStyle={{
                      borderTopLeftRadius: "0.75rem",
                      borderBottomLeftRadius: "0.75rem",
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      borderRight: "none",
                    }}
                    enableSearch={false}
                    disableSearchIcon={true}
                    countryCodeEditable={false}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiMail className="w-5 h-5 text-purple-600" />
                    {t("clients.email")}
                  </label>
                  <input
                    type="email"
                    value={editingClient.mail}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, mail: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
                    placeholder={t("clients.email")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiCalendar className="w-5 h-5 text-purple-600" />
                    {t("labels.expiration_date")}
                  </label>
                  <input
                    type="date"
                    value={
                      editingClient.expiration_date instanceof Date &&
                        !isNaN(editingClient.expiration_date.getTime())
                        ? editingClient.expiration_date.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      setEditingClient({
                        ...editingClient,
                        expiration_date: dateValue ? new Date(dateValue) : new Date(), // ou null, se você mudar a interface
                      });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 hover:border-purple-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiUser className="w-5 h-5 text-red-600" />
                    {t("clients.user")} (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editingClient.user}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, user: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200"
                    placeholder={t("clients.user")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiLock className="w-5 h-5 text-yellow-600" />
                    {t("clients.password")} (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editingClient.password}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, password: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                    placeholder={t("clients.password")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiHash className="w-5 h-5 text-yellow-600" />
                    DOT Number
                  </label>
                  <input
                    type="text"
                    value={editingClient.dot_number || ""}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, dot_number: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                    placeholder="Ex: 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiBriefcase className="w-5 h-5 text-indigo-600" />
                    {t("dashboard.empresa")}
                  </label>
                  <input
                    type="text"
                    value={editingClient.empresa || ""}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, empresa: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                    placeholder={t("dashboard.empresa")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiUserCheck className="w-5 h-5 text-teal-600" />
                    {t("dashboard.dono")}
                  </label>
                  <input
                    type="text"
                    value={editingClient.dono || ""}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, dono: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
                    placeholder={t("dashboard.dono")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiShare2 className="w-5 h-5 text-pink-600" />
                    {t("dashboard.social")}
                  </label>
                  <input
                    type="text"
                    value={editingClient.social || ""}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, social: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-200"
                    placeholder={t("dashboard.social")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiHash className="w-5 h-5 text-yellow-600" />
                    EIN
                  </label>
                  <input
                    type="text"
                    value={editingClient.ein || ""}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, ein: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                    placeholder="E.g., 12-3456789"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiTruck className="w-5 h-5 text-orange-600" />
                    MC
                  </label>
                  <input
                    type="text"
                    value={editingClient.mc || ""}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, mc: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200"
                    placeholder="E.g., MC123456"
                  />
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
                  <FiX className="w-5 h-5" />
                  {t("buttons.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500">{t("clients.load_error")}</div>
          )}
        </Modal>

        <Modal
          title={
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.div
                className="relative bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 p-3.5 rounded-2xl shadow-lg overflow-hidden"
                whileHover={{ scale: 1.08, rotate: 3 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent blur-md animate-pulse" />
                <HiUserAdd className="w-7 h-7 text-white relative z-10 drop-shadow-md" />
              </motion.div>

              <div className="flex flex-col">
                <motion.h2
                  className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  {t("clients.add_client")}
                </motion.h2>
                <motion.p
                  className="text-sm text-gray-500 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {t("clients.clients")}
                </motion.p>
              </div>
            </motion.div>
          }
          isVisible={addClient}
          onClose={() => setAddClient(false)}
          width={1900}
        >
          {loadingPost ? (
            <div className="flex flex-col items-center justify-center w-full gap-4 py-10">
              <Spin />
              <p className="text-gray-500 text-sm">{t("ticketsStats.inProgress")}</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-3xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      {t("dashboard.name")}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-blue-300 focus:bg-white"
                    placeholder={t("dashboard.name")}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiPhone className="w-4 h-4 text-green-600" />
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
                        "w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-green-300 focus:bg-white",
                    }}
                    containerStyle={{ width: "100%" }}
                    inputStyle={{
                      width: "100%",
                      height: "54px",
                      borderRadius: "0.75rem",
                      border: "1px solid #E5E7EB",
                      fontSize: "16px",
                      paddingLeft: "48px",
                    }}
                    buttonStyle={{
                      borderTopLeftRadius: "0.75rem",
                      borderBottomLeftRadius: "0.75rem",
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      borderRight: "none",
                    }}
                    enableSearch={false}
                    disableSearchIcon={true}
                    countryCodeEditable={false}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiMail className="w-4 h-4 text-purple-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      {t("dashboard.email")}
                    </label>
                  </div>
                  <input
                    type="email"
                    value={clientMail}
                    onChange={(e) => setClientMail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-purple-300 focus:bg-white"
                    placeholder={t("dashboard.email")}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="w-4 h-4 text-purple-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      {t("labels.expiration_date")}
                    </label>
                  </div>
                  <input
                    type="date"
                    value={clientExpirationDate}
                    onChange={(e) => setClientExpirationDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-purple-300 focus:bg-white"
                    placeholder="Selecione a data"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser className="w-4 h-4 text-red-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      {t("clients.user")}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={clientUser}
                    onChange={(e) => setClientUser(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-purple-300 focus:bg-white"
                    placeholder={t("clients.user")}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiLock className="w-4 h-4 text-red-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      {t("clients.password")}
                    </label>
                  </div>
                  <input
                    type="password"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-purple-300 focus:bg-white"
                    placeholder={t("clients.password")}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiHash className="w-4 h-4 text-yellow-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      DOT Number
                    </label>
                  </div>
                  <input
                    type="text"
                    value={clientDot}
                    onChange={(e) => setClientDot(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-purple-300 focus:bg-white"
                    placeholder="Ex: 1234567"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiBriefcase className="w-4 h-4 text-indigo-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      {t("dashboard.empresa")}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={clientEmpresa}
                    onChange={(e) => setClientEmpresa(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-indigo-300 focus:bg-white"
                    placeholder={t("dashboard.empresa")}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiUserCheck className="w-4 h-4 text-teal-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      {t("dashboard.dono")}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={clientDono}
                    onChange={(e) => setClientDono(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-teal-300 focus:bg-white"
                    placeholder={t("dashboard.dono")}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiShare2 className="w-4 h-4 text-pink-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      {t("dashboard.social")}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={clientSocial}
                    onChange={(e) => setClientSocial(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-pink-300 focus:bg-white"
                    placeholder={t("dashboard.social")}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiHash className="w-4 h-4 text-yellow-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      EIN
                    </label>
                  </div>
                  <input
                    type="text"
                    value={clientEin}
                    onChange={(e) => setClientEin(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-yellow-300 focus:bg-white"
                    placeholder="E.g., 12-3456789"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiTruck className="w-4 h-4 text-orange-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      MC
                    </label>
                  </div>
                  <input
                    type="text"
                    value={clientMc}
                    onChange={(e) => setClientMc(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-orange-300 focus:bg-white"
                    placeholder="E.g., MC123456"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleAddClient}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <FiUserPlus className="w-5 h-5" />
                  {t("dashboard.add_client")}
                </button>
                <button
                  onClick={() => setAddClient(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl font-medium transform hover:scale-[1.02] active:scale-[0.98] border border-gray-200"
                >
                  <FiX className="w-5 h-5" />
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

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                  <FaCheckCircle className="w-5 h-5" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("filters.status")}
                </label>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/70 backdrop-blur-sm"
              >
                <option value="">{t("filters.all")}</option>
                <option value="true">{t("filters.active")}</option>
                <option value="false">{t("filters.inactive")}</option>
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

        <Modal
          title={
            selectedClient && (
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-md">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {t("permits_page.title")} - {selectedClient?.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedClient.permits?.length || 0}{" "}
                    {t("permits_page.total_permits") || "permits"}
                  </p>
                </div>
              </div>
            )
          }
          isVisible={showPermits && !!selectedClient}
          onClose={() => setShowPermits(false)}
        >
          {selectedClient && (
            <div className="space-y-6">
              {!selectedClient.permits ||
                selectedClient.permits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">
                    {t("permits_page.no_permits")}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {t("permits_page.no_permits_description") ||
                      "This client doesn't have any permits yet."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {
                          selectedClient.permits.filter(
                            (p) =>
                              getPermitStatus(p.expiration_date).key ===
                              "active"
                          ).length
                        }
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        {t("permits_page.active")}
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {
                          selectedClient.permits.filter(
                            (p) =>
                              getPermitStatus(p.expiration_date).key ===
                              "expiring"
                          ).length
                        }
                      </div>
                      <div className="text-xs text-yellow-600 font-medium">
                        {t("permits_page.expiring_soon")}
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {
                          selectedClient.permits.filter(
                            (p) =>
                              getPermitStatus(p.expiration_date).key ===
                              "expired"
                          ).length
                        }
                      </div>
                      <div className="text-xs text-red-600 font-medium">
                        {t("permits_page.expired")}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {selectedClient.permits.map((permit) => {
                      const status = getPermitStatus(permit.expiration_date);
                      return (
                        <div
                          key={permit.id}
                          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 rounded-lg p-2">
                                <ClipboardList className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-800">
                                  Permit #{permit.id}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {t("permits_page.created_at")}:{" "}
                                  {new Date(
                                    permit.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-center rounded-full text-xs font-semibold ${status.key === "active"
                                ? "bg-green-100 text-green-700"
                                : status.key === "expiring"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                                }`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 font-medium">
                                  {t("permits_page.state_label")}
                                </div>
                                <div className="text-sm font-semibold text-gray-800">
                                  {permit.state}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 font-medium">
                                  {t("permits_page.expiration")}
                                </div>
                                <div className="text-sm font-semibold text-gray-800">
                                  {new Date(
                                    permit.expiration_date
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowPermits(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md border border-gray-200 font-medium"
                >
                  <XCircle className="w-5 h-5" />
                  {t("login_page.back_button") || "Close"}
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
