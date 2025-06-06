/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  AtSign, 
  CheckCircle, 
  XCircle,
  ClipboardList
} from "lucide-react";
import "./Approve.css";

interface Solicitacao {
  id: number;
  nome_completo: string;
  email: string;
  telefone: string;
  nome_usuario: string;
  status: "pendente" | "aprovado" | "rejeitado";
}

interface Cargo {
  id: number;
  nome: string;
}

const Approve = () => {
  const { t } = useTranslation();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [selectedCargos, setSelectedCargos] = useState<{
    [id: number]: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const [solicitacoesToDelete, setSolicitacoesToDelete] = useState<number | null>(null);
  const [isModalCrashOpen, setModalCrashOpen] = useState(false);

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
        message: t("approve_page.fetch_error"),
      });
      console.log(err, "Error");
    } finally {
      setLoading(false);
    }
  };

  const aprovar = async (id: number, cargoId: number) => {
    try {
      await api.post(`/solicitacoes/aprovar/${id}`, { cargo_id: cargoId });
      messageAlert({
        type: "success",
        message: t("approve_page.success"),
      });
      fetchData();
    } catch (err) {
      messageAlert({
        type: "error",
        message: t("approve_page.approve_error"),
      });
      console.log(err, "Error");
    }
  };

  const rejeitar = async () => {
    if (solicitacoesToDelete === null) return;
    setLoading(true);
    try {
      await api.post(`/solicitacoes/rejeitar/${solicitacoesToDelete}`);
      messageAlert({
        type: "info",
        message: t("approve_page.rejected"),
      });
      fetchData();
    } catch (err) {
      messageAlert({
        type: "error",
        message: t("approve_page.reject_error"),
      });
      console.log(err, "Error");
    } finally {
      setLoading(false);
      setModalCrashOpen(false);
      setSolicitacoesToDelete(null);
    }
  };

  const openDeleteModal = (id: number) => {
    setSolicitacoesToDelete(id);
    setModalCrashOpen(true);
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

      <div className="approve-container">
        <h1 className="approve-title">
          <ClipboardList />
          {t("approve_page.title")}
        </h1>

        {solicitacoes.length === 0 ? (
          <div className="approve-empty">
            <ClipboardList />
            {t("approve_page.no_requests")}
          </div>
        ) : (
          solicitacoes.map((solicitacao) => (
            <div key={solicitacao.id} className="approve-card">
              <div className="approve-card-header">
                <div className="approve-info-item">
                  <UserIcon />
                  <span className="approve-info-label">{t("approve_page.name")}:</span>
                  <span className="approve-info-value">{solicitacao.nome_completo}</span>
                </div>
                
                <div className="approve-info-item">
                  <Mail />
                  <span className="approve-info-label">{t("approve_page.email")}:</span>
                  <span className="approve-info-value">{solicitacao.email}</span>
                </div>

                <div className="approve-info-item">
                  <Phone />
                  <span className="approve-info-label">{t("approve_page.phone")}:</span>
                  <span className="approve-info-value">{solicitacao.telefone}</span>
                </div>

                <div className="approve-info-item">
                  <AtSign />
                  <span className="approve-info-label">{t("approve_page.username")}:</span>
                  <span className="approve-info-value">{solicitacao.nome_usuario}</span>
                </div>
              </div>

              <div className="approve-actions">
                <select
                  value={selectedCargos[solicitacao.id] || ""}
                  onChange={(e) => handleCargoChange(solicitacao.id, Number(e.target.value))}
                  className="approve-select"
                >
                  <option value="">{t("approve_page.select_role")}</option>
                  {cargos.map((cargo) => (
                    <option key={cargo.id} value={cargo.id}>
                      {cargo.nome}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => aprovar(solicitacao.id, selectedCargos[solicitacao.id])}
                  disabled={!selectedCargos[solicitacao.id]}
                  className={`approve-button approve-button-confirm`}
                >
                  <CheckCircle />
                  {t("approve_page.confirm")}
                </button>

                <button
                  onClick={() => openDeleteModal(solicitacao.id)}
                  className="approve-button approve-button-reject"
                >
                  <XCircle />
                  {t("approve_page.reject")}
                </button>
              </div>
            </div>
          ))
        )}

        <DeleteConfirmModal
          isVisible={isModalCrashOpen}
          onClose={() => {
            setModalCrashOpen(false);
            setSolicitacoesToDelete(null);
          }}
          onConfirm={rejeitar}
        />
      </div>
    </>
  );
};

export default Approve;
