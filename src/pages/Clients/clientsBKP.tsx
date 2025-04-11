import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import "./clients.css";
import { Pencil, Trash, PlusCircle, XCircle } from "lucide-react";
import { messageAlert } from "../../utils/messageAlert";
import { useNavigate } from "react-router-dom";
import Spin from "../../components/Spin/Spin";
import { api } from "../../api/api";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { User } from "../../models/User";
import { useTranslation } from "react-i18next";
import { MdOutlineFormatListNumbered } from "react-icons/md";
import { CiPhone } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import { FaGear } from "react-icons/fa6";
import { HiOutlineUser } from "react-icons/hi";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoTicketOutline } from "react-icons/io5";

interface Client {
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
    <button onClick={onClick} className="cursor-pointer w-44 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all group active:w-11 active:h-11 active:rounded-full active:duration-300 ease-in-out">
      <svg className="animate-spin hidden group-active:block mx-auto" width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* SVG Path... */}
      </svg>
      <span className="group-active:hidden">{text}</span>
    </button>
  );
};

const Clients = () => {
  const { t } = useTranslation(); 
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const [clients, setClients] = useState<Client[]>([]);
  const [addClient, setAddClient] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMail, setClientMail] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredTxt, setFilteredTxt] = useState("");
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPost, setLoadingPost] = useState(false);

  const formatPhone = (phone: string): string => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };

  const filteredClients = clients.filter(
    (client: Client) =>
      client.name.toLowerCase().includes(filteredTxt.toLowerCase()) ||
      client.mail.toLowerCase().includes(filteredTxt.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

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
        message: t("clients.fetch_error"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  useEffect(() => {
    getClients();
  }, [loadingPost]);

  const handleAddClient = async () => {
    setLoadingPost(true);
    try {
      if (!clientName || !clientPhone || !clientMail) {
        messageAlert({
          type: "error",
          message: t("clients.fill_all_fields")
        });
        return;
      }

      await api.post('/clients', {
        name: clientName,
        phone: clientPhone,
        mail: clientMail
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      messageAlert({
        type: "success",
        message: t("clients.created_successfully")
      });
      setAddClient(false);
      setClientName('');
      setClientPhone('');
      setClientMail('');
    } catch (e) {
      console.log('Erro ao criar usuário: ', e);
      messageAlert({
        type: "error",
        message: t("clients.create_error")
      });
    } finally {
      setLoadingPost(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/clients/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      setClients(clients.filter((client) => client.id !== id));
      messageAlert({
        type: "success",
        message: t("clients.deleted_successfully")
      });
    } catch (error) {
      messageAlert({
        type: "error",
        message: t("clients.delete_error")
      });
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = async () => {
    if (!editingClient) return;

    setLoading(true);
    try {
      await api.put(`/clients/${editingClient.id}`, editingClient, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setClients(clients.map((c) => (c.id === editingClient.id ? editingClient : c)));
      messageAlert({
        type: "success",
        message: t("clients.updated_successfully")
      });
      setIsModalOpen(false);
    } catch (error) {
      messageAlert({
        type: "error",
        message: t("clients.update_error")
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTicket = () => {
    navigate("/ticket");
  };

  if (loading) {
    return <Spin />;
  }
  return (
    <div className="body">
      <div className="container-dash">
        <Header name={authUser?.nome_completo} />

        <div className="title-dash">
          <input
            placeholder={t("clients.search_placeholder")}
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

        <div className="tbe w-full max-w-3xl mt-8 rounded-2xl overflow-hidden shadow-lg">
          <div className="tablee grid grid-cols-5 gap-x-6 items-center p-4 bg-blue-100 border-b font-medium text-blue-900">

            <p className="id-center"> <MdOutlineFormatListNumbered /> ID</p>
            <p className="id-center"> <HiOutlineUser /> {t("clients.name")}</p>
            <p className="id-center"> <CiMail /> {t("clients.email")}</p>
            <p className="id-center"> <CiPhone /> {t("clients.phone")}</p>
            <p className="text-centere"> <FaGear /> {t("clients.actions")}</p>
          </div>
          {currentClients.map((client) => (
            <div
              key={client.id}
              className="tablee grid grid-cols-5 gap-x-6 items-center p-4 bg-white border-b hover:bg-gray-50 text-sm"
            >
              <p className="id-center">{client.id}</p>
              <p className="id-center" title={client.name}>
                {client.name}
              </p>
              <p className="id-center" title={client.mail}>
                {client.mail}
              </p>
              <p className="id-center" title={client.phone}>
                {formatPhone(client.phone)}
              </p>
              <div className="flex justify-center gap-4">

                <button
                  onClick={handleTicket}
                  className="text-red-500 hover:text-red-700"
                >
                  <IoTicketOutline className="h-5 w-5" />
                </button>

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

              </div>
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
            {currentPage} {t("clients.of")} {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <MdArrowForwardIos />
          </button>
        </div>

        <Modal
          title={t("clients.edit_client")}
          isVisible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <Spin />
            </div>
          ) : editingClient ? (
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <div>
                <p>{t("clients.name")}</p>
                <Input
                  text={t("clients.name")}
                  type="text"
                  required
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, name: e.target.value })
                  }
                  value={editingClient.name}
                />
              </div>
              <div>
                <p>{t("clients.phone")}</p>
                <Input
                  text={t("clients.phone")}
                  type="text"
                  required
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, phone: e.target.value })
                  }
                  value={editingClient.phone}
                />
              </div>
              <div>
                <p>{t("clients.email")}</p>
                <Input
                  text={t("clients.email")}
                  type="email"
                  required
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, mail: e.target.value })
                  }
                  value={editingClient.mail}
                />
              </div>
              <Button text={t("clients.save_changes")} onClick={handleEdit} />
            </div>
          ) : (
            <div className="text-center">{t("clients.load_error")}</div>
          )}
        </Modal>

        <div className="flex gap-5" style={{ marginTop: "95px" }}>
          <Button
            text={
              <span className="inline-flex items-center justify-center gap-2 relative top-[2px]">
                <IoMdAddCircleOutline className="w-5 h-5" />
                {t("clients.add_client")}
              </span>
            }
            onClick={() => setAddClient(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-2xl shadow-md transition duration-200"
          />
        </div>

        <Modal
          title={t("clients.add_client")}
          isVisible={addClient}
          onClose={() => setAddClient(false)}
        >
          {loadingPost ? (
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <Spin />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <div>
                <p>{t("clients.name")}</p>
                <Input
                  text={t("clients.name")}
                  type="text"
                  required
                  onChange={(e) => setClientName(e.target.value)}
                  value={clientName}
                />
              </div>
              <div>
                <p>{t("clients.phone")}</p>
                <Input
                  text={t("clients.phone")}
                  type="text"
                  required
                  onChange={(e) => setClientPhone(e.target.value)}
                  value={clientPhone}
                />
              </div>
              <div>
                <p>{t("clients.email")}</p>
                <Input
                  text={t("clients.email")}
                  type="email"
                  required
                  onChange={(e) => setClientMail(e.target.value)}
                  value={clientMail}
                />
              </div>
              <Button text={t("clients.register_client")} onClick={handleAddClient} />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Clients;