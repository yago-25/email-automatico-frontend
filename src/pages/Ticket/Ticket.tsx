/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import Modal from "../../components/Modal/Modal";
import { User } from "../../models/User";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import useSwr from "swr";
import { FaFilter, FaEraser, FaTicketAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
// import { useSwre } from "../../api/useSwr";
// import TagInput from "../../components/TagInput/TagInput";
import { useTranslation } from "react-i18next";
import { IoTicketOutline, IoPersonSharp } from "react-icons/io5";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { MdCheckCircle, MdEdit, MdSave, MdCancel } from "react-icons/md";

import {
  FaCalendarAlt,
  FaClipboardList,
  FaHistory,
  FaRegStickyNote,
  FaTags,
  FaUser,
} from "react-icons/fa";
import "./ticket.css";

interface TicketHistory {
  id: number;
  ticket_id: number;
  user_id: number;
  field_modified: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
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
  histories?: TicketHistory[];
}

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
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={(e) => {
        if (!disabled) {
          onClick?.(e);
        }
      }}
      className={`w-44 h-12 text-white rounded-lg transition-all ease-in-out ${disabled
        ? "bg-blue-400 cursor-not-allowed opacity-50"
        : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg cursor-pointer active:w-11 active:h-11 active:rounded-full active:duration-300"
        } group`}
    >
      <svg
        className={`animate-spin mx-auto ${disabled ? "hidden" : "group-active:block hidden"
          }`}
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="..." fill="white" />
      </svg>
      <span className={`${disabled ? "" : "group-active:hidden"}`}>{text}</span>
    </button>
  );
};

