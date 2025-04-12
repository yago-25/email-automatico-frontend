import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import { useNavigate } from "react-router-dom";
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
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
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
        }
    };

    if (loading) return <Spin />;

    return (
        <>
            <Header name={authUser?.nome_completo} />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Solicitações Pendentes</h1>
                {solicitacoes.length === 0 ? (
                    <p>Nenhuma solicitação pendente.</p>
                ) : (
                    solicitacoes.map((solicitacao) => (
                        <div key={solicitacao.id} className="border p-4 mb-4 rounded shadow-sm">
                            <p><strong>Nome:</strong> {solicitacao.nome_completo}</p>
                            <p><strong>Email:</strong> {solicitacao.email}</p>
                            <p><strong>CPF:</strong> {solicitacao.cpf}</p>
                            <p><strong>Telefone:</strong> {solicitacao.telefone}</p>
                            <p><strong>Usuário:</strong> {solicitacao.nome_usuario}</p>

                            <div className="mt-3 flex gap-3 items-center">
                                <select
                                    defaultValue=""
                                    onChange={(e) => {
                                        const cargoId = Number(e.target.value);
                                        if (cargoId) aprovar(solicitacao.id, cargoId);
                                    }}
                                    className="border p-1 rounded"
                                >
                                    <option value="" disabled>Selecionar cargo...</option>
                                    {cargos.map((cargo) => (
                                        <option key={cargo.id} value={cargo.id}>
                                            {cargo.nome}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => rejeitar(solicitacao.id)}
                                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                                >
                                    Rejeitar
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
