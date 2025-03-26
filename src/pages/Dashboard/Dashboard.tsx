import { useState } from "react";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import './dashboard.css';
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

const Dashboard = () => {
  const storedUser = localStorage.getItem('user');
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [filteredTxt, setFilteredTxt] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const clients = [
    { id: 1, name: 'Yago', user: 'yago25' },
    { id: 2, name: 'Vitor', user: 'vitorhugouau' },
    { id: 3, name: 'Fabricio', user: 'fabricioeduard0' },
    { id: 4, name: 'Lucas', user: 'lucastrancouocurso' },
    { id: 5, name: 'Jarbas', user: 'jerbas' },
    { id: 6, name: 'Cléber', user: 'clebinho' },
    { id: 7, name: 'Emily', user: 'emilyvictoria' },
    { id: 8, name: 'Téclio', user: 'teclionomefeio' },
    { id: 9, name: 'Ryu, the runner', user: 'corredor10' },
    { id: 10, name: 'Memphis Depay', user: 'memphiscorinthians' },
    { id: 11, name: 'Batman', user: 'coringa22' },
    { id: 12, name: 'Super Homem', user: 'superman' },
    { id: 13, name: 'Cuiabá Man', user: 'estevaopalmeiras' },
    { id: 14, name: 'Serjão dos Foguetes', user: 'foguete' },
    { id: 15, name: 'Campos Salles', user: 'rua_25' },
  ];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(filteredTxt.toLowerCase()) ||
      client.user.toLowerCase().includes(filteredTxt.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
      <div className="tb">
        <div className="table" id="header">
          <p>Nome</p>
          <p>Usuário</p>
        </div>
        {currentClients.map((client) => (
          <div key={client.id} className="table">
            <p>{client.name}</p>
            <p>{client.user}</p>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          <MdArrowBackIos />
        </button>
        <span>{currentPage} de {totalPages}</span>
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          <MdArrowForwardIos />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;