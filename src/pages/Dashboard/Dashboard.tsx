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
import Select from "../../components/Select/Select";
import { useSwr } from "../../api/useSwr";
import TagInput from "../../components/TagInput/TagInput";
import { MdOutlineFormatListNumbered } from "react-icons/md";
import { CiPhone } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import { FaGear } from "react-icons/fa6";
import { HiOutlineUser } from "react-icons/hi";
import { IoTicketOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

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
  const { data: rawClients = [], loading: loadingClients } = useSwr<Clients[]>('/clients');
  const { data: rawAdmins = [], loading: loadingAdmins } = useSwr<Admins[]>('/admins');

  const optionsClient: Option[] = rawClients.map((client: Clients) => ({
    value: String(client.id),
    label: client.name,
  }));

  const optionsAdmin: Option[] = rawAdmins.map((admin: Admins) => ({
    value: String(admin.id),
    label: admin.nome_completo
  }));

  const statusTickets = [
    { name: "not_started", title: "Não iniciada" },
    { name: "waiting", title: "Esperando" },
    { name: "in_progress", title: "Em progresso" },
    { name: "discarded", title: "Descartada" },
    { name: "finished", title: "Completa" },
  ];

  const { t } = useTranslation();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const navigate = useNavigate();
  const [filteredTxt, setFilteredTxt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState<Clients[]>([]);
  const [addClient, setAddClient] = useState(false);
  const [addTicket, setAddTicket] = useState(false);
  const [clientName, setClientName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientMail, setClientMail] = useState("");
  const [statusTicket, setStatusTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [observation, setObservation] = useState("");
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

  const handleSelectChange = (value: string | number) => {
    setSelected(value.toString());
  };

  const handleSelectChangeAdmin = (value: string | number) => {
    setSelectedAdmin(value.toString());
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
    } catch (e) {
      console.log('Erro ao criar usuário: ', e);
      messageAlert({ type: "error", message: t("dashboard.create_error") });
    } finally {
      setLoadingPost(false);
    }
  };

  console.log("authUser:", authUser);
  console.log("authUser.id:", authUser?.id);

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


  useEffect(() => {
    getClients();
  }, [loadingPost]);

  const handleTicket = () => {
    navigate("/ticket");
  };

  if (loading || loadingClients || loadingAdmins) {
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
            <div className="flex justify-end gap-4">

              <button
                onClick={handleTicket}
                className="text-red-500 hover:text-red-700"
              >
                <IoTicketOutline className="h-5 w-5" />
              </button>

            </div>
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

      <div className="flex gap-5 mt-56">
        <Button text={t("dashboard.add_client")} onClick={() => setAddClient(true)} />
        <Button text={t("dashboard.add_ticket")} onClick={() => setAddTicket(true)} />
      </div>

      <Modal title={t("dashboard.add_client")} isVisible={addClient} onClose={() => setAddClient(false)}>
        {loadingPost ? (
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <Spin />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <div className="w-full">
              <p>{t("dashboard.name")}</p>
              <Input text={t("dashboard.name")}
                type="text"
                required
                onChange={(e) => setClientName(e.target.value)}
                value={clientName}
              />
            </div>
            <div className="w-full">
              <p>{t("dashboard.phone")}</p>
              <Input text={t("dashboard.phone")}
                type="text"
                required
                onChange={(e) => setClientPhone(e.target.value)}
                value={clientPhone} />
            </div>
            <div className="w-full">
              <p>{t("dashboard.email")}</p>
              <Input text={t("dashboard.email")}
                type="email"
                required
                onChange={(e) => setClientMail(e.target.value)}
                value={clientMail} />
            </div>
            <Button text="Cadastrar Cliente" onClick={handleAddClient} />
          </div>
        )}
      </Modal>
      <Modal
        title="Adicionar Ticket"
        isVisible={addTicket}
        onClose={() => setAddTicket(false)}
      >
        {loadingPost ? (
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <Spin />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-4">
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
            <div className="flex items-center justify-between w-full gap-4 flex-wrap">
              <div className="flex flex-col flex-1 min-w-[200px] max-w-[calc(50%-0.5rem)] gap-2">
                <p>Nome</p>
                <Input
                  text="Nome"
                  type="text"
                  required
                  onChange={(e) => setClientName(e.target.value)}
                  value={clientName}
                />
              </div>
              <div className="flex flex-col flex-1 min-w-[200px] max-w-[calc(50%-0.5rem)] gap-2">
                <p>Tipo</p>
                <Input
                  text="Tipo"
                  type="text"
                  required
                  onChange={(e) => setTypeName(e.target.value)}
                  value={typeName}
                />
              </div>
            </div>
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex flex-col flex-1 min-w-[200px] max-w-[calc(50%-0.5rem)] gap-2">
                <p className="mt-4">Cliente</p>
                <Select
                  options={optionsClient}
                  value={selected}
                  onChange={handleSelectChange}
                  placeholder="Cliente"
                  width="320px"
                />
              </div>
              <div className="flex flex-col flex-1 min-w-[200px] max-w-[calc(50%-0.5rem)] gap-2">
                <p className="mt-4">Operador</p>
                <Select
                  options={optionsAdmin}
                  value={selectedAdmin}
                  onChange={handleSelectChangeAdmin}
                  placeholder="Status do ticket"
                  width="320px"
                />
              </div>
            </div>
            <div className="flex flex-col items-start justify-start w-full gap-4">
              <p className="mt-4">Tags</p>
              <TagInput tags={tags} setTags={setTags} placeholder="Adicione tags e pressione Enter" />
            </div>
            <div className="flex flex-col items-start justify-start w-full gap-2">
              <p className="mt-4">Observações</p>
              <Input
                text="Observação"
                type="text"
                onChange={(e) => setObservation(e.target.value)}
                value={observation}
              />
            </div>

            <div className="flex flex-col items-end justify-end w-full gap-4">
              <Button text="Criar Ticket" onClick={handleAddTicket} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