const Ticket = () => {
  const location = useLocation();
  const params = location?.state || [];
  const id = params?.ticket?.id;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const cargo = user.cargo_id;

  const { t } = useTranslation();

  const statusTickets = [
    { name: "Não iniciada", title: t("tickets.types.not_started"), color: "bg-gray-500" },
    { name: "Esperando", title: t("tickets.types.waiting"), color: "bg-yellow-500" },
    { name: "Em progresso", title: t("tickets.types.in_progress"), color: "bg-blue-500" },
    { name: "Completo", title: t("tickets.types.completed"), color: "bg-green-500" },
    { name: "Descartada", title: t("tickets.types.discarded"), color: "bg-red-500" },
  ];

  const statusTranslations = {
    "Não iniciada": "status.not_started",
    "Esperando": "status.waiting",
    "Em progresso": "status.in_progress",
    "Completo": "status.resolved",
    "Descartada": "status.discarded",
  };

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalFilter, setShowModalFilter] = useState(false);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [filterTag, setFilterTag] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterTicket, setFilterTicket] = useState<string>("");
  const [filterUser, setFilterUser] = useState("");
  const [filterClient, setFilterClient] = useState<string>("");
  const [filterType, setFilterType] = useState("");
  const [addTicket, setAddTicket] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [clientName, setClientName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [statusTicket, setStatusTicket] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [observation, setObservation] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editClient, setEditClient] = useState("");
  const [editOperator, setEditOperator] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editObservation, setEditObservation] = useState("");
  const [editTagInputValue, setEditTagInputValue] = useState("");
  const [isEditTagFocused, setIsEditTagFocused] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [_, setFilteredTickets] = useState<Ticket[]>([]);
  const [__, setFilterStatus] = useState<string>("");

  const { data: rawClients = [], isLoading: loadingClients } = useSwr<
    Clients[]
  >("/clients", {
    fetcher: (url) =>
      api
        .get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((res) => res.data),
  });

  const { data: rawAdmins = [], isLoading: loadingAdmins } = useSwr<Admins[]>(
    "/admins",
    {
      fetcher: (url) =>
        api
          .get(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          })
          .then((res) => res.data),
    }
  );

  const { data: rawTickets = [], isLoading, mutate } = useSwr<Ticket[]>(
    "/tickets",
    (url: string) =>
      api
        .get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((res) => res.data)
  );


  // const allTags = Array.from(
  //   new Set(
  //     rawTickets.flatMap((ticket) =>
  //       Array.isArray(ticket.tags) ? ticket.tags : [ticket.tags]
  //     )
  //   )
  // );

  const optionsClient: Option[] = rawClients.map((client: Clients) => ({
    value: String(client.id),
    label: client.name,
  }));

  const optionsAdmin: Option[] = rawAdmins.map((admin: Admins) => ({
    value: String(admin.id),
    label: admin.nome_completo,
  }));

  // const optionsTicket: Option[] = rawTickets.map((ticket) => ({
  //   value: String(ticket.id),
  //   label: ticket.name,
  // }));

  const formatDate = (dateString: string, t: (key: string) => string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, today)) return t("date.today");
    if (isSameDay(date, yesterday)) return t("date.yesterday");

    return date.toLocaleDateString();
  };

  const handleCardClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
    fetchHistory(ticket.id);
  };

  const fetchHistory = async (ticketId: number) => {
    try {
      setLoadingModal(true);

      const { data } = await api.get(`/tickets/${ticketId}/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setHistory(data);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      setHistory([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    setLoadingModal(true);
    if (!selectedTicket) return;

    try {
      await updateTicketStatus(selectedTicket.id, newStatus);

      const { data } = await api.get<Ticket>(`/tickets/${selectedTicket.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setSelectedTicket((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          status: data.status,
        };
      });

      await fetchHistory(selectedTicket.id);

      setSelectedTicket({
        ...data,
        tags: typeof data.tags === "string" ? JSON.parse(data.tags) : data.tags,
      });

      mutate();

      messageAlert({
        type: "success",
        message: "Status atualizado com sucesso!",
      });
    } catch (error) {
      messageAlert({
        type: "error",
        message: "Erro ao atualizar status",
      });
      console.log(error, "error");
    } finally {
      setLoadingModal(false);
    }
  };

  const handleFilterToggle = () => {
    setShowModalFilter(true);
  };

  const handleFilterChange = () => {
    mutate();

    const filtered = rawTickets.filter((ticket) => {
      const matchesStatus = selectedStatuses.length > 0
        ? selectedStatuses.includes(ticket.status)
        : true;

      const matchesTag = filterTag
        ? Array.isArray(ticket.tags)
          ? ticket.tags.some((tag) =>
            tag.toLowerCase().includes(filterTag.toLowerCase())
          )
          : ticket.tags.toLowerCase().includes(filterTag.toLowerCase())
        : true;

      const matchesType = filterType
        ? Array.isArray(ticket.type)
          ? ticket.type.some((type) =>
            type.toLowerCase().includes(filterType.toLowerCase())
          )
          : ticket.type.toLowerCase().includes(filterType.toLowerCase())
        : true;

      const matchesDate = filterDate
        ? new Date(ticket.created_at).toLocaleDateString() ===
        new Date(filterDate).toLocaleDateString()
        : true;

      const matchesTicket = filterTicket
        ? String(ticket.id) === filterTicket
        : true;

      const matchesUser = filterUser
        ? ticket.user?.id === Number(filterUser)
        : true;

      const matchesClient = filterClient
        ? ticket.client?.name.toLowerCase().includes(filterClient.toLowerCase())
        : true;

      return (
        matchesStatus &&
        matchesTag &&
        matchesDate &&
        matchesTicket &&
        matchesUser &&
        matchesClient &&
        matchesType
      );
    });

    setFilteredTickets(filtered);
  };

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterTag("");
    setFilterDate("");
    setFilterType("")
    setFilterTicket("");
    setSelectedStatuses([]);
    setFilterUser("");
    setFilterClient("");
    mutate();
  };

  const filteredTickets = useMemo(() => {
    return rawTickets.filter((ticket) => {
      const matchesStatus = selectedStatuses.length > 0
        ? selectedStatuses.includes(ticket.status)
        : true;

      const matchesTag = filterTag
        ? Array.isArray(ticket.tags)
          ? ticket.tags.some((tag) =>
            tag.toLowerCase().includes(filterTag.toLowerCase())
          )
          : ticket.tags.toLowerCase().includes(filterTag.toLowerCase())
        : true;

      const matchesType = filterType
        ? Array.isArray(ticket.type)
          ? ticket.type.some((type) =>
            type.toLowerCase().includes(filterType.toLowerCase())
          )
          : ticket.type.toLowerCase().includes(filterType.toLowerCase())
        : true;

      const matchesDate = filterDate
        ? new Date(ticket.created_at).toLocaleDateString() ===
        new Date(filterDate).toLocaleDateString()
        : true;

      const matchesTicket = filterTicket
        ? String(ticket.id) === filterTicket
        : true;

      const matchesUser = filterUser
        ? ticket.user?.id === Number(filterUser)
        : true;

      const matchesClient = filterClient
        ? ticket.client?.name.toLowerCase().includes(filterClient.toLowerCase())
        : true;

      return (
        matchesStatus &&
        matchesTag &&
        matchesDate &&
        matchesTicket &&
        matchesUser &&
        matchesClient &&
        matchesType
      );
    });
  }, [
    rawTickets,
    selectedStatuses,
    filterType,
    filterTag,
    filterDate,
    filterTicket,
    filterUser,
    filterClient,
  ]);


  const handleToggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      }
      return [...prev, status];
    });
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

      mutate();

      messageAlert({
        type: "success",
        message: "Ticket cadastrado com sucesso!",
      });

      setStatusTicket("");
      setClientName("");
      setTypeName("");
      setSelected("");
      setSelectedAdmin("");
      setFilterType("")
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

  const handleSelectChange = (value: string | number) => {
    setSelected(value.toString());
  };

  const handleSelectChangeAdmin = (value: string | number) => {
    setSelectedAdmin(value.toString());
  };

  const availableTickets = useMemo(() => {
    return rawTickets.filter((ticket) => {
      const matchesClient = filterClient
        ? ticket.client?.name.toLowerCase() === filterClient.toLowerCase()
        : true;

      const matchesUser = filterUser
        ? ticket.user?.id === Number(filterUser)
        : true;

      return matchesClient && matchesUser;
    });
  }, [filterClient, filterUser, rawTickets]);


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

  const availableTicketOptions = useMemo(() => {
    return availableTickets.map((ticket) => ({
      value: ticket.id,
      label: `${ticket.id} - ${ticket.client?.name || "Sem Cliente"}`,
    }));
  }, [availableTickets]);

  const availableClients = useMemo(() => {
    if (!filterUser) return rawClients;

    const clientNames = new Set(
      rawTickets
        .filter((ticket) => ticket.user?.id === Number(filterUser))
        .map((ticket) => ticket.client?.name)
        .filter(Boolean)
    );

    return rawClients.filter((client) => clientNames.has(client.name));
  }, [filterUser, rawClients, rawTickets]);

  const availableTypes = useMemo(() => {
    const typesSet = new Set<string>();

    availableTickets.forEach((ticket) => {
      if (ticket.type) {
        typesSet.add(ticket.type);
      }
    });

    return Array.from(typesSet);
  }, [availableTickets]);

  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    await api.put(
      `/tickets/${ticketId}/status`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
  };

  useEffect(() => {
    if (showModal && selectedTicket?.id) {
      fetchHistory(selectedTicket.id);
    }
  }, [showModal, selectedTicket?.id]);

  useEffect(() => {
    setFilteredTickets(rawTickets);
  }, [rawTickets]);

  useEffect(() => {
    if (id && rawTickets.length > 0) {
      const matchedTickets = rawTickets.filter(
        (ticket) => ticket.client.id === id
      );

      if (matchedTickets.length > 0) {
        setFilterClient(matchedTickets[0].client?.name || "");
        setSelectedTicket(matchedTickets[0]);
        fetchHistory(matchedTickets[0].id);
        setFilteredTickets(matchedTickets);
      } else {
        setFilterClient("");
        setSelectedTicket(null);
        setFilteredTickets([]);
      }
    }
  }, [id, rawTickets]);

  const handleEditClick = () => {
    if (!selectedTicket) return;

    setIsEditing(true);
    setEditingTicket(selectedTicket);
    setEditName(selectedTicket.name);
    setEditType(selectedTicket.type);
    setEditClient(selectedTicket.client?.name || "");
    setEditOperator(selectedTicket.user?.nome_completo || "");
    setEditTags(Array.isArray(selectedTicket.tags) ? selectedTicket.tags : JSON.parse(selectedTicket.tags || "[]"));
    setEditObservation(selectedTicket.observation || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTicket(null);
    setEditName("");
    setEditType("");
    setEditClient("");
    setEditOperator("");
    setEditTags([]);
    setEditObservation("");
    setEditTagInputValue("");
  };

  const handleSaveEdit = async () => {
    if (!selectedTicket || !editingTicket) return;

    setLoadingEdit(true);
    try {
      const selectedClient = rawClients.find(client => client.name === editClient);
      const selectedOperator = rawAdmins.find(admin => admin.nome_completo === editOperator);

      if (!selectedClient || !selectedOperator) {
        messageAlert({
          type: "error",
          message: "Cliente ou operador não encontrado",
        });
        return;
      }

      await api.put(
        `/tickets/${selectedTicket.id}`,
        {
          name: editName,
          type: editType,
          client_id: selectedClient.id,
          user_id: selectedOperator.id,
          tags: editTags,
          observation: editObservation,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const updatedTicket = {
        ...selectedTicket,
        name: editName,
        type: editType,
        client: { id: selectedClient.id, name: editClient },
        user: { ...selectedTicket.user, nome_completo: editOperator },
        tags: editTags,
        observation: editObservation,
      };

      setSelectedTicket(updatedTicket);
      setIsEditing(false);
      setEditingTicket(null);

      mutate();

      messageAlert({
        type: "success",
        message: "Ticket atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
      messageAlert({
        type: "error",
        message: "Erro ao atualizar ticket",
      });
    } finally {
      setLoadingEdit(false);
    }
  };

 const handleEditTagAdd = (tag: string) => {
    if (tag.trim() && !editTags.includes(tag.trim())) {
      if (editTags.length >= 7) {
        messageAlert({
          type: "error",
          message: "Limite máximo de 7 tags por ticket atingido.",
        });
        return;
      }
      setEditTags([...editTags, tag.trim()]);
    }
  };

  const handleEditTagRemove = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };

  const filteredEditTags = useMemo(() => {
    const input = editTagInputValue.toLowerCase();
    return availableTags.filter(
      (tag) =>
        (input === "" || tag.toLowerCase().includes(input)) &&
        !editTags.includes(tag)
    );
  }, [availableTags, editTagInputValue, editTags]);

  if (!filteredTickets || isLoading || loadingAdmins || loadingClients) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spin />
      </div>
    );
  }


  return (
    <div>
      <Header name={authUser?.nome_completo} />

      <div className="filter-button-container flex items-center gap-4 mb-4 p-4">
        {(cargo === 1 || cargo === 2) && (
          <button
            onClick={() => setAddTicket(true)}
            className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg shadow-md hover:bg-purple-700 hover:shadow-lg transition-all duration-200"
          >
            <IoTicketOutline className="w-5 h-5" />
            {t("dashboard.add_ticket")}
          </button>
        )}

        <button
          onClick={handleFilterToggle}
          className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
        >
          <FaFilter className="w-5 h-5" />
          {t("filters.titleup")}
        </button>

        <button
          onClick={handleClearFilters}
          className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-200"
        >
          <FaEraser className="w-5 h-5" />
          {t("filters.clear")}
        </button>
        <div className="flex items-center gap-4 flex-wrap">
          {statusTickets.map((status) => (
            <label
              key={status.name}
              className="flex items-center gap-3 cursor-pointer group px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="relative flex items-center justify-center w-5 h-5">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status.name)}
                  onChange={() => handleToggleStatus(status.name)}
                  className="peer appearance-none w-5 h-5 border-2 border-white/50 rounded-md
                  checked:bg-blue-500 checked:border-blue-500
                  hover:border-white/80
                  focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1
                  transition-all duration-200 ease-in-out"
                />
                <MdCheckCircle
                  className="absolute w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform duration-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <span className="text-sm font-medium text-white group-hover:text-white">
                  {status.title}
                </span>
              </div>
            </label>
          ))}
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 w-full">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Spin />
          </div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleCardClick(ticket)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-600 transition-all duration-300">
                      <IoPersonSharp className="w-5 h-5 text-blue-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {ticket.client?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(ticket.created_at, t)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl group-hover:bg-purple-600 transition-all duration-300">
                      <IoTicketOutline className="w-5 h-5 text-purple-600 group-hover:text-white" />
                    </div>
                    <h4 className="font-medium text-gray-800">
                      {ticket.name}
                    </h4>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 rounded-xl group-hover:bg-yellow-600 transition-all duration-300">
                      <FaRegStickyNote className="w-5 h-5 text-yellow-600 group-hover:text-white" />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ticket.observation || t("ticket.no_observation")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Array.isArray(ticket.tags) &&
                    ticket.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <div
                    className={`
                      px-4 py-2 rounded-xl flex items-center gap-2 w-full justify-center
                      ${ticket.status === "Não iniciada"
                        ? "bg-gray-100 text-gray-600"
                        : ticket.status === "Esperando"
                          ? "bg-yellow-100 text-yellow-600"
                          : ticket.status === "Em progresso"
                            ? "bg-blue-100 text-blue-600"
                            : ticket.status === "Completo"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                      } 
                      group-hover:bg-opacity-20 transition-all duration-300
                    `}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t(
                        statusTranslations[
                        ticket.status as keyof typeof statusTranslations
                        ]
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <IoTicketOutline className="w-16 h-16 mb-4 text-white" />
            <p className="text-lg font-medium text-white">
              {t("messages.noTicketsFound")}
            </p>
          </div>
        )}
      </div>

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
                {t("filters.user")}
              </label>
            </div>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 backdrop-blur-sm"
            >
              <option value="">{t("filters.all")}</option>
              {rawAdmins.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nome_completo}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                <IoPersonSharp className="w-5 h-5" />
              </div>
              <label className="text-sm font-semibold text-gray-700">
                {t("filters.client")}
              </label>
            </div>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/70 backdrop-blur-sm"
            >
              <option value="">{t("filters.all")}</option>
              {availableClients.map((client) => (
                <option key={client.name} value={client.name}>
                  {client.name}
                </option>
              ))}

            </select>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <FaTicketAlt className="w-5 h-5" />
              </div>
              <label className="text-sm font-semibold text-gray-700">
                {t("filters.type")}
              </label>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/70 backdrop-blur-sm"
            >
              <option value="">{t("filters.all")}</option>
              {availableTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600">
                <FaTags className="w-5 h-5" />
              </div>
              <label className="text-sm font-semibold text-gray-700">
                {t("filters.tag")}
              </label>
            </div>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/70 backdrop-blur-sm"
            >
              <option value="">{t("filters.all")}</option>
              {availableTags.map((tag, index) => (
                <option key={index} value={tag}>
                  {tag}
                </option>
              ))}

            </select>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-red-100 rounded-xl text-red-600">
                <FaCalendarAlt className="w-5 h-5" />
              </div>
              <label className="text-sm font-semibold text-gray-700">
                {t("filters.date")}
              </label>
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white/70 backdrop-blur-sm"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <IoTicketOutline className="w-5 h-5" />
              </div>
              <label className="text-sm font-semibold text-gray-700">
                {t("filters.ticket")}
              </label>
            </div>
            <select
              value={filterTicket}
              onChange={(e) => setFilterTicket(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/70 backdrop-blur-sm"
            >
              <option value="">{t("filters.all")}</option>
              {availableTicketOptions.map((option) => (
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

      {selectedTicket && (
        <Modal
          title={
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <span className="text-xl font-semibold break-words max-w-full sm:max-w-md">
                {t("ticket.title", { name: selectedTicket.name })}
              </span>
              <div className="flex items-center gap-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={loadingEdit}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <MdSave className="w-3.5 h-3.5" />
                      {loadingEdit ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={loadingEdit}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <MdCancel className="w-3.5 h-3.5" />
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <MdEdit className="w-3.5 h-3.5" />
                    Editar
                  </button>
                )}
              </div>
            </div>


          }
          isVisible={showModal}
          onClose={() => {
            setShowModal(false);
            setIsEditing(false);
            setEditingTicket(null);
          }}
        >
          <div className="flex flex-col gap-4 text-sm text-gray-800 max-h-[80vh] overflow-y-auto pr-1">
            {loadingModal ? (
              <div className="flex items-center justify-center h-60">
                <Spin color="blue" />
              </div>
            ) : (
              <>
                <div className="bg-white p-4 rounded-xl shadow-md space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                    <FaClipboardList /> {t("ticket.details_title")}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            {t("ticket.name")}:
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            {t("ticket.type")}:
                          </label>
                          <input
                            type="text"
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            {t("ticket.client")}:
                          </label>
                          <select
                            value={editClient}
                            onChange={(e) => setEditClient(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <option value="">Selecione um cliente</option>
                            {rawClients.map((client) => (
                              <option key={client.id} value={client.name}>
                                {client.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            {t("ticket.operator")}:
                          </label>
                          <select
                            value={editOperator}
                            onChange={(e) => setEditOperator(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <option value="">Selecione um operador</option>
                            {rawAdmins.map((admin) => (
                              <option key={admin.id} value={admin.nome_completo}>
                                {admin.nome_completo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>
                          <strong>{t("ticket.name")}:</strong> {selectedTicket.name}
                        </p>
                        <p>
                          <strong>{t("ticket.type")}:</strong> {selectedTicket.type}
                        </p>
                        <p>
                          <strong>{t("ticket.client")}:</strong>{" "}
                          {selectedTicket.client?.name}
                        </p>
                        <p>
                          <strong>{t("ticket.operator")}:</strong>{" "}
                          {selectedTicket.user?.nome_completo}
                        </p>
                      </>
                    )}

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <strong>{t("ticket.status")}:</strong>
                      </label>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleChangeStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="Não iniciada">
                          {t("status.not_started")}
                        </option>
                        <option value="Esperando">{t("status.waiting")}</option>
                        <option value="Em progresso">
                          {t("status.in_progress")}
                        </option>
                        <option value="Completo">{t("status.resolved")}</option>
                        <option value="Descartada">{t("status.closed")}</option>
                      </select>
                    </div>

                    <p>
                      <strong>{t("ticket.creation_date")}:</strong>{" "}
                      {formatDate(selectedTicket.created_at, t)}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                    <FaTags /> {t("ticket.tags_title")}
                  </h3>
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={editTagInputValue}
                          onChange={(e) => setEditTagInputValue(e.target.value)}
                          onFocus={() => setIsEditTagFocused(true)}
                          onBlur={() => {
                            setTimeout(() => setIsEditTagFocused(false), 150);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editTagInputValue.trim() !== "") {
                              e.preventDefault();
                              handleEditTagAdd(editTagInputValue.trim());
                              setEditTagInputValue("");
                            }
                          }}
                          placeholder="Adicionar tag..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />

                        {isEditTagFocused && filteredEditTags.length > 0 && (
                          <ul className="absolute z-10 bg-white border border-gray-200 mt-1 rounded-lg w-full max-h-40 overflow-y-auto shadow-md">
                            {filteredEditTags.map((tag, idx) => (
                              <li
                                key={idx}
                                onClick={() => {
                                  handleEditTagAdd(tag);
                                  setEditTagInputValue("");
                                }}
                                className="px-4 py-2 cursor-pointer hover:bg-green-100"
                              >
                                {tag}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {editTags.map((tag, idx) => (
                          <div
                            key={idx}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                          >
                            {tag}
                            <button
                              onClick={() => handleEditTagRemove(tag)}
                              className="text-green-700 hover:text-green-900"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(Array.isArray(selectedTicket.tags)
                        ? selectedTicket.tags
                        : JSON.parse(selectedTicket.tags || "[]")
                      ).map((tag: string, index: number) => (
                        <span key={index} className={`ticket-tag color-0`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-600">
                    <FaRegStickyNote /> {t("ticket.notes_title")}
                  </h3>
                  {isEditing ? (
                    <div className="mt-2">
                      <textarea
                        value={editObservation}
                        onChange={(e) => setEditObservation(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                        placeholder="Adicionar observações..."
                      />
                    </div>
                  ) : (
                    <p className="mt-2">
                      {selectedTicket.observation || t("ticket.no_notes")}
                    </p>
                  )}
                </div>

                {Array.isArray(history) && history.length > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-600">
                      <FaHistory /> {t("ticket.history_title")}
                    </h3>

                    <div className="space-y-3 mt-3">
                      {history.map((item, index) => {
                        const isStatus = item.field_modified === "status";

                        const values = [
                          { name: "not_started", translate: "Não iniciada" },
                          { name: "waiting", translate: "Esperando" },
                          { name: "in_progress", translate: "Em progresso" },
                          { name: "completed", translate: "Completo" },
                          { name: "discarded", translate: "Descartada" },
                        ];

                        const getTranslatedStatus = (value: any) => {
                          return values.find(
                            (v) =>
                              v.translate.toLowerCase() === value?.toLowerCase()
                          )?.name;
                        };

                        const oldValue = getTranslatedStatus(item.old_value);
                        const newValue = getTranslatedStatus(item.new_value);

                        const isCreated =
                          isStatus &&
                          (!item.old_value || item.old_value === "") &&
                          item.new_value === "not_started";

                        const isTicketCreated =
                          item.field_modified === "ticket" &&
                          item.new_value === "created";

                        return (
                          <div
                            key={index}
                            className="border-l-4 border-purple-400 pl-4 py-2 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                          >
                            <p>
                              <strong>
                                {t(
                                  `fields.${item.field_modified}`,
                                  item.field_modified
                                )}
                                :
                              </strong>{" "}
                              {isTicketCreated ? (
                                <>{t("ticket.created")}</>
                              ) : isCreated ? (
                                <>{t("ticket.created")}</>
                              ) : item.old_value === null ||
                                item.old_value === "" ? (
                                <>
                                  {t("ticket.changed.set_to")}{" "}
                                  <em>"{t(`status.${newValue}`)}"</em>
                                </>
                              ) : (
                                <>
                                  {t("ticket.changed.from")}{" "}
                                  <em>"{t(`status.${oldValue}`)}"</em>{" "}
                                  {t("ticket.changed.to")}{" "}
                                  <em>"{t(`status.${newValue}`)}"</em>
                                </>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FaCalendarAlt />{" "}
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                            {item.user?.nome_completo && (
                              <p className="text-xs text-gray-600 italic flex items-center gap-1">
                                <FaUser /> {t("ticket.modified_by")}:{" "}
                                <strong>{item.user.nome_completo}</strong>
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
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

                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, idx) => (
                      <div
                        key={idx}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() =>
                            setTags(tags.filter((t) => t !== tag))
                          }
                          className="text-yellow-700 hover:text-yellow-900"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
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
    </div>
  );
};

export default Ticket;
