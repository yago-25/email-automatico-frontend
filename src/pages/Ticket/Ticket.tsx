/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Modal from "../../components/Modal/ModalTicket";
import { User } from "../../models/User";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import useSwr from "swr";
import {
  FaFilter,
  FaEraser,
  FaTicketAlt,
  FaTrash,
  FaFileAlt,
  FaSave,
  FaEye,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
// import { useSwre } from "../../api/useSwr";
// import TagInput from "../../components/TagInput/TagInput";
import { useTranslation } from "react-i18next";
import { IoTicketOutline, IoPersonSharp, IoSend } from "react-icons/io5";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  MdCheckCircle,
  MdEdit,
  MdSave,
  MdCancel,
  MdRestore,
} from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";
import { differenceInDays } from "date-fns";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";

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
  paid: boolean;
  observation?: string;
  histories?: TicketHistory[];
  deleted_at?: string | null;
  file_url?: string;
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
      className={`w-44 h-12 text-white rounded-lg transition-all ease-in-out ${
        disabled
          ? "bg-blue-400 cursor-not-allowed opacity-50"
          : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg cursor-pointer active:w-11 active:h-11 active:rounded-full active:duration-300"
      } group`}
    >
      <svg
        className={`animate-spin mx-auto ${
          disabled ? "hidden" : "group-active:block hidden"
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
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const cargo = user.cargo_id;
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const statusTickets = [
    {
      name: "Não iniciada",
      title: t("tickets.types.not_started"),
      color: "bg-gray-500",
    },
    {
      name: "Esperando",
      title: t("tickets.types.waiting"),
      color: "bg-yellow-500",
    },
    {
      name: "Em progresso",
      title: t("tickets.types.in_progress"),
      color: "bg-blue-500",
    },
    {
      name: "Completo",
      title: t("tickets.types.completed"),
      color: "bg-green-500",
    },
    {
      name: "Descartada",
      title: t("tickets.types.discarded"),
      color: "bg-red-500",
    },
  ];

  const statusTranslations = {
    "Não iniciada": "status.not_started",
    Esperando: "status.waiting",
    "Em progresso": "status.in_progress",
    Completo: "status.resolved",
    Descartada: "status.discarded",
  };

  const expirationDays = 30;

  const [clientFromState, setClientFromState] = useState<Clients | undefined>(
    location.state?.ticket
  );

  const [showModal, setShowModal] = useState(false);
  const [showModalFilter, setShowModalFilter] = useState(false);
  const [addTicket, setAddTicket] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  console.log(selectedTicket, "selectedTicket");
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [showOnlyDeleted, setShowOnlyDeleted] = useState(false);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterTicket, setFilterTicket] = useState<string>("");
  const [filterUser, setFilterUser] = useState("");
  const [filterClient, setFilterClient] = useState<string>("");
  const [filterType, setFilterType] = useState("");

  const [clientName, setClientName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [statusTicket, setStatusTicket] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [observation, setObservation] = useState("");
  const [tagInputValue, setTagInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editClient, setEditClient] = useState("");
  const [editOperator, setEditOperator] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editObservation, setEditObservation] = useState("");
  const [editTagInputValue, setEditTagInputValue] = useState("");
  const [isEditTagFocused, setIsEditTagFocused] = useState(false);

  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingSaveBoleto, setLoadingSaveBoleto] = useState(false);
  const [loadingSendBoleto, setLoadingSendBoleto] = useState(false);
  const [loadingRemoveBoleto, setLoadingRemoveBoleto] = useState(false);

  const [openModalSendBoleto, setOpenModalSendBoleto] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

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

  const {
    data: rawTickets = [],
    isLoading,
    mutate,
  } = useSwr<Ticket[]>("/tickets", (url: string) =>
    api
      .get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => res.data)
  );

  const {
    data: trashedTickets = [],
    isLoading: loadingTrashed,
    mutate: mutateTrashed,
  } = useSwr<Ticket[]>("/tickets/trashed", (url: string) =>
    api
      .get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => res.data)
  );

  const optionsClient: Option[] = useMemo(
    () =>
      rawClients.map((client: Clients) => ({
        value: String(client.id),
        label: client.name,
      })),
    [rawClients]
  );

  const optionsAdmin: Option[] = useMemo(
    () =>
      rawAdmins.map((admin: Admins) => ({
        value: String(admin.id),
        label: admin.nome_completo,
      })),
    [rawAdmins]
  );

  const filteredTickets = useMemo(() => {
    let filtered = [...rawTickets];

    if (clientFromState && !filterClient) {
      filtered = filtered.filter(
        (ticket) => ticket.client?.id === clientFromState.id
      );
    }

    filtered = filtered.filter((ticket) => {
      const matchesStatus =
        selectedStatuses.length > 0
          ? selectedStatuses.includes(ticket.status)
          : true;

      const matchesTag = filterTag
        ? Array.isArray(ticket.tags)
          ? ticket.tags.some((tag) =>
              tag.toLowerCase().includes(filterTag.toLowerCase())
            )
          : ticket.tags?.toLowerCase().includes(filterTag.toLowerCase())
        : true;

      const matchesType = filterType
        ? Array.isArray(ticket.type)
          ? ticket.type.some((type) =>
              type.toLowerCase().includes(filterType.toLowerCase())
            )
          : ticket.type?.toLowerCase().includes(filterType.toLowerCase())
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

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      const onlyDateA = new Date(
        dateA.getFullYear(),
        dateA.getMonth(),
        dateA.getDate()
      );
      const onlyDateB = new Date(
        dateB.getFullYear(),
        dateB.getMonth(),
        dateB.getDate()
      );

      const diff = onlyDateA.getTime() - onlyDateB.getTime();

      if (diff !== 0) return diff;

      return a.id - b.id;
    });
  }, [
    rawTickets,
    clientFromState,
    selectedStatuses,
    filterType,
    filterTag,
    filterDate,
    filterTicket,
    filterUser,
    filterClient,
  ]);

  const visibleTickets = useMemo(() => {
    if (showOnlyDeleted) {
      return trashedTickets;
    }

    const statusToShow = [
      "Em progresso",
      "Não iniciada",
      "Esperando",
      "Descartada",
      "Completo",
    ];

    return filteredTickets.filter((ticket) =>
      statusToShow.includes(ticket.status)
    );
  }, [showOnlyDeleted, trashedTickets, filteredTickets]);

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

  const filteredEditTags = useMemo(() => {
    const input = editTagInputValue.toLowerCase();
    return availableTags.filter(
      (tag) =>
        (input === "" || tag.toLowerCase().includes(input)) &&
        !editTags.includes(tag)
    );
  }, [availableTags, editTagInputValue, editTags]);

  const availableTicketOptions = useMemo(() => {
    return availableTickets.map((ticket) => ({
      value: ticket.id,
      label: `${ticket.id} - ${ticket.client?.name || t("labels.noClient")}`,
    }));
  }, [availableTickets, t]);

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

  const daysLeft = useMemo(() => {
    if (!selectedTicket?.deleted_at) return null;

    const deletedDate = new Date(selectedTicket.deleted_at);
    const now = new Date();
    const daysPassed = differenceInDays(now, deletedDate);
    const remaining = expirationDays - daysPassed;

    return remaining < 0 ? 0 : remaining;
  }, [selectedTicket?.deleted_at, expirationDays]);

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

  const handleCardClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
    fetchHistory(ticket.id);
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!selectedTicket) return;

    setLoadingModal(true);
    try {
      await updateTicketStatus(selectedTicket.id, newStatus);

      const { data } = await api.get<Ticket>(`/tickets/${selectedTicket.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const updatedTicket = {
        ...data,
        tags: typeof data.tags === "string" ? JSON.parse(data.tags) : data.tags,
      };

      setSelectedTicket(updatedTicket);
      await fetchHistory(selectedTicket.id);
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

  const handleAddTicket = async () => {
    if (tags.length > 7) {
      messageAlert({
        type: "error",
        message: t("alerts.maxTags"),
      });
      return;
    }

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

    setLoadingPost(true);
    try {
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
        message: t("alerts.ticketCreated"),
      });

      setAddTicket(false);
      setStatusTicket("");
      setClientName("");
      setTypeName("");
      setSelected("");
      setSelectedAdmin("");
      setFilterType("");
      setTags([]);
      setObservation("");
    } catch (e) {
      messageAlert({
        type: "error",
        message: t("alerts.ticketError"),
      });
      console.log(e, "Error");
    } finally {
      setLoadingPost(false);
    }
  };

  const handleDelete = async () => {
    if (ticketToDelete === null) return;

    setIsDeleting(true);
    try {
      await api.delete(`/tickets/${ticketToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      messageAlert({
        type: "success",
        message: t("messages.ticketDeleted"),
      });

      setTimeout(() => {
        setIsDeleting(false);
        setIsDeleteModalVisible(false);
        setTicketToDelete(null);
        setShowModal(false);
        mutate();
        mutateTrashed();
      }, 400);
    } catch (error) {
      setIsDeleting(false);
      messageAlert({
        type: "error",
        message: t("messages.errorDeletingTicket"),
      });
      console.log(error, "Error");
    }
  };

  const handleRestore = async (ticketId: number) => {
    try {
      await api.put(
        `/tickets/${ticketId}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      messageAlert({
        type: "success",
        message: t("messages.ticketRestored"),
      });

      setShowModal(false);
      mutate();
      mutateTrashed();
    } catch (error) {
      messageAlert({
        type: "error",
        message: t("messages.errorRestoringTicket"),
      });
      console.log(error, "Error");
    }
  };

  const handleEditClick = () => {
    if (!selectedTicket) return;

    setIsEditing(true);
    setEditingTicket(selectedTicket);
    setEditName(selectedTicket.name);
    setEditType(selectedTicket.type);
    setEditClient(selectedTicket.client?.name || "");
    setEditOperator(selectedTicket.user?.nome_completo || "");
    setEditTags(
      Array.isArray(selectedTicket.tags)
        ? selectedTicket.tags
        : JSON.parse(selectedTicket.tags || "[]")
    );
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

    const selectedClient = rawClients.find(
      (client) => client.name === editClient
    );
    const selectedOperator = rawAdmins.find(
      (admin) => admin.nome_completo === editOperator
    );

    if (!selectedClient || !selectedOperator) {
      messageAlert({
        type: "error",
        message: t("alerts.clientOrOperatorNotFound"),
      });
      return;
    }

    setLoadingEdit(true);
    try {
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
        message: t("alerts.ticketUpdated"),
      });
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
      messageAlert({
        type: "error",
        message: t("alerts.ticketUpdateError"),
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleEditTagAdd = (tag: string) => {
    if (!tag.trim() || editTags.includes(tag.trim())) return;

    if (editTags.length >= 7) {
      messageAlert({
        type: "error",
        message: t("alerts.maxTags"),
      });
      return;
    }

    setEditTags([...editTags, tag.trim()]);
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    messageAlert({
      type: "success",
      message: `Arquivo "${file.name}" selecionado`,
    });
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveBoleto = async (ticket: Ticket) => {
    if (!selectedFile) {
      messageAlert({
        type: "error",
        message: t("boleto.no_file_selected"),
      });
      return;
    }

    setLoadingSaveBoleto(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post(
        `/s3/upload-url/profile/ticket/${ticket.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data.file_url) {
        setSelectedTicket({
          ...ticket,
          file_url: response.data.file_url,
        });

        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        mutate();

        messageAlert({
          type: "success",
          message: t("boleto.saved_success"),
        });
      } else {
        messageAlert({
          type: "error",
          message: response.data.message || t("boleto.save_error"),
        });
      }
    } catch (error: any) {
      messageAlert({
        type: "error",
        message: error?.response?.data?.error || t("boleto.save_error"),
      });
      console.error("Erro ao enviar arquivo:", error);
    } finally {
      setLoadingSaveBoleto(false);
    }
  };

  const handleSendBoleto = async (ticket: Ticket | null) => {
    if (!ticket?.file_url) {
      messageAlert({
        type: "error",
        message: t("boleto.no_boleto_to_send"),
      });
      return;
    }

    setLoadingSendBoleto(true);
    setIsSending(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const payload = {
        subject: "Your Service Invoice",
        body: "Please find attached the payment slip for your service.",
        client_id: Number(ticket.client?.id ?? ticket.client),
        attachments: [
          {
            name: ticket.file_url.split("/").pop() || "boleto.pdf",
            url: encodeURI(ticket.file_url),
          },
        ],
        emailMessage: message,
      };

      const { data } = await api.post("/enviar-email", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (data.success) {
        messageAlert({
          type: "success",
          message: t("boleto.sent_success"),
        });
        setOpenModalSendBoleto(false);
        setMessage("");
      } else {
        messageAlert({
          type: "error",
          message: data?.error || t("boleto.send_error"),
        });
      }
    } catch (error) {
      messageAlert({
        type: "error",
        message: t("boleto.send_error"),
      });
      console.log(error, "Erro");
    } finally {
      setLoadingSendBoleto(false);
      setIsSending(false);
    }
  };

  const handleRemoveBoleto = async (ticketId: number) => {
    if (!selectedTicket) return;

    setLoadingRemoveBoleto(true);

    try {
      await api.delete(`/tickets/${ticketId}/file`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setSelectedTicket({
        ...selectedTicket,
        file_url: "",
      });

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      mutate();

      messageAlert({
        type: "success",
        message: t("file.removed_success"),
      });
    } catch (e: any) {
      console.error("Erro ao remover arquivo:", e);
      messageAlert({
        type: "error",
        message: e?.response?.data?.error || t("file.remove_error"),
      });
    } finally {
      setLoadingRemoveBoleto(false);
    }
  };

  const handleEditTagRemove = (tagToRemove: string) => {
    setEditTags(editTags.filter((tag) => tag !== tagToRemove));
  };

  const handleFilterToggle = () => {
    setShowModalFilter(true);
  };

  const handleFilterChange = () => {
    setShowModalFilter(false);
  };

  const handleClearFilters = () => {
    setFilterTag("");
    setFilterDate("");
    setFilterType("");
    setFilterTicket("");
    setSelectedStatuses([]);
    setFilterUser("");
    setFilterClient("");
    setClientFromState(undefined);
    setShowModalFilter(false);
  };

  const handleToggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      }
      return [...prev, status];
    });
  };

  const handleSelectChange = (value: string | number) => {
    setSelected(value.toString());
  };

  const handleSelectChangeAdmin = (value: string | number) => {
    setSelectedAdmin(value.toString());
  };

  useEffect(() => {
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (showModal && selectedTicket?.id) {
      fetchHistory(selectedTicket.id);
    }
  }, [showModal, selectedTicket?.id]);

  if (isLoading || loadingAdmins || loadingClients || loadingTrashed) {
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
        <button
          onClick={() => setShowOnlyDeleted((prev) => !prev)}
          className={`flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200
          ${
            showOnlyDeleted
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          <FaTrash size={20} />
          {showOnlyDeleted
            ? t("statusFilter.active")
            : t("statusFilter.deleted")}
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
                <MdCheckCircle className="absolute w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform duration-200" />
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
        {isLoading || (showOnlyDeleted && loadingTrashed) ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Spin />
          </div>
        ) : filteredTickets.length > 0 ? (
          visibleTickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleCardClick(ticket)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer relative"
            >
              {ticket.paid && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs font-semibold">Paid</span>
                  </div>
                </div>
              )}

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
                    <h4 className="font-medium text-gray-800">{ticket.name}</h4>
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
                      ${
                        ticket.status === "Não iniciada"
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
        ) : (showOnlyDeleted && trashedTickets.length === 0) ||
          (!showOnlyDeleted && filteredTickets.length === 0) ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <IoTicketOutline className="w-16 h-16 mb-4 text-white" />
            <p className="text-lg font-medium text-white">
              {t("messages.noTicketsFound")}
            </p>
          </div>
        ) : null}
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
                      {loadingEdit ? t("buttons.saving") : t("buttons.save")}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={loadingEdit}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <MdCancel className="w-3.5 h-3.5" />
                      {t("buttons.cancel")}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <MdEdit className="w-3.5 h-3.5" />
                    {t("buttons.edit")}
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  if (selectedTicket.deleted_at) {
                    handleRestore(selectedTicket.id);
                  } else {
                    setTicketToDelete(selectedTicket.id);
                    setIsDeleteModalVisible(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                  selectedTicket.deleted_at
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {selectedTicket.deleted_at ? (
                  <>
                    <MdRestore className="w-3.5 h-3.5" />
                    {t("buttons.restore")}
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-3.5 h-3.5" />
                    {t("buttons.delete")}
                  </>
                )}
              </button>

              {selectedTicket?.deleted_at && daysLeft !== null && (
                <p
                  className={`mt-1 text-sm ${
                    daysLeft <= 5 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {t("messages.expiresInDays", { days: daysLeft })}
                </p>
              )}
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
                            <option value="">
                              {t("placeholders.selectClient")}
                            </option>
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
                            <option value="">
                              {t("placeholders.selectOperator")}
                            </option>
                            {rawAdmins.map((admin) => (
                              <option
                                key={admin.id}
                                value={admin.nome_completo}
                              >
                                {admin.nome_completo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>
                          <strong>{t("ticket.name")}:</strong>{" "}
                          {selectedTicket.name}
                        </p>
                        <p>
                          <strong>{t("ticket.type")}:</strong>{" "}
                          {selectedTicket.type}
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
                            if (
                              e.key === "Enter" &&
                              editTagInputValue.trim() !== ""
                            ) {
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

                <div className="bg-white p-4 rounded-xl shadow-md flex flex-col w-full gap-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600 mb-4">
                    <FaFileAlt /> {t("send_invoice.title")}
                  </h3>

                  {selectedTicket.file_url ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FaFileAlt className="w-6 h-6 text-blue-600" />
                            <div>
                              <p className="text-sm font-semibold text-blue-900">
                                {t("send_invoice.saved")}
                              </p>
                              <p className="text-xs text-blue-600 break-all">
                                {selectedTicket.file_url
                                  .split("/")
                                  .pop()
                                  ?.replace(/_\d+\./, ".")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={selectedTicket.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                            >
                              <FaEye className="w-3 h-3" />{" "}
                              {t("send_invoice.view")}
                            </a>
                            <button
                              onClick={() =>
                                handleRemoveBoleto(selectedTicket.id)
                              }
                              disabled={loadingRemoveBoleto}
                              className="px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingRemoveBoleto ? (
                                <Spin />
                              ) : (
                                <>
                                  <FiTrash2 className="w-3 h-3" />{" "}
                                  {t("send_invoice.remove")}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <label
                        onClick={handleFileClick}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-10 h-10 mb-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              {t("send_invoice.click_to_send")}
                            </span>{" "}
                            {t("send_invoice.or_drag_file")}
                          </p>
                          <p className="text-xs text-gray-400">
                            {t("send_invoice.file_hint")}
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={handleFileSelect}
                        />
                      </label>

                      {selectedFile && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FaFileAlt className="w-4 h-4 text-green-700" />
                              <div>
                                <p className="text-sm font-semibold text-green-700">
                                  {t("send_invoice.file_selected")}
                                </p>
                                <p className="text-xs text-green-600">
                                  {selectedFile.name}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedFile(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                              className="text-green-700 hover:text-green-900"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-center w-full gap-3">
                    {!selectedTicket.file_url && (
                      <button
                        onClick={() => handleSaveBoleto(selectedTicket)}
                        disabled={!selectedFile || loadingSaveBoleto}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingSaveBoleto ? (
                          <>
                            <Spin />
                            {t("send_invoice.saving")}
                          </>
                        ) : (
                          <>
                            {t("send_invoice.save")}
                            <FaSave className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setOpenModalSendBoleto(true);
                      }}
                      disabled={!selectedTicket.file_url || loadingSendBoleto}
                      className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingSendBoleto ? (
                        <>
                          <Spin />
                          {t("send_invoice.sending")}
                        </>
                      ) : (
                        <>
                          {t("send_invoice.send")}
                          <IoSend className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
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
        title={t("boleto_message.add_title")}
        isVisible={openModalSendBoleto}
        onClose={() => setOpenModalSendBoleto(false)}
      >
        <div className="bg-white rounded-xl shadow-2xl w-full w-full transform transition-all">
          <div className="p-6 flex flex-col space-y-5">
            <div>
              <label
                htmlFor="message-input"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t("boleto.body_label")}
              </label>
              <textarea
                id="message-input"
                placeholder="Digite o texto que acompanhará o boleto..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none shadow-sm text-sm"
              />
            </div>

            <p className="text-xs text-gray-400 text-center">
              {t("boleto.body_description")}
            </p>
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={() => handleSendBoleto(selectedTicket)}
              disabled={isSending}
              className={`w-full py-3 rounded-lg text-lg font-semibold transition duration-200 ease-in-out shadow-lg 
              ${
                isSending
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              }`}
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("boleto.preparing")}
                </span>
              ) : (
                t("boleto.confirm")
              )}
            </button>
          </div>
        </div>
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
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
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
      <DeleteConfirmModal
        isVisible={isDeleteModalVisible}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalVisible(false);
            setTicketToDelete(null);
          }
        }}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
};

export default Ticket;
