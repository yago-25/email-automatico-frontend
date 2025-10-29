import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import "./dashboard.css";
import {
  MdArrowBackIos,
  MdArrowForwardIos,
  MdLoop,
  MdOutlinePassword,
  MdWarning,
} from "react-icons/md";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { useSwr } from "../../api/useSwr";
import { MdOutlineFormatListNumbered } from "react-icons/md";
import { CiCalendarDate, CiPhone } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import { FaGear, FaTruckRampBox } from "react-icons/fa6";
import { HiOutlineUser } from "react-icons/hi";
import { IoTicketOutline } from "react-icons/io5";
import { IoPersonSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  FaTags,
  FaClipboardList,
  FaRegStickyNote,
  FaTruck,
} from "react-icons/fa";
import { HiOutlineNumberedList } from "react-icons/hi2";
import { HiUserAdd, HiX } from "react-icons/hi";
import { HiMail, HiPhone, HiUser } from "react-icons/hi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FiBriefcase } from "react-icons/fi";
import { RiFileExcel2Line, RiSortNumberAsc } from "react-icons/ri";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Tooltip } from "antd";

interface Option {
  label: string;
  value: string;
}

interface Clients {
  id: number;
  name: string;
  phone: string;
  mail: string;
  active: boolean;
  dot_number: string;
  operation_type: string;
  expiration_date: Date;
  value?: string;
  user?: string;
  password?: string;
}

interface Admins {
  id: number;
  nome_completo: string;
  email: string;
  telefone: string;
  nome_usuario: string;
  cargo_id: number;
  email_verificado_at: string | null;
  created_at: string;
  updated_at: string;
}
interface Ticket {
  id: number;
  name: string;
  type: string;
  status: string;
  tags: string[] | string;
  client: {
    id: number;
    name: string;
  };
  user: User;
  create: User;
  message: string;
  created_at: string;
  observation?: string;
}

