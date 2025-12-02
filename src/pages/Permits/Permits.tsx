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
  Save,
  Edit,
} from "lucide-react";
import "./Permits.css";
import {
  FaCalendarAlt,
  FaClock,
  FaEraser,
  FaFilter,
  FaMapMarkerAlt,
  FaUser,
  FaWeightHanging,
} from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import useSwr from "swr";
import Modal from "../../components/Modal/Modal";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

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
  const [showModalFilter, setShowModalFilter] = useState(false);
  const [editingPermitId, setEditingPermitId] = useState<number | null>(null);
  const [editedPermit, setEditedPermit] = useState<Permit | null>(null);
  const [clientFilter, setClientFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [overweightFilter, setOverweightFilter] = useState("");
  const [expiredFilter, setExpiredFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const [permRes] = await Promise.all([
        api.get("/permits", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const sorted = [...permRes.data].sort((a, b) => a.id - b.id);

      setPermits(sorted);
    } catch (err) {
      messageAlert({ type: "error", message: t("permits_page.fetch_error") });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const { data: clients = [], isLoading } = useSwr<Client[]>("/clients", {
    fetcher: (url) =>
      api
        .get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((res) => res.data),
  });

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
    let filtered = [...permits];

    if (searchTerm.trim()) {
      filtered = filtered.filter((p) => {
        const clientName = getClientName(p.client_id).toLowerCase();
        return (
          clientName.includes(searchTerm.toLowerCase()) ||
          `${p.id}`.includes(searchTerm)
        );
      });
    }

    if (clientFilter) {
      filtered = filtered.filter((p) => p.client_id === Number(clientFilter));
    }

    if (stateFilter.trim()) {
      filtered = filtered.filter((p) =>
        p.state.toLowerCase().includes(stateFilter.toLowerCase())
      );
    }

    if (dateStart && dateEnd) {
      filtered = filtered.filter((p) => {
        const exp = new Date(p.expiration_date);
        return exp >= new Date(dateStart) && exp <= new Date(dateEnd);
      });
    }

    if (overweightFilter !== "") {
      filtered = filtered.filter(
        (p) => p.overweight === (overweightFilter === "true")
      );
    }

    if (expiredFilter !== "") {
      const now = new Date();
      filtered = filtered.filter((p) => {
        const exp = new Date(p.expiration_date);
        const isExpired = exp < now;
        return expiredFilter === "true" ? isExpired : !isExpired;
      });
    }

    return filtered.sort(
      (a, b) =>
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
    );
  }, [
    permits,
    searchTerm,
    clientFilter,
    stateFilter,
    dateStart,
    dateEnd,
    overweightFilter,
    expiredFilter,
    clients,
  ]);

  const totalPages = Math.ceil(filteredPermits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPermits = filteredPermits.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  const handleEditClick = (permit: Permit) => {
    setEditingPermitId(permit.id);
    setEditedPermit({ ...permit });
  };

  const handleCancelEdit = () => {
    setEditingPermitId(null);
    setEditedPermit(null);
  };

  const handleSaveEdit = async () => {
    if (!editedPermit) return;

    if (
      !editedPermit.client_id ||
      !editedPermit.state ||
      !editedPermit.expiration_date
    ) {
      messageAlert({ type: "error", message: t("permits_page.fill_fields") });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(
        `/permits/${editedPermit.id}`,
        {
          client_id: editedPermit.client_id,
          state: editedPermit.state,
          expiration_date: editedPermit.expiration_date,
          overweight: editedPermit.overweight,
          oscar: editedPermit.oscar || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      messageAlert({ type: "success", message: t("permits_page.updated") });
      setEditingPermitId(null);
      setEditedPermit(null);
      fetchData();
    } catch (err) {
      messageAlert({ type: "error", message: t("permits_page.update_error") });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterToggle = () => {
    setShowModalFilter(true);
  };

  const handleClearFilters = () => {
    setClientFilter("");
    setStateFilter("");
    setDateStart("");
    setDateEnd("");
    setOverweightFilter("");
    setExpiredFilter("");
    setSearchTerm("");
    setShowModalFilter(false);
  };

  const handleApplyFilters = () => {
    setShowModalFilter(false);
    setCurrentPage(1);
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spin />
      </div>
    );
  }

  return (
    <>
      <Header name={authUser?.nome_completo} />

      <div className="permits-container">
        <div className="permits-header">
          <div className="permits-title">
            <ClipboardList />
            {t("permits_page.title")}
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="add-permit-btn"
            >
              <PlusCircle size={20} />
              {t("permits_page.add")}
            </button>
            <button
              onClick={handleFilterToggle}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg shadow-md hover:bg-purple-700 hover:shadow-lg transition-all duration-200"
            >
              <CiFilter className="w-5 h-5" />
              {t("filters.titleup")}
            </button>
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-200"
            >
              <FaEraser className="w-5 h-5" />
              {t("filters.clear")}
            </button>
          </div>
        </div>

        <div className="permits-stats">
          <div className="stat-card primary">
            <div className="stat-value">{total}</div>
            <div className="stat-label">{t("permits_page.total")}</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{totalExpiringSoon}</div>
            <div className="stat-label">{t("permits_page.expiring_soon")}</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-value">{totalExpired}</div>
            <div className="stat-label">{t("permits_page.expired")}</div>
          </div>
        </div>

        <div className="permits-filters">
          <div className="filter-group">
            <input
              className="filter-input"
              placeholder={t("permits_page.search_placeholder")}
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
              <option value="">{t("permits_page.filter_state")}</option>
              {[...new Set(permits.map((p) => p.state))].sort().map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentPermits.length === 0 ? (
          <div className="permits-empty">
            <ClipboardList />
            {t("permits_page.no_permits")}
          </div>
        ) : (
          <div className="permits-list">
            {currentPermits.map((permit) => {
              const isEditing = editingPermitId === permit.id;
              const displayPermit =
                isEditing && editedPermit ? editedPermit : permit;

              return (
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
                        {isEditing ? (
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={editedPermit?.client_id || ""}
                            onChange={(e) =>
                              setEditedPermit((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      client_id: Number(e.target.value),
                                    }
                                  : null
                              )
                            }
                          >
                            <option value="">Select client</option>
                            {clients.map((client) => (
                              <option key={client.id} value={client.id}>
                                {client.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          getClientName(displayPermit.client_id)
                        )}
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">
                        <MapPin size={14} />
                        State
                      </div>
                      <div className="info-value">
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={editedPermit?.state || ""}
                            onChange={(e) =>
                              setEditedPermit((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      state: e.target.value.toUpperCase(),
                                    }
                                  : null
                              )
                            }
                            maxLength={2}
                          />
                        ) : (
                          displayPermit.state
                        )}
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">
                        <Calendar size={14} />
                        {t("permits_page.expiration")}
                      </div>
                      <div className="info-value">
                        {isEditing ? (
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={editedPermit?.expiration_date || ""}
                            onChange={(e) =>
                              setEditedPermit((prev) =>
                                prev
                                  ? { ...prev, expiration_date: e.target.value }
                                  : null
                              )
                            }
                          />
                        ) : (
                          new Date(
                            displayPermit.expiration_date
                          ).toLocaleDateString()
                        )}
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
                        {isEditing ? (
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={editedPermit?.overweight ? "true" : "false"}
                            onChange={(e) =>
                              setEditedPermit((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      overweight: e.target.value === "true",
                                    }
                                  : null
                              )
                            }
                          >
                            <option value="false">
                              {t("email_preview.no")}
                            </option>
                            <option value="true">
                              {t("email_preview.yes")}
                            </option>
                          </select>
                        ) : displayPermit.overweight ? (
                          <span className="badge overweight">
                            {t("email_preview.yes")}
                          </span>
                        ) : (
                          <span className="badge normal">
                            {t("email_preview.no")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="permit-actions flex w-full sm:w-auto gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="permit-button bg-green-600 hover:bg-green-700"
                        >
                          <Save size={16} />
                          {t("buttons.save")}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="permit-button bg-gray-600 hover:bg-gray-700"
                        >
                          <X size={16} />
                          {t("permits_page.cancel") || "Cancel"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(permit)}
                          className="permit-button edit"
                        >
                          <Edit size={16} />
                          {t("buttons.edit")}
                        </button>
                        <button
                          onClick={() => openDeleteModal(permit.id)}
                          className="permit-button delete"
                        >
                          <Trash2 size={16} />
                          {t("permits_page.delete")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-[#00448d] text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <MdArrowBackIos />
          </button>
          <span className="font-medium text-gray-700">
            {currentPage} {t("clients.of")} {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-[#00448d] text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <MdArrowForwardIos />
          </button>
        </div>

        <DeleteConfirmModal
          isVisible={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeletePermit}
        />

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
      <Modal
        title={
          <div className="flex items-center gap-3 text-blue-600">
            <FaFilter className="w-6 h-6" />
            <span className="text-2xl font-bold">{t("filters.title")}</span>
          </div>
        }
        isVisible={showModalFilter}
        onClose={() => setShowModalFilter(false)}
      >
        <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-2xl shadow-lg mt-2 max-w-md mx-auto">
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <FaUser className="w-5 h-5" />
              </div>
              <label className="text-sm font-semibold text-gray-700">
                {t("filters.client")}
              </label>
            </div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 backdrop-blur-sm"
            >
              <option value="">{t("filters.all")}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <FaMapMarkerAlt className="w-5 h-5" />
              </div>
              <label className="text-sm font-semibold text-gray-700">
                {t("filters.state")}
              </label>
            </div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value.toUpperCase())}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/70 backdrop-blur-sm"
            >
              <option value="">{t("filters.all")}</option>
              {[...new Set(permits.map((p) => p.state))].sort().map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600">
                  <FaCalendarAlt className="w-5 h-5" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("filters.startDate")}
                </label>
              </div>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/70 backdrop-blur-sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600">
                  <FaCalendarAlt className="w-5 h-5" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("filters.endDate")}
                </label>
              </div>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/70 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                <FaWeightHanging className="w-5 h-5" />
              </div>
              <label className="text-sm font-semibold text-gray-700">
                {t("filters.overweight")}
              </label>
            </div>
            <select
              value={overweightFilter}
              onChange={(e) => setOverweightFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/70 backdrop-blur-sm"
            >
              <option value="">{t("filters.all")}</option>
              <option value="true">{t("filters.yes")}</option>
              <option value="false">{t("filters.no")}</option>
            </select>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                <FaClock className="w-5 h-5" />
              </div>
              <label className="text-sm font-semibold text-gray-700">
                {t("filters.expired")}
              </label>
            </div>
            <select
              value={expiredFilter}
              onChange={(e) => setExpiredFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white/70 backdrop-blur-sm"
            >
              <option value="">{t("filters.all")}</option>
              <option value="true">{t("filters.yes")}</option>
              <option value="false">{t("filters.no")}</option>
            </select>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                handleApplyFilters();
                setShowModalFilter(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <FaFilter className="w-4 h-4" />
              {t("filters.apply")}
            </button>

            <button
              onClick={handleClearFilters}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <FaEraser className="w-4 h-4" />
              {t("filters.clear")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Permits;
