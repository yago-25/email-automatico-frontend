import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import "./dashboard.css";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { useSwr } from "../../api/useSwr";
import TagInput from "../../components/TagInput/TagInput";
import { MdOutlineFormatListNumbered } from "react-icons/md";
import { CiPhone } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import { FaGear } from "react-icons/fa6";
import { HiOutlineUser } from "react-icons/hi";
import { IoTicketOutline } from "react-icons/io5";
import { IoPersonSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FaTags, FaClipboardList, FaRegStickyNote } from "react-icons/fa";
import { HiUserAdd, HiX } from "react-icons/hi";
import { HiMail, HiPhone, HiUser } from "react-icons/hi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FiBriefcase } from "react-icons/fi";
import { parsePhoneNumberFromString } from "libphonenumber-js";

interface Option {
  label: string;
  value: string;
}

interface Clients {
  id: number;
  name: string;
  phone: string;
  mail: string;
  value?: string;
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
  const [clientName, setClientName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientMail, setClientMail] = useState("");
  const [statusTicket, setStatusTicket] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [observation, setObservation] = useState("");
  const itemsPerPage = 5;

  const filteredClients = rawClients.filter(
    (client: Clients) =>
      client.name.toLowerCase().includes(filteredTxt.toLowerCase()) ||
      client.mail.toLowerCase().includes(filteredTxt.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
        { name: clientName, phone: clientPhone, mail: clientMail },
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
          message: "Por favor, preencha todos os campos.",
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
        message: "Ticket cadastrado com sucesso!",
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
        message: "Erro ao adicionar ticket",
      });
    } finally {
      setLoadingPost(false);
    }
  };

  const handleTicket = (ticketName: string) => {
    navigate(`/ticket/${ticketName}`);
  };

  const handleClient = (client: Clients) => {
    navigate(`/clients`, { state: { client } });
  };

  if (loadingClients || loadingAdmins) {
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

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 w-full max-w-4xl mx-auto px-4">
        <div className="relative w-full md:max-w-2xl">
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

        <div className="flex gap-4 w-full max-w-md">
          <button
            onClick={() => setAddClient(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
          >
            <HiUserAdd className="w-5 h-5" />
            {t("dashboard.add_client")}
          </button>
          <button
            onClick={() => setAddTicket(true)}
            className="flex items-center gap-2 bg-white text-blue-500 px-5 py-3 rounded-xl shadow-md hover:hover:bg-gray-200 transition"
          >
            <IoTicketOutline className="w-5 h-5" />
            {t("dashboard.add_ticket")}
          </button>
        </div>
      </div>

      <div className="w-full max-w-[80rem] mx-auto mt-10 rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-5 gap-x-6 items-center justify-items-center px-6 py-4 bg-gradient-to-r from-blue-100 to-blue-200 border-b font-semibold text-blue-900 text-sm uppercase tracking-wide">
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
            <FaGear className="text-blue-700" /> {t("clients.actions")}
          </p>
        </div>

        {currentClients.map((client, index) => (
          <div
            key={client.id}
            className={`grid grid-cols-5 gap-x-6 items-center justify-items-center px-6 py-4 text-sm border-b transition duration-200 ${
              index % 2 === 0 ? "bg-gray-50" : "bg-white"
            } hover:bg-blue-50`}
          >
            <p className="text-center text-gray-800 font-medium">{client.id}</p>
            <p
              className="text-center truncate text-gray-700"
              title={client.name}
            >
              {client.name}
            </p>
            <p
              className="text-center truncate text-gray-700"
              title={client.mail}
            >
              {client.mail}
            </p>
            <p className="text-center text-gray-700" title={client.phone}>
              {formatPhone(client.phone)}
            </p>
            <div className="flex justify-center items-center gap-3">
              <button
                onClick={() => handleClient(client)}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                title="Ver tickets"
              >
                <IoPersonSharp className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleTicket(client.name)}
                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                title="Ver tickets"
              >
                <IoTicketOutline className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
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
              <h2 className="text-2xl font-bold text-gray-800">{t("dashboard.add_client")}</h2>
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
        {loadingPost ? (
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <Spin />
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-sm text-gray-800 max-h-[80vh] overflow-y-auto pr-1">
            <div className="bg-white p-4 rounded-xl shadow-md space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                <FaClipboardList /> {t("modal.ticket_details")}
              </h3>

              <div className="grid grid-cols-2 gap-4">
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

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    {t("modal.type")}
                  </label>
                  <Input
                    text={t("modal.type")}
                    type="text"
                    required
                    onChange={(e) => setTypeName(e.target.value)}
                    value={typeName}
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
                <TagInput
                  tags={tags}
                  setTags={setTags}
                  placeholder={t("modal.add_tags")}
                />
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
    </div>
  );
};

export default Dashboard;
