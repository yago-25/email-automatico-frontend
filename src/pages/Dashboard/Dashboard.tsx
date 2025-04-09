import { useEffect, useState } from "react";
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
        <path
          d="M13.1792 0.129353C10.6088 0.646711 8.22715 1.74444 6.16886 3.36616C4.13416 4.96799 2.42959 7.14686 1.38865 9.48493C0.202866 12.1414 -0.241805 15.156 0.125386 18.0413C0.684593 22.4156 3.02922 26.3721 6.63375 29.0186C8.01155 30.0301 9.65549 30.8757 11.2725 31.3997C12.0405 31.6518 13.4857 32 13.7518 32H13.8361V30.7232V29.4464L13.762 29.4331C11.8485 29.0252 10.2787 28.3818 8.7493 27.3802C7.50961 26.5644 6.29688 25.4402 5.40416 24.2794C3.88824 22.3095 2.98206 20.0908 2.66203 17.5736C2.57781 16.8905 2.57781 15.1029 2.66203 14.4396C2.88773 12.7317 3.31556 11.3288 4.06678 9.863C5.88589 6.3045 9.23103 3.67791 13.1286 2.746C13.4352 2.67303 13.7182 2.60671 13.762 2.59676L13.8361 2.58349V1.29009C13.8361 0.577066 13.8327 -0.00330353 13.8293 1.33514e-05C13.8226 1.33514e-05 13.5329 0.0597076 13.1792 0.129353Z"
          fill="white"
        ></path>
        <path
          d="M19.563 1.38627V2.67967L19.7078 2.71615C20.8768 3.01463 21.7527 3.32968 22.6723 3.78071C24.8249 4.84528 26.6878 6.467 28.042 8.47011C29.248 10.251 29.9858 12.2375 30.2654 14.4562C30.3126 14.831 30.326 15.1792 30.326 16.0149C30.326 17.169 30.2923 17.5869 30.1205 18.5022C29.7365 20.575 28.8404 22.5681 27.5266 24.2761C26.8158 25.2014 25.8019 26.2029 24.862 26.9027C23.3056 28.0634 21.7324 28.7997 19.7078 29.3137L19.563 29.3502V30.6436V31.9403L19.691 31.9204C20.0616 31.8541 21.1362 31.5689 21.6516 31.4031C24.8216 30.365 27.6041 28.3951 29.6152 25.7652C30.2789 24.8996 30.7337 24.1667 31.2356 23.1618C31.8959 21.8419 32.3102 20.6479 32.5999 19.2318C33.4354 15.1394 32.6606 10.9441 30.417 7.40886C28.4126 4.24833 25.3067 1.8373 21.692 0.640079C21.1867 0.470943 20.038 0.169149 19.7078 0.112772L19.563 0.0895557V1.38627Z"
          fill="white"
        ></path>
      </svg>
      <span className="group-active:hidden">{text}</span>
    </button>
  );
};

const Dashboard = () => {
  const { data: rawClients = [], loading: loadingClients } = useSwr<Clients[]>('/clients');
  const { data: rawAdmins = [], loading: loadingAdmins } = useSwr<Admins[]>('/admins');

  console.log(rawAdmins, '1rawAdmins');

  const optionsClient: Option[] = rawClients.map(client => ({
    value: String(client.id),
    label: client.name,
  }));

  const optionsAdmin: Option[] = rawAdmins.map(admin => ({
    value: String(admin.id),
    label: admin.nome_completo
  }));

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const statusTickets = [
    { name: "not_started", title: "Não iniciada" },
    { name: "waiting", title: "Esperando" },
    { name: "in_progress", title: "Em progresso" },
    { name: "discarted", title: "Descartada" },
    { name: "completed", title: "Completa" },
  ];

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
  const [loadingPostTicket, setLoadingPostTicket] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
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
    if (!phone) return "";

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
      messageAlert({
        type: "error",
        message: "Erro ao listar clientes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    setLoadingPost(true);
    try {
      if (!clientName || !clientPhone || !clientMail) {
        messageAlert({
          type: "error",
          message: "Por favor, preencha todos os campos.",
        });
        return;
      }

      await api.post(
        "/clients",
        {
          name: clientName,
          phone: clientPhone,
          mail: clientMail,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      messageAlert({
        type: "success",
        message: "Cliente cadastrado com sucesso!",
      });
      setAddClient(false);
      setClientName("");
      setClientPhone("");
      setClientMail("");
    } catch (e) {
      console.log("Erro ao criar usuário: ", e);
      messageAlert({
        type: "error",
        message: "Erro ao criar usuário",
      });
    } finally {
      setLoadingPost(false);
    }
  };

  const handleAddTicket = async () => {
    setLoadingPostTicket(true);
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
        status: statusTicket
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
    } catch(e) {
      console.log('Erro ao adicionar ticket: ', e);
      messageAlert({
        type: "error",
        message: "Erro ao adicionar ticket"
      });
    } finally {
      setLoadingPostTicket(false);
    }
  };

  useEffect(() => {
    getClients();
  }, [loadingPost]);

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
        <div className="table grid grid-cols-4 gap-x-6 gap-y-3 items-center p-4 border-b hover:bg-gray-50">
          <p>ID</p>
          <p>Nome</p>
          <p>Email</p>
          <p>Telefone</p>
        </div>
        {currentClients.map((client) => (
          <div
            key={client.id}
            className="table grid grid-cols-4 gap-x-6 gap-y-3 items-center p-4 border-b hover:bg-gray-50"
          >
            <p className="whitespace-nowrap">{client.id}</p>
            <p className="truncate max-w-[180px]" title={client.name}>
              {client.name}
            </p>
            <p className="truncate max-w-[250px]" title={client.mail}>
              {client.mail}
            </p>
            <p className="truncate max-w-[150px]" title={client.phone}>
              {formatPhone(client.phone)}
            </p>
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
      <div className="flex gap-5" style={{ marginTop: "95px" }}>
        <Button text="Adicionar Cliente" onClick={() => setAddClient(true)} />
        <Button text="Adicionar Ticket" onClick={() => setAddTicket(true)} />
      </div>
      <Modal
        width={500}
        title="Adicionar Cliente"
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
              <p>Nome</p>
              <Input
                text="Nome"
                type="text"
                required
                onChange={(e) => setClientName(e.target.value)}
                value={clientName}
              />
            </div>
            <div>
              <p>Telefone</p>
              <Input
                text="Telefone"
                type="text"
                required
                onChange={(e) => setClientPhone(e.target.value)}
                value={clientPhone}
              />
            </div>
            <div>
              <p>Email</p>
              <Input
                text="Email"
                type="email"
                required
                onChange={(e) => setClientMail(e.target.value)}
                value={clientMail}
              />
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
        {loadingPostTicket ? (
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
                <p className="mt-4">Usuário</p>
                <Select
                  options={optionsClient}
                  value={selected}
                  onChange={handleSelectChange}
                  placeholder="Status do ticket"
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
            <div className="flex flex-col items-end justify-end w-full gap-4">
              <Button text="Criar Ticket" onClick={handleAddTicket}  />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
