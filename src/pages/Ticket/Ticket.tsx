import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { useTranslation } from "react-i18next";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import './ticket.css';

interface Ticket {
  id: number;
  name: string;
  type: string;
  status: string;
  tags: string[] | string; // Pode vir como string da API
  client: {
    name: string;
  };
  user: {
    name: string;
  };
}

const Ticket = () => {
  const { t } = useTranslation();
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data } = await api.get<Ticket[]>("/tickets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      // Converte tags se necessário
      const parsed = data.map((ticket) => ({
        ...ticket,
        tags: typeof ticket.tags === "string" ? JSON.parse(ticket.tags) : ticket.tags
      }));

      setTickets(parsed);
    };

    fetchTickets();
  }, []);

  const handleCardClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  return (
    <div>
      <Header name={authUser?.nome_completo} />

      <div className="flex flex-wrap gap-4 p-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="card">
            <a className="card1" onClick={() => handleCardClick(ticket)}>
              <p><strong>{ticket.name}</strong></p>
              <p>{ticket.type}</p>
              <p className="small">{ticket.type} - {ticket.status}</p>
              <div className="go-corner">
                <div className="go-arrow">→</div>
              </div>
            </a>
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
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Ticket;