interface ButtonProps {
  text: string;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
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
      >
        <path d="..." fill="white" />
      </svg>
      <span className="group-active:hidden">{text}</span>
    </button>
  );
};

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const cargo = user.cargo_id;

  const { t } = useTranslation();

  const {
    data: rawClients = [],
    loading: loadingClients,
    mutate: mutateClients,
  } = useSwr<Clients[]>("/clients");

  const {
    data: rawAdmins = [],
    loading: loadingAdmins,
    mutate: mutateAdmins,
  } = useSwr<Admins[]>("/admins");

  const { data: rawTickets = [] } = useSwr<Ticket[]>("/tickets");

  const optionsClient: Option[] = rawClients.map((client: Clients) => ({
    value: String(client.id),
    label: client.name,
  }));

  const optionsAdmin: Option[] = rawAdmins.map((admin: Admins) => ({
    value: String(admin.id),
    label: admin.nome_completo,
  }));

  const statusTickets = [
    { name: "Não iniciada", title: t("tickets.types.not_started") },
    { name: "Esperando", title: t("tickets.types.waiting") },
    { name: "Em progresso", title: t("tickets.types.in_progress") },
    { name: "Completo", title: t("tickets.types.completed") },
    { name: "Descartada", title: t("tickets.types.discarded") },
  ];

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const navigate = useNavigate();
  const [filteredTxt, setFilteredTxt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addClient, setAddClient] = useState(false);
  const [addTicket, setAddTicket] = useState(false);
  const [importClients, setImportClients] = useState(false);
  const [clientName, setClientName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientMail, setClientMail] = useState("");
  const [clientUser, setClientUser] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [statusTicket, setStatusTicket] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [observation, setObservation] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [loadingChangeStatus, setLoadingChangeStatus] = useState(false);
  const [clientDot, setClientDot] = useState("");
  const [clientOperationType, setClientOperationType] = useState("");
  const [clientExpirationDate, setClientExpirationDate] = useState<string>("");
  const itemsPerPage = 5;

  const filteredClients = rawClients.filter(
    (client: Clients) =>
      client.name.toLowerCase().includes(filteredTxt.toLowerCase()) ||
      client.mail.toLowerCase().includes(filteredTxt.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => a.id - b.id);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = sortedClients.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const calculateDaysLeft = (expirationDate: string | Date) => {
    const currentDate = new Date();
    const expiration = new Date(expirationDate);
    const timeDiff = expiration.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
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

  const handleSelectChange = (value: string | number) => {
    setSelected(value.toString());
  };

  const handleSelectChangeAdmin = (value: string | number) => {
    setSelectedAdmin(value.toString());
  };

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
          message: t("dashboard.fill_all_fields"),
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
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      messageAlert({
        type: "success",
        message: t("dashboard.created_successfully"),
      });
      mutateClients();
      mutateAdmins();
      setAddClient(false);
      setClientName("");
      setClientPhone("");
      setClientMail("");
      setClientUser("");
      setClientPassword("");
      setClientDot("");
      setClientOperationType("");
      setClientExpirationDate("");
    } catch (e) {
      console.log("Erro ao criar usuário: ", e);
      messageAlert({ type: "error", message: t("dashboard.create_error") });
    } finally {
      setLoadingPost(false);
    }
  };

  const handleAddTicket = async () => {
    setLoadingPost(true);
    try {
      if (
        !statusTicket ||
        !clientName ||
        !typeName ||
        !selected ||
        !selectedAdmin
      ) {
        messageAlert({
          type: "error",
          message: t("alerts.fillAllFields"),
        });
        return;
      }

      await api.post(
        "/tickets",
        {
          name: clientName,
          type: typeName,
          tags: tags,
          client_id: selected,
          user_id: selectedAdmin,
          create_id: authUser?.id,
          status: statusTicket,
          observation: observation,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      messageAlert({
        type: "success",
        message: t("alerts.ticketCreated"),
      });

      setStatusTicket("");
      setClientName("");
      setTypeName("");
      setSelected("");
      setSelectedAdmin("");
      setTags([]);
      setObservation("");
      setAddTicket(false);
    } catch (e) {
      console.log("Erro ao adicionar ticket: ", e);
      messageAlert({
        type: "error",
        message: t("alerts.ticketCreateError"),
      });
    } finally {
      setLoadingPost(false);
    }
  };

  const handleStatus = async (client: Clients) => {
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

      mutateClients();
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

  const handleTicket = (ticket: Clients) => {
    navigate("/ticket", { state: { ticket } });
  };

  const handleClient = (client: Clients) => {
    navigate(`/clients`, { state: { client } });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
    }
  };

  const handleClearFile = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setProfileFile(null);
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleUploadArchive = async () => {
    if (!profileFile || !authUser) {
      messageAlert({
        type: "error",
        message: t("alerts.selectFile"),
      });
      return;
    }

    if (!(profileFile instanceof File)) {
      messageAlert({
        type: "error",
        message: t("alerts.invalidFile"),
      });
      return;
    }

    setLoadingImport(true);
    try {
      const formData = new FormData();
      formData.append("file", profileFile);

      await api.post("/import-clients", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      mutateClients();
      messageAlert({
        type: "success",
        message: t("alerts.clientsImported"),
      });

      setImportClients(false);
      handleClearFile();
    } catch (e) {
      console.log("Erro ao importar clientes: ", e);
      messageAlert({
        type: "error",
        message: t("alerts.clientsImportError"),
      });
    } finally {
      setLoadingImport(false);
    }
  };

  const availableTickets = rawTickets;

  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();

    availableTickets.forEach((ticket) => {
      if (Array.isArray(ticket.tags)) {
        ticket.tags.forEach((tag) => tagsSet.add(tag));
      } else if (ticket.tags) {
        tagsSet.add(ticket.tags);
      }
    });

    return Array.from(tagsSet);
  }, [availableTickets]);

  const filteredAvailableTags = useMemo(() => {
    const input = tagInputValue.toLowerCase();
    return availableTags.filter(
      (tag) =>
        (input === "" || tag.toLowerCase().includes(input)) &&
        !tags.includes(tag)
    );
  }, [availableTags, tagInputValue, tags]);

  if (loadingClients || loadingAdmins || loadingChangeStatus) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spin />
      </div>
    );
  }

  return (
    <div className="container-dash">
      <Header name={authUser?.nome_completo} />
      <div className="title-dash">
        <FiBriefcase className="icon" />
        <p>Martins Adviser</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 mt-6 w-full max-w-4xl mx-auto px-4">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder={t("dashboard.search_placeholder")}
            className="w-full pl-12 pr-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 shadow-sm text-base text-gray-800 placeholder-gray-400"
            onChange={(e) => {
              setFilteredTxt(e.target.value);
              setCurrentPage(1);
            }}
            value={filteredTxt}
          />
        </div>

        {(cargo === 1 || cargo === 2) && (
          <div className="flex gap-4 w-full">
            <button
              onClick={() => setAddClient(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl w-full shadow-md hover:bg-blue-700 transition"
            >
              <HiUserAdd className="w-5 h-5" />
              {t("dashboard.add_client")}
            </button>
            <button
              onClick={() => setAddTicket(true)}
              className="flex items-center justify-center gap-2 bg-white text-blue-500 px-5 py-3 rounded-xl w-full shadow-md hover:hover:bg-gray-200 transition"
            >
              <IoTicketOutline className="w-5 h-5" />
              {t("dashboard.add_ticket")}
            </button>
            <button
              onClick={() => setImportClients(true)}
              className="flex items-center justify-center gap-2 bg-green-700 text-white px-5 py-3 rounded-xl w-full shadow-md hover:hover:bg-green-800 transition"
            >
              <RiFileExcel2Line className="w-5 h-5" />
              {t("dashboard.import_clients")}
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-[90rem] mx-auto mt-10 rounded-3xl overflow-hidden shadow-lg bg-white">
        <div className="grid grid-cols-8 gap-x-6 items-center justify-items-center px-6 py-4 bg-gradient-to-r from-blue-100 to-blue-200 font-semibold text-blue-900 text-sm uppercase tracking-wide">
          <p className="flex items-center gap-2 justify-center">
            <MdOutlineFormatListNumbered className="text-blue-700" /> ID
          </p>
          <p className="flex items-center gap-2 justify-center">
            <HiOutlineUser className="text-blue-700" /> {t("clients.name")}
          </p>
          <p className="flex items-center gap-2 justify-center">
            <CiMail className="text-blue-700" /> {t("clients.email")}
          </p>
          <p className="flex items-center gap-2 justify-center">
            <CiPhone className="text-blue-700" /> {t("clients.phone")}
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
          <p className="flex items-center gap-2 justify-center">
            <FaGear className="text-blue-700" /> {t("clients.actions")}
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
                className={`grid grid-cols-8 gap-x-6 items-center justify-items-center px-6 py-4 text-sm transition duration-200 ${
                  client.active === false
                    ? "bg-red-300"
                    : index % 2 === 0
                    ? "bg-gray-50"
                    : "bg-white"
                } ${
                  client.active === false
                    ? "hover:bg-red-300"
                    : "hover:bg-blue-50"
                }`}
              >
                <p className="text-center text-gray-800 font-medium">
                  {client.id}
                </p>
                <Tooltip title={client.name}>
                  <p className="text-center max-w-[100px] truncate text-gray-700">
                    {client.name}
                  </p>
                </Tooltip>
                <Tooltip title={client.mail}>
                  <p
                    className="text-center truncate text-gray-700"
                    title={client.mail}
                  >
                    {client.mail}
                  </p>
                </Tooltip>
                <p className="text-center text-gray-700" title={client.phone}>
                  {formatPhone(client.phone)}
                </p>
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
                    <MdWarning
                      style={getAlertIconStyle()}
                      className={`h-6 w-6 ${
                        daysLeft <= 0 ? "text-red-600" : ""
                      }`}
                    />
                  </Tooltip>
                </div>
                <div className="flex justify-center items-center gap-3">
                  <Tooltip title="Visualizar Cliente">
                    <button
                      onClick={() => handleClient(client)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      title={t("tooltips.viewClients")}
                    >
                      <IoPersonSharp className="h-5 w-5" />
                    </button>
                  </Tooltip>
                  <Tooltip title="Visualizar Tickets">
                    <button
                      onClick={() => handleTicket(client)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      title={t("tooltips.viewTickets")}
                    >
                      <IoTicketOutline className="h-5 w-5" />
                    </button>
                  </Tooltip>
                  <Tooltip title="Alterar Status">
                    <button
                      onClick={() => handleStatus(client)}
                      className="text-green-600 hover:text-green-800 transition-colors duration-200"
                      title={t("tooltips.viewTickets")}
                    >
                      <MdLoop className="h-5 w-5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>

      <div className="pagination flex justify-center items-center gap-4 mt-6 text-white">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <MdArrowBackIos />
        </button>
        <span className="font-semibold">
          {currentPage} {t("dashboard.of")} {totalPages}
        </span>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <MdArrowForwardIos />
        </button>
      </div>

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
        {loadingPost || loadingImport ? (
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
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-sm">
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

              <div className=" md:col-span-2">
                <div className="flex items-center gap-3 mb-2 w-full">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-sm">
                    <CiCalendarDate className="w-5 h-5" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">
                    Data de Expiração
                  </label>
                </div>
                <input
                  type="date"
                  value={clientExpirationDate}
                  onChange={(e) => setClientExpirationDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:border-purple-300"
                  placeholder="Selecione a data"
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
                  <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-sm">
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
        title={`📝 ${t("modal.add_ticket")}`}
        isVisible={addTicket}
        onClose={() => setAddTicket(false)}
      >
        {loadingPost || loadingImport ? (
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <Spin />
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-sm text-gray-800 max-h-[80vh] overflow-y-auto pr-1">
            <div className="bg-white p-4 rounded-xl shadow-md ">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                <FaClipboardList /> {t("modal.ticket_details")}
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    {t("modal.name")}
                  </label>
                  <Input
                    text={t("modal.name")}
                    type="text"
                    required
                    onChange={(e) => setClientName(e.target.value)}
                    value={clientName}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <strong>{t("modal.status")}</strong>
                  </label>
                  <div className="wrapper">
                    {statusTickets.map((status) => (
                      <div className="option" key={status.name}>
                        <input
                          value={status.name}
                          name="btn"
                          type="radio"
                          className="input"
                          onClick={(e) =>
                            setStatusTicket(
                              (e.target as HTMLInputElement).value
                            )
                          }
                        />
                        <div className="btn">
                          <span className="span">{status.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                <FaTags /> {t("modal.client_operator")}
              </h3>
              <div className="flex gap-5 mt-2">
                <div className="flex flex-col w-full sm:w-1/2 mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("modal.client")}
                  </label>
                  <Select
                    options={optionsClient}
                    value={selected}
                    onChange={handleSelectChange}
                    placeholder={t("modal.select_client")}
                  />
                </div>
                <div className="flex flex-col w-full sm:w-1/2 mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("modal.operator")}
                  </label>
                  <Select
                    options={optionsAdmin}
                    value={selectedAdmin}
                    onChange={handleSelectChangeAdmin}
                    placeholder={t("modal.select_operator")}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-600">
                <FaRegStickyNote /> {t("modal.tags_notes")}
              </h3>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("modal.tags")}
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={tagInputValue}
                    onChange={(e) => setTagInputValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setIsFocused(false), 150);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInputValue.trim() !== "") {
                        e.preventDefault();
                        if (!tags.includes(tagInputValue.trim())) {
                          setTags([...tags, tagInputValue.trim()]);
                        }
                        setTagInputValue("");
                      }
                    }}
                    placeholder={t("modal.add_tags")}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />

                  {isFocused && filteredAvailableTags.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-200 mt-1 rounded-xl w-full max-h-40 overflow-y-auto shadow-md">
                      {filteredAvailableTags.map((tag, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            setTags([...tags, tag]);
                            setTagInputValue("");
                          }}
                          className="px-4 py-2 cursor-pointer hover:bg-yellow-100"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Tags selecionadas */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="text-yellow-700 hover:text-yellow-900"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("modal.notes")}
                </label>
                <Input
                  text={t("modal.notes")}
                  type="text"
                  onChange={(e) => setObservation(e.target.value)}
                  value={observation}
                />
              </div>
            </div>

            <div className="flex flex-col items-end justify-end w-full gap-4 mt-4">
              <Button
                text={t("modal.create_ticket")}
                onClick={handleAddTicket}
              />
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title={`${t("dashboard.import_clients")}`}
        isVisible={importClients}
        onClose={() => {
          setImportClients(false);
          handleClearFile();
        }}
      >
        {loadingImport || loadingPost ? (
          <Spin />
        ) : (
          <div className="flex flex-col gap-5 items-center justify-center">
            <div className="container-input-doc">
              <div className="header-input-doc">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15"
                      stroke="#000000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
                <p>{t("modal.select_file")}</p>
              </div>
              <label htmlFor="file" className="footer">
                <svg
                  fill="#000000"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M15.331 6H8.5v20h15V14.154h-8.169z"></path>
                    <path d="M18.153 6h-.009v5.342H23.5v-.002z"></path>
                  </g>
                </svg>
                <p>
                  {profileFile ? profileFile.name : t("modal.no_file_selected")}
                </p>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={(e) => handleClearFile(e)}
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M5.16565 10.1534C5.07629 8.99181 5.99473 8 7.15975 8H16.8402C18.0053 8 18.9237 8.9918 18.8344 10.1534L18.142 19.1534C18.0619 20.1954 17.193 21 16.1479 21H7.85206C6.80699 21 5.93811 20.1954 5.85795 19.1534L5.16565 10.1534Z"
                      stroke="#000000"
                      stroke-width="2"
                    ></path>{" "}
                    <path
                      d="M19.5 5H4.5"
                      stroke="#000000"
                      stroke-width="2"
                      stroke-linecap="round"
                    ></path>{" "}
                    <path
                      d="M10 3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V5H10V3Z"
                      stroke="#000000"
                      stroke-width="2"
                    ></path>{" "}
                  </g>
                </svg>
              </label>
              <input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </div>
            <Button text="Importar" onClick={handleUploadArchive} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
