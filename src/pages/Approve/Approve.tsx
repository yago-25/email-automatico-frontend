import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";

interface Solicitacao {
  id: number;
  nome_completo: string;
  email: string;
  cpf: string;
  telefone: string;
  nome_usuario: string;
  status: "pendente" | "aprovado" | "rejeitado";
}

interface Cargo {
  id: number;
  nome: string;
}

const Approve = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [selectedCargos, setSelectedCargos] = useState<{
    [id: number]: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [solRes, cargosRes] = await Promise.all([
        api.get<Solicitacao[]>("/solicitacoes"),
        api.get<Cargo[]>("/cargos"),
      ]);
      setSolicitacoes(solRes.data);
      setCargos(cargosRes.data);
    } catch (err) {
      messageAlert({
        type: "error",
        message: "Erro ao carregar dados",
      });
      console.log(err, 'Error');
    } finally {
      setLoading(false);
    }
  };

  const aprovar = async (id: number, cargoId: number) => {
    try {
      await api.post(`/solicitacoes/aprovar/${id}`, {
        cargo_id: cargoId,
      });
      messageAlert({
        type: "success",
        message: "Solicitação aprovada com sucesso!",
      });
      fetchData();
    } catch (err) {
      messageAlert({
        type: "error",
        message: "Erro ao aprovar",
      });
      console.log(err, 'Error');
    }
  };

  const rejeitar = async (id: number) => {
    try {
      await api.post(`/solicitacoes/rejeitar/${id}`);
      messageAlert({
        type: "info",
        message: "Solicitação rejeitada.",
      });
      fetchData();
    } catch (err) {
      messageAlert({
        type: "error",
        message: "Erro ao rejeitar",
      });
      console.log(err, 'Error');
    }
  };

  const handleCargoChange = (solicitacaoId: number, cargoId: number) => {
    setSelectedCargos((prev) => ({
      ...prev,
      [solicitacaoId]: cargoId,
    }));
  };

  if (loading) return <Spin />;

  return (
    <>
      <Header name={authUser?.nome_completo} />

      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          📋 Solicitações Pendentes
        </h1>

        {solicitacoes.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded">
            Nenhuma solicitação pendente no momento.
          </div>
        ) : (
          solicitacoes.map((solicitacao) => (
            <div
              key={solicitacao.id}
              className="bg-white border border-gray-200 p-6 mb-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                <p>
                  <strong>👤 Nome:</strong> {solicitacao.nome_completo}
                </p>
                <p>
                  <strong>📧 Email:</strong> {solicitacao.email}
                </p>
                <p>
                  <strong>🆔 CPF:</strong> {solicitacao.cpf}
                </p>
                <p>
                  <strong>📞 Telefone:</strong> {solicitacao.telefone}
                </p>
                <p>
                  <strong>💻 Usuário:</strong> {solicitacao.nome_usuario}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <select
                  value={selectedCargos[solicitacao.id] || ""}
                  onChange={(e) =>
                    handleCargoChange(solicitacao.id, Number(e.target.value))
                  }
                  className="border border-gray-300 px-3 py-2 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" disabled>
                    Selecionar cargo...
                  </option>
                  {cargos.map((cargo) => (
                    <option key={cargo.id} value={cargo.id}>
                      {cargo.nome}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    aprovar(solicitacao.id, selectedCargos[solicitacao.id])
                  }
                  disabled={!selectedCargos[solicitacao.id]}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition 
                        ${
                          selectedCargos[solicitacao.id]
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                  ✅ Confirmar
                </button>

                <button
                  onClick={() => rejeitar(solicitacao.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  ❌ Rejeitar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Approve;
