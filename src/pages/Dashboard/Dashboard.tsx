import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import "./dashboard.css";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";

interface Clients {
  id: number;
  name: string;
  phone: string;
  mail: string;
}

const Dashboard = () => {
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [filteredTxt, setFilteredTxt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState<Clients[]>([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  const filteredClients = clients.filter(
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

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  if (loading) {
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
        <p>Martins Adviser</p>
        <input
          placeholder="Search database"
          type="text"
          name="text"
          className="input-dash"
          onChange={(e) => {
            setFilteredTxt(e.target.value);
            setCurrentPage(1);
          }}
          value={filteredTxt}
        />
      </div>
      <div className="tb w-full max-w-3xl mt-8 rounded-2xl overflow-hidden shadow-lg">
        <div className="table flex bg-blue-900 text-white font-semibold text-lg p-4">
          <p className="flex-1">ID</p>
          <p className="flex-1">Nome</p>
          <p className="flex-1">Email</p>
          <p className="flex-1">Telefone</p>
        </div>
        {currentClients.map((client) => (
          <div
            key={client.id}
            className="table flex items-center justify-between p-4 border-b hover:bg-gray-50"
          >
            <p className="flex-1">{client.id}</p>
            <p className="flex-1">{client.name}</p>
            <p className="flex-1">{client.mail}</p>
            <p className="flex-1">{client.phone}</p>
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
          {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <MdArrowForwardIos />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
