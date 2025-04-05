import { useEffect, useState } from "react";
import { Pencil, Trash, PlusCircle } from "lucide-react";
import { messageAlert } from "../../utils/messageAlert";
import { useNavigate } from "react-router-dom";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

interface Client {
  id: number;
  name: string;
  phone: string;
  mail: string;
}

const Clients = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientMail, setClientMail] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [addClient, setAddClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);



  const getClients = async () => {
    setLoading(true);
    try {
      const response = await api.get("/clients", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setClients(response.data);
    } catch (e) {
      messageAlert({ type: "error", message: "Erro ao listar clientes" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  const handleEdit = async () => {
    if (!editingClient) return;

    setLoading(true);
    try {
      const response = await api.put(`/clients/${editingClient.id}`, {
        name: editingClient.name,
        phone: editingClient.phone,
        mail: editingClient.mail,
      });

      // Atualiza a lista de clientes com os novos dados
      setClients(
        clients.map((client) =>
          client.id === editingClient.id ? response.data.client : client
        )
      );

      messageAlert("success", "Cliente editado com sucesso");
      setIsModalOpen(false);
    } catch (error) {
      messageAlert("error", "Erro ao editar cliente");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setClientName(client.name);
    setClientPhone(client.phone);
    setClientMail(client.mail);
    setAddClient(true);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter((client) => client.id !== id));
      messageAlert("success", "Cliente excluído com sucesso");
    } catch (error) {
      messageAlert("error", "Erro ao excluir cliente");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="p-6 relative">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Telefone</th>
              <th className="px-4 py-2 border">E-mail</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b text-center">
                <td className="px-4 py-2 border">{client.id}</td>
                <td className="px-4 py-2 border">{client.name}</td>
                <td className="px-4 py-2 border">{client.phone}</td>
                <td className="px-4 py-2 border">{client.mail}</td>
                <td className="px-4 py-2 border flex justify-center gap-3">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      setEditingClient(client);
                      setIsModalOpen(true);
                    }}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(client.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        width={500}
        title="Editar Cliente"
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col items-center justify-center w-full gap-4">
          <div>
            <p>Nome</p>
            <Input
              text="Nome"
              type="text"
              required
              value={editingClient?.name || ""}
              onChange={(e) =>
                setEditingClient({ ...editingClient!, name: e.target.value })
              }
            />
          </div>
          <div>
            <p>Telefone</p>
            <Input
              text="Telefone"
              type="text"
              required
              value={editingClient?.phone || ""}
              onChange={(e) =>
                setEditingClient({ ...editingClient!, phone: e.target.value })
              }
            />
          </div>
          <div>
            <p>Email</p>
            <Input
              text="Email"
              type="email"
              required
              value={editingClient?.mail || ""}
              onChange={(e) =>
                setEditingClient({ ...editingClient!, mail: e.target.value })
              }
            />
          </div>
          <Button text="Salvar" onClick={handleEdit} />
        </div>
      </Modal>

    </div>
  );
};

export default Clients;
