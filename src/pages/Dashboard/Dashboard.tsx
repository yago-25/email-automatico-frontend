import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import "./dashboard.css";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";

interface Clients {
  id: number;
  name: string;
  phone: string;
  mail: string;
}

interface ButtonProps {
  text: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
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

const Dashboard = () => {
  const { t } = useTranslation();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [filteredTxt, setFilteredTxt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState<Clients[]>([]);
  const [addClient, setAddClient] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMail, setClientMail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
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

  const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };

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
      messageAlert({ type: "error", message: t("dashboard.fetch_error") });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    setLoadingPost(true);
    try {
      if (!clientName || !clientPhone || !clientMail) {
        messageAlert({ type: "error", message: t("dashboard.fill_all_fields") });
        return;
      }

      await api.post('/clients', { name: clientName, phone: clientPhone, mail: clientMail }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      messageAlert({ type: "success", message: t("dashboard.created_successfully") });
      setAddClient(false);
      setClientName('');
      setClientPhone('');
      setClientMail('');
    } catch(e) {
      console.log('Erro ao criar usuário: ', e);
      messageAlert({ type: "error", message: t("dashboard.create_error") });
    } finally {
      setLoadingPost(false);
    }
  };

  useEffect(() => {
    getClients();
  }, [loadingPost]);

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
          placeholder={t("dashboard.search_placeholder")}
          type="text"
          className="input-dash"
          onChange={(e) => { setFilteredTxt(e.target.value); setCurrentPage(1); }}
          value={filteredTxt}
        />
      </div>

      <div className="tb w-full max-w-3xl mt-8 rounded-2xl overflow-hidden shadow-lg">
        <div className="table grid grid-cols-4 gap-x-6 gap-y-3 items-center p-4 border-b hover:bg-gray-50">
          <p>ID</p>
          <p>{t("dashboard.name")}</p>
          <p>{t("dashboard.email")}</p>
          <p>{t("dashboard.phone")}</p>
        </div>
        {currentClients.map((client) => (
          <div key={client.id} className="table grid grid-cols-4 gap-x-6 gap-y-3 items-center p-4 border-b hover:bg-gray-50">
            <p className="whitespace-nowrap">{client.id}</p>
            <p className="truncate max-w-[180px]" title={client.name}>{client.name}</p>
            <p className="truncate max-w-[250px]" title={client.mail}>{client.mail}</p>
            <p className="truncate max-w-[150px]" title={client.phone}>{formatPhone(client.phone)}</p>
          </div>
        ))}
      </div>

      <div className="pagination flex justify-center items-center gap-4 mt-6 text-white">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed">
          <MdArrowBackIos />
        </button>
        <span className="font-semibold">{currentPage} {t("dashboard.of")} {totalPages}</span>
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed">
          <MdArrowForwardIos />
        </button>
      </div>

      <div className="flex gap-5 mt-24">
        <Button text={t("dashboard.add_client")} onClick={() => setAddClient(true)} />
        <Button text={t("dashboard.add_ticket")} onClick={() => alert('add ticket')} />
      </div>

      <Modal title={t("dashboard.add_client")} isVisible={addClient} onClose={() => setAddClient(false)}>
        {loadingPost ? (
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <Spin />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <div>
              <p>{t("dashboard.name")}</p>
              <Input text={t("dashboard.name")}
                     type="text"
                     required
                     onChange={(e) => setClientName(e.target.value)}
                     value={clientName} />
            </div>
            <div>
              <p>{t("dashboard.phone")}</p>
              <Input text={t("dashboard.phone")}
                     type="text"
                     required
                     onChange={(e) => setClientPhone(e.target.value)}
                     value={clientPhone} />
            </div>
            <div>
              <p>{t("dashboard.email")}</p>
              <Input text={t("dashboard.email")}
                     type="email"
                     required
                     onChange={(e) => setClientMail(e.target.value)}
                     value={clientMail} />
            </div>
            <Button text={t("dashboard.register_client")}
                    onClick={handleAddClient} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
