import { useEffect, useState } from "react";
import { Pencil, Trash, PlusCircle, XCircle } from "lucide-react";
import { messageAlert } from "../../utils/messageAlert";
import { useNavigate } from "react-router-dom";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";

interface Client {
  id: number;
  name: string;
  phone: string;
  mail: string;
}

const Clients = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState({ name: "", phone: "", mail: "" });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const getClients = async () => {
      setLoading(true);
      try {
        const response = await api.get("/clients", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        console.log(response)
        setClients(response.data);
      } catch (e) {
        console.log("Erro ao listar clientes: ", e);
        messageAlert({
          type: "error",
          message: "Erro ao listar clientes",
        });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      getClients();
    }, []);

  const handleAdd = async () => {
    if (!newClient.name || !newClient.phone || !newClient.mail) {
      return messageAlert("warning", "Preencha todos os campos");
    }

    setLoading(true);
    try {
      const response = await api.post('/clients', {
        name: newClient.name,
        phone: newClient.phone,
        mail: newClient.mail
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setClients([...clients, response.data.client]);
      setNewClient({ name: "", phone: "", mail: "" });
      messageAlert("success", "Cliente adicionado com sucesso");
    } catch (error) {
      messageAlert("error", "Erro ao adicionar cliente");
    } finally {
      setLoading(false);
    }
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

  const handleEdit = async () => {
    if (!editingClient) return;

    setLoading(true);
    try {
      await api.put(`/clients/${editingClient.id}`, editingClient);
      setClients(
        clients.map((c) => (c.id === editingClient.id ? editingClient : c))
      );
      messageAlert("success", "Cliente editado com sucesso");
      setIsModalOpen(false);
    } catch (error) {
      messageAlert("error", "Erro ao editar cliente");
    } finally {
      setLoading(false);
    }
  };
if (loading){
  return <Spin/>
}
  return (
    <div className="p-6 relative">
     

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome"
          className="border p-2 rounded w-1/4"
          value={newClient.name}
          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Telefone"
          className="border p-2 rounded w-1/4"
          value={newClient.phone}
          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
        />
        <input
          type="email"
          placeholder="E-mail"
          className="border p-2 rounded w-1/4"
          value={newClient.mail}
          onChange={(e) => setNewClient({ ...newClient, mail: e.target.value })}
        />
        <button
          onClick={handleAdd}
          className="bg-green-500 text-white p-2 rounded flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" /> Adicionar
        </button>
      </div>

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

      {isModalOpen && editingClient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Editar Cliente</h2>
            <input
              type="text"
              className="border p-2 w-full mb-2"
              value={editingClient.nome}
              onChange={(e) =>
                setEditingClient({ ...editingClient, nome: e.target.value })
              }
            />
            <input
              type="text"
              className="border p-2 w-full mb-2"
              value={editingClient.telefone}
              onChange={(e) =>
                setEditingClient({ ...editingClient, telefone: e.target.value })
              }
            />
            <input
              type="email"
              className="border p-2 w-full mb-2"
              value={editingClient.email}
              onChange={(e) =>
                setEditingClient({ ...editingClient, email: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded flex items-center"
              >
                <XCircle className="h-5 w-5 mr-2" /> Cancelar
              </button>
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
