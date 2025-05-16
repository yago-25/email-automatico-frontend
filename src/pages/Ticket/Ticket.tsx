import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Modal from "../../components/Modal/Modal";
import { User } from "../../models/User";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import useSwr from "swr";
import { FaFilter, FaEraser } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
// import { useSwre } from "../../api/useSwr";
import TagInput from "../../components/TagInput/TagInput";
import { useTranslation } from "react-i18next";
import { IoTicketOutline } from "react-icons/io5";

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

  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const statusTickets = [
    { name: "Não iniciada", title: t("tickets.types.not_started") },
    { name: "Esperando", title: t("tickets.types.waiting") },
    { name: "Em progresso", title: t("tickets.types.in_progress") },
    { name: "Completa", title: t("tickets.types.completed") },
    { name: "Descartada", title: t("tickets.types.discarded") },
  ];

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalFilter, setShowModalFilter] = useState(false);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterTag, setFilterTag] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterTicket, setFilterTicket] = useState<string>("");
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [filterUser, setFilterUser] = useState('');
  const [filterClient, setFilterClient] = useState<string>("");
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
  const [showOnlyFinished, setShowOnlyFinished] = useState(false);
  // const [filteredTxt, setFilteredTxt] = useState("");

  const { data: rawClients = [], isLoading: loadingClients } = useSwr<Clients[]>('/clients', {
    fetcher: (url) =>
      api.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then((res) => res.data),
  });

  const { data: rawAdmins = [], isLoading: loadingAdmins } = useSwr<Admins[]>('/admins', {
    fetcher: (url) =>
      api.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then((res) => res.data),
  });

  const { data: rawTickets = [], isLoading, mutate } = useSwr<Ticket[]>('/tickets', {

    fetcher: (url) => api.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then((res) => res.data),

  });

  const allTags = Array.from(
    new Set(
      rawTickets.flatMap((ticket) =>
        Array.isArray(ticket.tags) ? ticket.tags : [ticket.tags]
      )
    )
  );

  const optionsClient: Option[] = rawClients.map((client: Clients) => ({
    value: String(client.id),
    label: client.name,
  }));

  const optionsAdmin: Option[] = rawAdmins.map((admin: Admins) => ({
    value: String(admin.id),
    label: admin.nome_completo
  }));

  const optionsTicket: Option[] = rawTickets.map((ticket) => ({
    value: String(ticket.id),
    label: ticket.name,
  }));

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
          status: data.status
        };
      });

      await fetchHistory(selectedTicket.id);

      setSelectedTicket({
        ...data,
        tags:
          typeof data.tags === "string" ? JSON.parse(data.tags) : data.tags,
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
      console.log(error, 'error');
    } finally {
      setLoadingModal(false);
    }
  };


  const handleFilterToggle = () => {
    mutate();
    setShowModalFilter(true);
  };

  const handleFilterChange = () => {

    mutate();

    const filtered = rawTickets.filter((ticket) => {
      const matchesStatus = filterStatus ? ticket.status === filterStatus : true;

      const matchesTag =
        filterTag
          ? Array.isArray(ticket.tags)
            ? ticket.tags.some((tag) =>
              tag.toLowerCase().includes(filterTag.toLowerCase())
            )
            : ticket.tags.toLowerCase().includes(filterTag.toLowerCase())
          : true;

      const matchesDate =
        filterDate ? new Date(ticket.created_at).toLocaleDateString() === new Date(filterDate).toLocaleDateString() : true;

      const matchesTicket =
        filterTicket ? String(ticket.id) === filterTicket : true;

      const matchesUser = filterUser ? ticket.user?.id === Number(filterUser) : true;

      const matchesClient =
        filterClient
          ? ticket.client?.name.toLowerCase().includes(filterClient.toLowerCase())
          : true;

      return (
        matchesStatus &&
        matchesTag &&
        matchesDate &&
        matchesTicket &&
        matchesUser &&
        matchesClient
      );
    });

    setFilteredTickets(filtered);
  };

  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterTag('');
    setFilterDate('');
    setFilterTicket('');
    setFilteredTickets(rawTickets);
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

      await api.post('/tickets', {
        name: clientName,
        type: typeName,
        tags: tags,
        client_id: selected,
        user_id: selectedAdmin,
        create_id: authUser?.id,
        status: statusTicket,
        observation: observation,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      mutate()

      messageAlert({
        type: "success",
        message: "Ticket cadastrado com sucesso!",
      });

      setStatusTicket('');
      setClientName('');
      setTypeName('');
      setSelected('');
      setSelectedAdmin('');
      setTags([]);
      setObservation('');
      setAddTicket(false);
    } catch (e) {
      console.log('Erro ao adicionar ticket: ', e);
      messageAlert({
        type: "error",
        message: "Erro ao adicionar ticket"
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

      const matchedTickets = rawTickets.filter(ticket => ticket.client.name === id);

      if (matchedTickets.length > 0) {
        setFilterClient(matchedTickets[0].client?.name || "");
        setSelectedTicket(matchedTickets[0]);
        fetchHistory(matchedTickets[0].id);
        setFilteredTickets(matchedTickets);
      }
    }
  }, [id, rawTickets]);

  if (!filteredTickets || isLoading || loadingAdmins || loadingClients) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spin />
      </div>
    );
  }

  const statusToShow = showOnlyFinished
    ? ["Completa"]
    : ["Em progresso", "Não iniciada", "Esperando", "Descartada"];

  return (
    <div>
      <Header name={authUser?.nome_completo} />

      <div className="filter-button-container flex items-center gap-4 mb-4 p-4">

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
          Limpar Filtro
        </button>

        <button
          onClick={() => setAddTicket(true)}
          className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg shadow-md hover:bg-purple-700 hover:shadow-lg transition-all duration-200"
        >
          <IoTicketOutline className="w-5 h-5" />
          {t("dashboard.add_ticket")}
        </button>

        <button
          onClick={() => setShowOnlyFinished(prev => !prev)}
          className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
        >
          {showOnlyFinished ? t("buttons.backToActive") : t("buttons.showFinished")}
        </button>



      </div>

      <div className="ticket-container">
        {isLoading ? (
          <div className="loading-message text-center text-gray-500 p-4">
            {t("messages.loadingTickets")}
          </div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets
            .filter(ticket => statusToShow.includes(ticket.status))
            .map((ticket) => (
              <div
                key={ticket.id}
                className="ticket-card"
                onClick={() => handleCardClick(ticket)}
              >
                <div className="ticket-header-no-avatar">
                  <div className="w-full h-full">
                    <p className="ticket-user overflow-hidden ellipsis">
                      {ticket.client?.name}
                    </p>
                    <p className="ticket-time">{formatDate(ticket.created_at, t)}</p>
                    <p className="ticket-name overflow-hidden text-ellipsis whitespace-nowrap">
                      {ticket.name}
                    </p>
                    <p className="ticket-observation text-ellipsis overflow-hidden whitespace-nowrap max-h-12">
                      {ticket.observation || t("ticket.no_observation")}
                    </p>
                  </div>
                </div>
                <div className="ticket-tags">
                  {Array.isArray(ticket.tags) &&
                    ticket.tags.map((tag, index) => (
                      <span key={index} className={`ticket-tag color-0`}>
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            ))
        ) : (
          <div className="no-tickets">
            <p>{t("messages.noTicketsFound")}</p>
          </div>
        )}
      </div>

      <Modal
        title={t('filters.title')}
        isVisible={showModalFilter}
        onClose={() => {
          setShowModalFilter(false);
          mutate(undefined, true);
        }}
      >
        <div className="bg-white p-6 shadow-lg rounded-xl mt-2 max-w-md mx-auto">
          {/* <h3 className="font-semibold text-xl text-blue-600 mb-4">{t('filters.title')}</h3> */}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('filters.user')}</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">{t('filters.all')}</option>
              {rawAdmins.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nome_completo}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('filters.client')}</label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">{t('filters.all')}</option>
              {rawClients.map((client) => (
                <option key={client.name} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('filters.status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">{t('filters.all')}</option>
              <option value="Não iniciada">{t('status.not_started')}</option>
              <option value="Esperando">{t('status.waiting')}</option>
              <option value="Em progresso">{t('status.in_progress')}</option>
              <option value="Completa">{t('status.resolved')}</option>
              <option value="Descartada">{t('status.discarded')}</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('filters.tag')}</label>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">{t('filters.all')}</option>
              {allTags.map((tag, index) => (
                <option key={index} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('filters.date')}</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('filters.ticket')}</label>
            <select
              value={filterTicket}
              onChange={(e) => setFilterTicket(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">{t('filters.all')}</option>
              {optionsTicket.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => {
                handleFilterChange();
                setShowModalFilter(false);
              }}
              className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
            >
              {t('filters.apply')}
            </button>
            <button
              onClick={handleClearFilters}
              className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
            >
              {t('filters.clear')}
            </button>
          </div>
        </div>
      </Modal>

      {selectedTicket && (
        <Modal
          title={t('ticket.title', { name: selectedTicket.name })}
          isVisible={showModal}
          onClose={() => setShowModal(false)}
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
                    <FaClipboardList /> {t('ticket.details_title')}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <p><strong>{t('ticket.name')}:</strong> {selectedTicket.name}</p>
                    <p><strong>{t('ticket.type')}:</strong> {selectedTicket.type}</p>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <strong>{t('ticket.status')}:</strong>
                      </label>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleChangeStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="Não iniciada">{t('status.open')}</option>
                        <option value="Esperando">{t('status.waiting')}</option>
                        <option value="Em progresso">{t('status.in_progress')}</option>
                        <option value="Completa">{t('status.resolved')}</option>
                        <option value="Descartada">{t('status.closed')}</option>
                      </select>
                    </div>

                    <p><strong>{t('ticket.creation_date')}:</strong> {formatDate(selectedTicket.created_at, t)}</p>
                    <p><strong>{t('ticket.client')}:</strong> {selectedTicket.client?.name}</p>
                    <p><strong>{t('ticket.operator')}:</strong> {selectedTicket.user?.nome_completo}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                    <FaTags /> {t('ticket.tags_title')}
                  </h3>
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
                </div>

                <div className="bg-white p-4 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-600">
                    <FaRegStickyNote /> {t('ticket.notes_title')}
                  </h3>
                  <p className="mt-2">{selectedTicket.observation || t('ticket.no_notes')}</p>
                </div>


                {Array.isArray(history) && history.length > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-600">
                      <FaHistory /> {t('ticket.history_title')}
                    </h3>

                    <div className="space-y-3 mt-3">
                      {history.map((item, index) => {
                        const isStatus = item.field_modified === "status";

                        const values = [
                          { name: 'not_started', translate: 'Não iniciada' },
                          { name: 'waiting', translate: 'Esperando' },
                          { name: 'in_progress', translate: 'Em progresso' },
                          { name: 'completed', translate: 'Completa' },
                          { name: 'discarded', translate: 'Descartada' },
                        ];

                        const getTranslatedStatus = (value: any) => {
                          return values.find((v) => v.translate.toLowerCase() === value?.toLowerCase())?.name;
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
                              <strong>{t(`fields.${item.field_modified}`, item.field_modified)}:</strong>{" "}
                              {isTicketCreated ? (
                                <>{t('ticket.created')}</>
                              ) : isCreated ? (
                                <>{t('ticket.created')}</>
                              ) : item.old_value === null || item.old_value === "" ? (
                                <>
                                  {t('ticket.changed.set_to')} <em>"{t(`status.${newValue}`)}"</em>
                                </>
                              ) : (
                                <>
                                  {t('ticket.changed.from')} <em>"{t(`status.${oldValue}`)}"</em> {t('ticket.changed.to')} <em>"{t(`status.${newValue}`)}"</em>
                                </>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FaCalendarAlt /> {new Date(item.created_at).toLocaleString()}
                            </p>
                            {item.user?.nome_completo && (
                              <p className="text-xs text-gray-600 italic flex items-center gap-1">
                                <FaUser /> {t('ticket.modified_by')}: <strong>{item.user.nome_completo}</strong>
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
        title={`📝 ${t('modal.add_ticket')}`}
        isVisible={addTicket}
        onClose={() => setAddTicket(false)}
      >
        {loadingPost ? (
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <Spin />
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-sm text-gray-800 max-h-[80vh] overflow-y-auto pr-1">
            {/* Detalhes do Ticket */}
            <div className="bg-white p-4 rounded-xl shadow-md space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                <FaClipboardList /> {t('modal.ticket_details')}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">{t('modal.name')}</label>
                  <Input
                    text={t('modal.name')}
                    type="text"
                    required
                    onChange={(e) => setClientName(e.target.value)}
                    value={clientName}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">{t('modal.type')}</label>
                  <Input
                    text={t('modal.type')}
                    type="text"
                    required
                    onChange={(e) => setTypeName(e.target.value)}
                    value={typeName}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <strong>{t('modal.status')}</strong>
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
                            setStatusTicket((e.target as HTMLInputElement).value)
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
                <FaTags /> {t('modal.client_operator')}
              </h3>
              <div className="flex gap-5 mt-2">
                <div className="flex flex-col w-full sm:w-1/2 mb-2">
                  <label className="text-sm font-medium text-gray-700">{t('modal.client')}</label>
                  <Select
                    options={optionsClient}
                    value={selected}
                    onChange={handleSelectChange}
                    placeholder={t('modal.select_client')}
                  />
                </div>
                <div className="flex flex-col w-full sm:w-1/2 mb-2">
                  <label className="text-sm font-medium text-gray-700">{t('modal.operator')}</label>
                  <Select
                    options={optionsAdmin}
                    value={selectedAdmin}
                    onChange={handleSelectChangeAdmin}
                    placeholder={t('modal.select_operator')}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-600">
                <FaRegStickyNote /> {t('modal.tags_notes')}
              </h3>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700">{t('modal.tags')}</label>
                <TagInput tags={tags} setTags={setTags} placeholder={t('modal.add_tags')} />
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700">{t('modal.notes')}</label>
                <Input
                  text={t('modal.notes')}
                  type="text"
                  onChange={(e) => setObservation(e.target.value)}
                  value={observation}
                />
              </div>
            </div>

            <div className="flex flex-col items-end justify-end w-full gap-4 mt-4">
              <Button text={t('modal.create_ticket')} onClick={handleAddTicket} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Ticket;
