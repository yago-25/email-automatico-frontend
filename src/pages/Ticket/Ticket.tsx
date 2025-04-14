import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Modal from "../../components/Modal/Modal";
import { User } from "../../models/User";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import useSwr from "swr";
import { FaFilter } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
// import { useSwre } from "../../api/useSwr";
import TagInput from "../../components/TagInput/TagInput";
import { useTranslation } from "react-i18next";
import { IoMdAddCircleOutline } from "react-icons/io";


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
  cpf: string;
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

const Ticket = () => {

  const { id } = useParams<{ id: string }>();

  const { data: rawTickets = [], isLoading } = useSwr<Ticket[]>('/tickets', {

    fetcher: (url) => api.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then((res) => res.data),

  });

  useEffect(() => {
    if (id && rawTickets.length > 0) {
      const found = rawTickets.find((ticket) => ticket.id === Number(id));
      if (found) {
        setSelectedTicket(found);
        setShowModal(true);
        fetchHistory(found.id);
      }
    }
  }, [id, rawTickets]);

  const allTags = Array.from(
    new Set(
      rawTickets.flatMap((ticket) =>
        Array.isArray(ticket.tags) ? ticket.tags : [ticket.tags]
      )
    )
  );

  const statusTickets = [
    { name: "not_started", title: "Não iniciada" },
    { name: "waiting", title: "Esperando" },
    { name: "in_progress", title: "Em progresso" },
    { name: "discarded", title: "Descartada" },
    { name: "finished", title: "Completa" },
  ];

  const { data: rawClients = [], isLoading: loadingClients } = useSwr<Clients[]>('/clients');
  const { data: rawAdmins = [], isLoading: loadingAdmins } = useSwr<Admins[]>('/admins');

  const optionsClient: Option[] = rawClients.map((client: Clients) => ({
    value: String(client.id),
    label: client.name,
  }));

  const optionsAdmin: Option[] = rawAdmins.map((admin: Admins) => ({
    value: String(admin.id),
    label: admin.nome_completo
  }));

  const handleSelectChange = (value: string | number) => {
    setSelected(value.toString());
  };

  const handleSelectChangeAdmin = (value: string | number) => {
    setSelectedAdmin(value.toString());
  };

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const { t } = useTranslation();

  // const [filteredTxt, setFilteredTxt] = useState("");
  // const [currentPage, setCurrentPage] = useState(1);
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
  // const [clientPhone, setClientPhone] = useState("");
  // const [clientMail, setClientMail] = useState("");
  const [statusTicket, setStatusTicket] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [observation, setObservation] = useState("");
  // const itemsPerPage = 5;

  // const filteredClients = clients.filter(
  //   (client: Clients) =>
  //     client.name.toLowerCase().includes(filteredTxt.toLowerCase()) ||
  //     client.mail.toLowerCase().includes(filteredTxt.toLowerCase())
  // );
  // const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const currentClients = filteredClients.slice(
  //   startIndex,
  //   startIndex + itemsPerPage
  // );

  // const goToPage = (page: number) => {
  //   if (page >= 1 && page <= totalPages) {
  //     setCurrentPage(page);
  //   }
  // };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Hoje";
    if (isSameDay(date, yesterday)) return "Ontem";

    return date.toLocaleDateString();
  };

  const handleCardClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
    fetchHistory(ticket.id);
  };

  const fetchHistory = async (ticketId: number) => {
    const { data } = await api.get(`/tickets/${ticketId}/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    setHistory(data);
  };

  const handleChangeStatus = async (newStatus: string) => {
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

      setSelectedTicket({
        ...data,
        tags:
          typeof data.tags === "string" ? JSON.parse(data.tags) : data.tags,
      });

      messageAlert({
        type: "success",
        message: "Status atualizado com sucesso!",
      });
      setShowModal(false);
    } catch (error) {
      messageAlert({
        type: "error",
        message: "Erro ao atualizar status",
      });
      console.log(error, 'error');
    }
  };

  useEffect(() => {
    setFilteredTickets(rawTickets);
  }, [rawTickets]);

  const handleFilterToggle = () => {
    setShowModalFilter(true);
  };

  const handleFilterChange = () => {
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


  const allUsers = Array.from(
    new Map(
      rawTickets
        .filter((ticket) => ticket.user)
        .map((ticket) => [ticket.user.id, ticket.user])
    ).values()
  );

  const allClients = Array.from(
    new Map(
      rawTickets
        .filter((ticket) => ticket.client)
        .map((ticket) => [ticket.client.name, ticket.client])
    ).values()
  );

  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterTag('');
    setFilterDate('');
    setFilterTicket('');
    setFilteredTickets(rawTickets);
  };

  const optionsTicket: Option[] = rawTickets.map((ticket) => ({
    value: String(ticket.id),
    label: ticket.name,
  }));

  if (loadingClients || loadingAdmins) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spin />
      </div>
    );
  }

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

  return (
    <div>
      <Header name={authUser?.nome_completo} />

      <div className="filter-button-container flex items-center gap-4 mb-4">
        <button
          onClick={handleFilterToggle}
          className="flex items-center gap-2 p-2 bg-blue-600 text-white rounded-lg"
        >
          <FaFilter /> Filtro
        </button>

        <button
          onClick={() => setAddTicket(true)}
          className="flex items-center gap-2 p-2 bg-blue-600 text-white rounded-lg"
        >
          <IoMdAddCircleOutline /> {t("dashboard.add_ticket")}
        </button>
      </div>

      <Modal
        title="📝 Filtros"
        isVisible={showModalFilter}
        onClose={() => setShowModalFilter(false)}
      >
        <div className="bg-white p-6 shadow-lg rounded-xl mt-2 max-w-md mx-auto">
          <h3 className="font-semibold text-xl text-blue-600 mb-4">Filtros</h3>

          {/* Filtro de Usuarios */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Todos</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nome_completo}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Clientes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Todos</option>
              {allClients.map((client) => (
                <option key={client.name} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Status */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Todos</option>
              <option value="Aberto">Aberto</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Resolvido">Resolvido</option>
              <option value="Fechado">Fechado</option>
            </select>
          </div>

          {/* Filtro de Tags */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Todas</option>
              {allTags.map((tag, index) => (
                <option key={index} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Data */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Criação</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Filtro de Ticket Específico */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ticket</label>
            <select
              value={filterTicket}
              onChange={(e) => setFilterTicket(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Todos</option>
              {optionsTicket.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ações */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => {
                handleFilterChange();
                setShowModalFilter(false);
              }}
              className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
            >
              Aplicar Filtro
            </button>
            <button
              onClick={handleClearFilters}
              className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </Modal>

      <div className="ticket-container">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-card"
              onClick={() => handleCardClick(ticket)}
            >
              <div className="ticket-header-no-avatar">
                <div>
                  <p className="ticket-user">{ticket.client?.name}</p>
                  <p className="ticket-time">{formatDate(ticket.created_at)}</p>
                  <p className="ticket-name">{ticket.name}</p>
                  <p className="ticket-observation line-clamp-3">
                    {ticket.observation || "Sem observações"}
                  </p>
                </div>
              </div>
              <div className="ticket-tags">
                {Array.isArray(ticket.tags) &&
                  ticket.tags.map((tag, index) => (
                    <span key={index} className={`ticket-tag color-${index % 6}`}>
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-tickets">
            <p>Nenhum ticket encontrado</p>
          </div>
        )}
      </div>


      {selectedTicket && (
        <Modal
          title={`📝 Ticket: ${selectedTicket.name}`}
          isVisible={showModal}
          onClose={() => setShowModal(false)}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <Spin />
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-sm text-gray-800 max-h-[80vh] overflow-y-auto pr-1">
              {/* Detalhes */}
              <div className="bg-white p-4 rounded-xl shadow-md space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                  <FaClipboardList /> Detalhes do Ticket
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Nome:</strong> {selectedTicket.name}</p>
                  <p><strong>Tipo:</strong> {selectedTicket.type}</p>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <strong>Status:</strong>
                    </label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleChangeStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="Aberto">Aberto</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Resolvido">Resolvido</option>
                      <option value="Fechado">Fechado</option>
                    </select>
                  </div>

                  <p><strong>Data de Criação:</strong> {formatDate(selectedTicket.created_at)}</p>
                  <p><strong>Cliente:</strong> {selectedTicket.client?.name}</p>
                  <p><strong>Operador:</strong> {selectedTicket.user?.nome_completo}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                  <FaTags /> Tags
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(Array.isArray(selectedTicket.tags)
                    ? selectedTicket.tags
                    : JSON.parse(selectedTicket.tags || "[]")
                  ).map((tag: string, index: number) => (
                    <span key={index} className={`ticket-tag color-${index % 6}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-600">
                  <FaRegStickyNote /> Observações
                </h3>
                <p className="mt-2">{selectedTicket.observation || "Sem observações"}</p>
              </div>

              {/* Histórico */}
              {Array.isArray(history) && history.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-600">
                    <FaHistory /> Histórico de Modificações
                  </h3>

                  <div className="space-y-3 mt-3">
                    {history.map((item, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-purple-400 pl-4 py-2 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                      >
                        <p>
                          <strong>{item.field_modified}:</strong>{" "}
                          {item.old_value === null || item.old_value === "" ? (
                            <>definido como <em>"{item.new_value || "vazio"}"</em></>
                          ) : (
                            <>de <em>"{item.old_value}"</em> para <em>"{item.new_value}"</em></>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FaCalendarAlt /> {new Date(item.created_at).toLocaleString()}
                        </p>
                        {item.user?.nome_completo && (
                          <p className="text-xs text-gray-600 italic flex items-center gap-1">
                            <FaUser /> Modificado por: <strong>{item.user.nome_completo}</strong>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
      <Modal
        title="📝 Adicionar Ticket"
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
                <FaClipboardList /> Detalhes do Ticket
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <Input
                    text="Nome"
                    type="text"
                    required
                    onChange={(e) => setClientName(e.target.value)}
                    value={clientName}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <Input
                    text="Tipo"
                    type="text"
                    required
                    onChange={(e) => setTypeName(e.target.value)}
                    value={typeName}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <strong>Status</strong>
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

            {/* Seleção de Cliente e Operador */}
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                <FaTags /> Cliente e Operador
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex flex-col w-full sm:w-1/2 mb-2">
                  <label className="text-sm font-medium text-gray-700">Cliente</label>
                  <Select
                    options={optionsClient}
                    value={selected}
                    onChange={handleSelectChange}
                    placeholder="Selecione o Cliente"
                    width="320px"
                  />
                </div>
                <div className="flex flex-col w-full sm:w-1/2 mb-2">
                  <label className="text-sm font-medium text-gray-700">Operador</label>
                  <Select
                    options={optionsAdmin}
                    value={selectedAdmin}
                    onChange={handleSelectChangeAdmin}
                    placeholder="Selecione o Operador"
                    width="320px"
                  />
                </div>
              </div>
            </div>

            {/* Tags e Observações */}
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-600">
                <FaRegStickyNote /> Tags e Observações
              </h3>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <TagInput tags={tags} setTags={setTags} placeholder="Adicione tags e pressione Enter" />
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <Input
                  text="Observação"
                  type="text"
                  onChange={(e) => setObservation(e.target.value)}
                  value={observation}
                />
              </div>
            </div>

            {/* Botão de Ação */}
            <div className="flex flex-col items-end justify-end w-full gap-4 mt-4">
              <Button text="Criar Ticket" onClick={handleAddTicket} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Ticket;
