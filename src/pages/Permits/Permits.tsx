/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import Spin from "../../components/Spin/Spin";
import Header from "../../components/Header/Header";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";
import { User } from "../../models/User";
import {
  FileText,
  Calendar,
  MapPin,
  Trash2,
  PlusCircle,
  ClipboardList,
  X,
  Weight,
} from "lucide-react";
import "./Permits.css";
import { FaUser } from "react-icons/fa";

interface Permit {
  id: number;
  client_id: number;
  state: string;
  expiration_date: string;
  overweight: boolean;
  created_at: string;
  updated_at: string;
  oscar?: string;
}

interface Client {
  id: number;
  name: string;
}

const Permits = () => {
  const { t } = useTranslation();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [permitToDelete, setPermitToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPermit, setNewPermit] = useState({
    client_id: "",
    state: "",
    expiration_date: "",
    overweight: false,
    oscar: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const [permRes, clientsRes] = await Promise.all([
        api.get<Permit[]>("/permits", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get<Client[]>("/clients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setPermits(permRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      messageAlert({ type: "error", message: t("permits_page.fetch_error") });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const today = useMemo(() => new Date(), []);

  const getClientName = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : `Client ${clientId}`;
  };

  const getStatus = (expiration: string) => {
    const exp = new Date(expiration);
    const diffDays = Math.ceil(
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0)
      return {
        key: "expired",
        label: t("permits_page.expired"),
        diffDays,
      };
    if (diffDays <= 30)
      return {
        key: "expiring",
        label: t("permits_page.expiring_soon"),
        diffDays,
      };
    return {
      key: "active",
      label: t("permits_page.active"),
      diffDays,
    };
  };

  const filteredPermits = useMemo(() => {
    const bySearch = (p: Permit) => {
      if (!searchTerm.trim()) return true;
      const clientName = getClientName(p.client_id).toLowerCase();
      return (
        clientName.includes(searchTerm.toLowerCase()) ||
        `${p.id}`.includes(searchTerm)
      );
    };
    const byState = (p: Permit) => {
      if (!stateFilter.trim()) return true;
      return p.state.toLowerCase() === stateFilter.toLowerCase();
    };
    return permits
      .filter((p) => bySearch(p) && byState(p))
      .sort(
        (a, b) =>
          new Date(a.expiration_date).getTime() -
          new Date(b.expiration_date).getTime()
      );
  }, [permits, searchTerm, stateFilter, clients]);

  const total = permits.length;
  const totalExpired = useMemo(
    () =>
      permits.filter((p) => getStatus(p.expiration_date).key === "expired")
        .length,
    [permits]
  );
  const totalExpiringSoon = useMemo(
    () =>
      permits.filter((p) => getStatus(p.expiration_date).key === "expiring")
        .length,
    [permits]
  );

  const handleCreatePermit = async () => {
    if (
      !newPermit.client_id ||
      !newPermit.state ||
      !newPermit.expiration_date
    ) {
      messageAlert({ type: "error", message: t("permits_page.fill_fields") });
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await api.post("/permits", newPermit, {
        headers: { Authorization: `Bearer ${token}` },
      });
      messageAlert({ type: "success", message: t("permits_page.created") });
      setNewPermit({
        client_id: "",
        state: "",
        expiration_date: "",
        overweight: false,
        oscar: "",
      });
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      messageAlert({ type: "error", message: t("permits_page.create_error") });
      console.log(err);
    }
  };

  const handleDeletePermit = async () => {
    if (!permitToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/permits/${permitToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      messageAlert({ type: "info", message: t("permits_page.deleted") });
      fetchData();
    } catch (err) {
      messageAlert({ type: "error", message: t("permits_page.delete_error") });
      console.log(err);
    } finally {
      setPermitToDelete(null);
      setIsDeleteModalOpen(false);
      setLoading(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setPermitToDelete(id);
    setIsDeleteModalOpen(true);
  };

  if (loading) return <Spin />;

  return (
    <>
      <Header name={authUser?.nome_completo} />

      <div className="permits-container">
        <div className="permits-header">
          <div className="permits-title">
            <ClipboardList />
            {t("permits_page.title")}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="add-permit-btn"
          >
            <PlusCircle size={20} />
            {t("permits_page.add")}
          </button>

          
        </div>

        <div className="permits-stats">
          <div className="stat-card primary">
            <div className="stat-value">{total}</div>
            <div className="stat-label">
              {t("permits_page.total") }
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{totalExpiringSoon}</div>
            <div className="stat-label">
              {t("permits_page.expiring_soon")}
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-value">{totalExpired}</div>
            <div className="stat-label">
              {t("permits_page.expired") }
            </div>
          </div>
        </div>

        <div className="permits-filters">
          <div className="filter-group">
            <input
              className="filter-input"
              placeholder={
                t("permits_page.search_placeholder") 
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select
              className="filter-input"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value.toUpperCase())}
            >
              <option value="">
                {t("permits_page.filter_state")}
              </option>
              {[...new Set(permits.map((p) => p.state))].sort().map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPermits.length === 0 ? (
          <div className="permits-empty">
            <ClipboardList />
            {t("permits_page.no_permits")}
          </div>
        ) : (
          <div className="permits-list">
            {filteredPermits.map((permit) => (
              <div key={permit.id} className="permit-card">
                <div className="permit-card-header">
                  <div className="permit-id">
                    <FileText size={16} />
                    Permit #{permit.id}
                  </div>
                  <div
                    className={`status-badge ${
                      getStatus(permit.expiration_date).key
                    }`}
                  >
                    {getStatus(permit.expiration_date).label}
                  </div>
                </div>

                <div className="permit-info">
                  <div className="info-item">
                    <div className="info-label">
                      <FaUser size={14} />
                      Client
                    </div>
                    <div className="info-value">
                      {getClientName(permit.client_id)}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">
                      <MapPin size={14} />
                      State
                    </div>
                    <div className="info-value">{permit.state}</div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">
                      <Calendar size={14} />
                      {t("permits_page.expiration")}
                    </div>
                    <div className="info-value">
                      {new Date(permit.expiration_date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">
                      <Calendar size={14} />
                      {t("permits_page.created_at") || "Created at"}
                    </div>
                    <div className="info-value">
                      {new Date(permit.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">
                      <Weight size={14} />
                      {t("permits_page.overweight")}
                    </div>
                    <div className="info-value">
                      {permit.overweight ? (
                        <span className="badge overweight">{t("email_preview.yes")}</span>
                      ) : (
                        <span className="badge normal">{t("email_preview.no")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="permit-actions">
                  <button
                    onClick={() => openDeleteModal(permit.id)}
                    className="permit-button delete"
                  >
                    <Trash2 size={16} />
                    {t("permits_page.delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAddModalOpen && (
          <div
            className="modal-overlay"
            onClick={() => setIsAddModalOpen(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  <PlusCircle size={24} />
                  {t("permits_page.add")}
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="modal-close"
                >
                  <X />
                </button>
              </div>

              <div className="permit-form">
                <div className="form-group">
                  <label className="form-label">
                    {t("permits_page.select_client")}
                  </label>
                  <select
                    value={newPermit.client_id}
                    onChange={(e) =>
                      setNewPermit({ ...newPermit, client_id: e.target.value })
                    }
                    className="permit-input"
                  >
                    <option value="">{t("permits_page.select_client")}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {t("permits_page.state_placeholder")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("permits_page.state_placeholder")}
                    value={newPermit.state}
                    maxLength={2}
                    onChange={(e) =>
                      setNewPermit({
                        ...newPermit,
                        state: e.target.value.toUpperCase(),
                      })
                    }
                    className="permit-input"
                  />
                </div>
                {newPermit.state === "NY" && (
                  <div className="form-group">
                    <label className="form-label">
                      {t("permits_page.oscar_placeholder")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("permits_page.oscar_placeholder")}
                      value={newPermit.oscar || ""}
                      maxLength={2}
                      onChange={(e) =>
                        setNewPermit({
                          ...newPermit,
                          oscar: e.target.value.toUpperCase(),
                        })
                      }
                      className="permit-input"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    {t("permits_page.expiration")}
                  </label>
                  <input
                    type="date"
                    value={newPermit.expiration_date}
                    onChange={(e) =>
                      setNewPermit({
                        ...newPermit,
                        expiration_date: e.target.value,
                      })
                    }
                    className="permit-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {t("permits_page.overweight")}
                  </label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newPermit.overweight}
                        onChange={(e) =>
                          setNewPermit({
                            ...newPermit,
                            overweight: e.target.checked,
                          })
                        }
                        className="permit-checkbox"
                      />
                      {t("permits_page.is_overweight")}
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="permit-button cancel"
                >
                  {t("permits_page.cancel") || "Cancel"}
                </button>
                <button
                  onClick={handleCreatePermit}
                  className="permit-button add"
                >
                  <PlusCircle size={18} />
                  {t("permits_page.add")}
                </button>
              </div>
            </div>
          </div>
        )}

        <DeleteConfirmModal
          isVisible={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeletePermit}
        />
      </div>
    </>
  );
};

export default Permits;
