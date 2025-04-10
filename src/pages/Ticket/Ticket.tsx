import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
// import { useTranslation } from "react-i18next";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import './ticket.css';

interface Ticket {
  id: number;
  name: string;
  type: string;
  status: string;
  tags: string[] | string;
  client: {
    name: string;
  };
  user: {
    name: string;
  };
  message: string;
  observation: string;
  created_at: string;
}

const Ticket = () => {
  // const { t } = useTranslation();
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data } = await api.get<Ticket[]>("/tickets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      const parsed = data.map((ticket) => ({
        ...ticket,
        tags: typeof ticket.tags === "string" ? JSON.parse(ticket.tags) : ticket.tags
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
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card" onClick={() => handleCardClick(ticket)}>
            <div className="ticket-header-no-avatar">
              <div>
                <p className="ticket-user">{ticket.user?.name}</p>
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
        ))}
      </div>

      <Modal
  title={selectedTicket ? `Ticket: ${selectedTicket.name}` : ""}
  isVisible={showModal}
  onClose={() => setShowModal(false)}
>
  {selectedTicket && (
    <div className="flex flex-col gap-2">
      <p><strong>Nome:</strong> {selectedTicket.name}</p>
      <p><strong>Tipo:</strong> {selectedTicket.type}</p>
      <p><strong>Status:</strong> {selectedTicket.status}</p>
      <p><strong>Cliente:</strong> {selectedTicket.client?.name}</p>
      <p><strong>Operador:</strong> {selectedTicket.user?.name}</p>
      <p><strong>Tags:</strong> {
        Array.isArray(selectedTicket.tags)
          ? selectedTicket.tags.join(", ")
          : JSON.parse(selectedTicket.tags).join(", ")
      }</p>
      <p><strong>Observações:</strong> {selectedTicket.observation || "Sem observações"}</p>

      {/* Histórico de modificações */}
      {selectedTicket.histories && selectedTicket.histories.length > 0 && (
        <div className="ticket-history mt-4">
          <h4><strong>Histórico de Modificações:</strong></h4>
          <div className="history-list">
            {selectedTicket.histories.map((item, index) => (
              <div key={index} className="history-item border-t pt-2 mt-2">
                <p>
                  <strong>{item.field_modified}:</strong> de <em>"{item.old_value}"</em> para <em>"{item.new_value}"</em>
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(item.created_at).toLocaleString()} 
                  {item.user?.name && ` por ${item.user.name}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )}
</Modal>


    </div>
  );
};

export default Ticket;
