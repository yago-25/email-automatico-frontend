import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import "./ticket.css";
import { FaCalendarAlt, FaClipboardList, FaHistory, FaRegStickyNote, FaTags, FaUser } from "react-icons/fa";

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

const Ticket = () => {
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [history, setHistory] = useState<TicketHistory[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data } = await api.get<Ticket[]>("/tickets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const parsed = data.map((ticket) => ({
        ...ticket,
        tags:
          typeof ticket.tags === "string"
            ? JSON.parse(ticket.tags)
            : ticket.tags,
      }));

      setTickets(parsed);
    };

    fetchTickets();
  }, []);

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

  return (
    <div>
      <Header name={authUser?.nome_completo} />

      <div className="ticket-container">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-card"
              onClick={() => handleCardClick(ticket)}
            >
              <div className="ticket-header-no-avatar">
                <div>
                  <p className="ticket-user">{ticket.user?.nome_completo}</p>
                  <p className="ticket-time">{formatDate(ticket.created_at)}</p>
                  <p className="ticket-name">{ticket.name}</p>
                  <p className="ticket-observation line-clamp-3">
                    {ticket.observation || "Sem observações"}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-tickets">
            <p>Nenhum ticket encontrado</p>
          </div>
        )}
      </div>

      <Modal
        title={selectedTicket ? `📝 Ticket: ${selectedTicket.name}` : ""}
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className="flex flex-col gap-4 text-sm text-gray-800 max-h-[80vh] overflow-y-auto pr-1">
          <div className="bg-white p-4 rounded-xl shadow-md space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
              <FaClipboardList /> Detalhes do Ticket
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Nome:</strong> {selectedTicket?.name}
              </p>
              <p>
                <strong>Tipo:</strong> {selectedTicket?.type}
              </p>
              <p>
                <strong>Status:</strong> {selectedTicket?.status}
              </p>
              <p>
                <strong>Data de Criação:</strong>{" "}
                {formatDate(selectedTicket!.created_at)}
              </p>
              <p>
                <strong>Cliente:</strong> {selectedTicket?.client?.name}
              </p>
              <p>
                <strong>Operador:</strong>{" "}
                {selectedTicket?.user?.nome_completo}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
              <FaTags /> Tags
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {(Array.isArray(selectedTicket?.tags)
                ? selectedTicket.tags
                : JSON.parse(selectedTicket!.tags)
              ).map((tag: string, index: number) => (
                <span key={index} className={`ticket-tag color-${index % 6}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-yellow-600">
              <FaRegStickyNote /> Observações
            </h3>
            <p className="mt-2">
              {selectedTicket?.observation || "Sem observações"}
            </p>
          </div>

          {history.length > 0 && (
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
                        <>
                          definido como <em>"{item.new_value || "vazio"}"</em>
                        </>
                      ) : (
                        <>
                          de <em>"{item.old_value}"</em> para{" "}
                          <em>"{item.new_value}"</em>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaCalendarAlt />{" "}
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                    {item.user?.nome_completo && (
                      <p className="text-xs text-gray-600 italic flex items-center gap-1">
                        <FaUser /> Modificado por:{" "}
                        <strong>{item.user.nome_completo}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Ticket;
