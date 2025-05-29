import { MdOutlineFormatListNumbered } from "react-icons/md";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { HiOutlineUser } from "react-icons/hi";
import { CiMail, CiPhone } from "react-icons/ci";
import { FaGear, FaPlus } from "react-icons/fa6";
import { MdSchedule, MdScheduleSend } from "react-icons/md";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { AiOutlineEye } from "react-icons/ai";
import { useSwr } from "../../api/useSwr";
import Spin from "../../components/Spin/Spin";
import { useState, useEffect, useMemo } from "react";
import Modal from "../../components/Modal/Modal";
import { debounce } from "lodash";
import MessageModal from "../../components/Modal/MessageModal";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import { api } from "../../api/api";
import { messageAlert } from "../../utils/messageAlert";
import { FiMessageCircle } from "react-icons/fi";
import { Trash } from "lucide-react";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { MdCheckCircle, MdAccessTime, MdErrorOutline } from "react-icons/md";

interface Sms {
  id: number;
  user_name: string;
  names: string[];
  phones: string[];
  message: string;
  scheduled_at: string;
  file_path: string | null;
  status: string;
}

const SmsPage = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const { data, loading, mutate } = useSwr<Sms[]>("/sms");

  const { i18n, t } = useTranslation();
  const lang = i18n.language as "pt" | "en" | "es";

  const dateFormatMap: Record<string, string> = {
    "pt-BR": "DD/MM/YYYY HH:mm",
    en: "MM/DD/YYYY hh:mm A",
    es: "DD/MM/YYYY HH:mm",
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPhones, setModalPhones] = useState<string[]>([]);
  const [modalNames, setModalNames] = useState<string[]>([]);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingPost, setLoadingPost] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [smsIdToDelete, setSmsIdToDelete] = useState<number | null>(null);
  const [isModalCrashOpen, setIsModalCrashOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [id, setId] = useState("");
  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState({
    sent: false,
    pending: false,
    failed: false,
  });

  const [filteredSms, setFilteredSms] = useState<Sms[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredSms.length / itemsPerPage);

  useEffect(() => {
    if (data) {
      setFilteredSms(data);
    }
  }, [data]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openModal = (phones: string[], names: string[]) => {
    setModalPhones(phones);
    setModalNames(names);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModalMessage = (message: string) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const applyFilters = () => {
    if (!data) return;

    let filtered = data;

    if (subject) {
      filtered = filtered.filter((sms) =>
        sms.message.toLowerCase().includes(subject.toLowerCase())
      );
    }

    if (recipients) {
      filtered = filtered.filter((sms) =>
        sms.names.some((name) =>
          name.toLowerCase().includes(recipients.toLowerCase())
        )
      );
    }

    const selectedStatuses: string[] = [];
    if (status.sent) selectedStatuses.push("sent");
    if (status.pending) selectedStatuses.push("pending");
    if (status.failed) selectedStatuses.push("failed");

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((sms) =>
        selectedStatuses.includes(sms.status)
      );
    }

    if (date) {
      filtered = filtered.filter((sms) =>
        sms.scheduled_at.startsWith(date)
      );
    }

    if (id) {
      filtered = filtered.filter((sms) => sms.id === Number(id));
    }

    setFilteredSms(filtered);
    setCurrentPage(1);
  };

  const debouncedApplyFilters = useMemo(
    () => debounce(applyFilters, 500),
    [id, recipients, subject, status, date]
  );

  useEffect(() => {
    debouncedApplyFilters();
    return () => {
      debouncedApplyFilters.cancel();
    };
  }, [id, recipients, subject, status, date]);

  const clearFilters = () => {
    setSubject("");
    setRecipients("");
    setStatus({
      sent: false,
      pending: false,
      failed: false,
    });
    setDate("");
    setId("");
    if (data) {
      setFilteredSms(data);
    }
    setCurrentPage(1);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const handleSendNow = async (id: number) => {
    setLoadingPost(true);
    try {
      await api.post(`/sms/send?id=${id}`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      messageAlert({
        type: "success",
        message: t("alerts.send_success"),
      });
      mutate();
    } catch (error) {
      messageAlert({
        type: "error",
        message: t("alerts.send_error"),
      });
      console.log("Erro: ", e);
    } finally {
      setLoadingPost(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setSmsIdToDelete(id);
    setIsModalCrashOpen(true);
  };

  const handleDelete = async (id: number) => {
    setLoadingDelete(true);
    try {
      await api.delete(`/sms/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`!,
        },
      });

      messageAlert({
        type: "success",
        message: t("alerts.delete_success"),
      });

      mutate();
    } catch (error) {
      console.error("Erro ao deletar SMS:", error);
      alert(t("alerts.delete_error"));
    } finally {
      setIsModalCrashOpen(false);
      setSmsIdToDelete(null);
      setLoadingDelete(false);
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br text-white relative overflow-hidden">
      <Header name={authUser?.nome_completo} />
      <div className="max-w-1xl mx-auto py-7 z-10 relative">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4 w-full">
            {loading || loadingPost || loadingDelete ? (
              <Spin />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 animate-fade-in">
                  <div className="flex items-center justify-center gap-5 flex-wrap">
                    <h1 className="text-4xl font-extrabold drop-shadow-xl flex items-center gap-2">
                      <FiMessageCircle className="w-8 h-8 animate-bounce" />
                      {t("sms_list.title")}
                    </h1>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-300 animate-pulse"></span>
                      {t("sms_list.sent")}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-300 animate-pulse"></span>
                      {t("sms_list.failed")}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="inline-block w-3 h-3 rounded-full bg-white animate-pulse"></span>
                      {t("sms_list.pending")}
                    </div>
                  </div>

                  <FaPlus
                    className="cursor-pointer w-8 h-8 text-white hover:text-green-300 transition-transform transform hover:scale-110"
                    onClick={() => navigate("/sms/create")}
                    title={t("sms_list.new_sms")}
                  />
                </div>

                <div className="overflow-x-auto rounded-2xl shadow-2xl animate-slide-up">
                  <div className="min-w-full">
                    <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-blue-200 text-blue-900 font-semibold text-sm text-center rounded-t-2xl">
                      <div className="flex justify-center items-center gap-1">
                        <MdOutlineFormatListNumbered />
                        {t("sms_list.table.id")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <HiOutlineUser />
                        {t("sms_list.table.user")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <CiMail />
                        {t("sms_list.table.message")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <CiPhone />
                        {t("sms_list.table.recipients")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <MdSchedule />
                        {t("sms_list.table.send_date")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <IoIosInformationCircleOutline />
                        {t("sms_list.table.status")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <FaGear />
                        {t("sms_list.table.actions")}
                      </div>
                    </div>

                    {filteredSms
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((sms, i) => {
                          const isSent = sms.status === "sent";
                          const isFailed = sms.status === "failed";
                          const isPending = sms.status === "pending";

                          let rowBg = "bg-white";
                          if (isSent) rowBg = "bg-green-200";
                          if (isFailed) rowBg = "bg-red-200";
                          if (isPending) rowBg = "bg-white";

                          return (
                            <div
                              key={sms.id}
                              className={`grid grid-cols-7 gap-4 px-4 py-4 text-sm text-blue-900 text-center border-b ${rowBg} ${data && i === data.length - 1 ? "rounded-b-2xl" : ""
                                }`}
                            >
                              <div>{sms.id}</div>
                              <div>{sms.user_name}</div>
                              <div className="flex items-center gap-2 max-w-[250px]">
                                <div className="flex-1 truncate text-gray-800">
                                  {sms.message}
                                </div>
                                <AiOutlineEye
                                  onClick={() => openModalMessage(sms.message)}
                                  className="text-blue-500 cursor-pointer w-5 h-5 hover:scale-110 transition-transform"
                                  title={t("sms_list.actions.view_message")}
                                />
                              </div>
                              <div className="flex justify-center items-center gap-1 max-w-[200px]">
                                <span className="truncate">
                                  {sms.names?.slice(0, 2).join(", ")}
                                </span>
                                {sms.names.length > 2 && (
                                  <AiOutlineEye
                                    onClick={() => openModal(sms.phones, sms.names)}
                                    className="text-red-500 cursor-pointer w-5 h-5 hover:scale-110 transition-transform"
                                    title={t("sms_list.actions.view_recipients")}
                                  />
                                )}
                              </div>
                              <div>
                                {dayjs(sms.scheduled_at)
                                  .locale(lang)
                                  .format(dateFormatMap[lang])}
                              </div>
                              <div className="flex items-center justify-center gap-4">
                                {isPending && (
                                  <div className="flex items-center gap-1">
                                    <MdAccessTime className="text-yellow-500 w-4 h-4 animate-pulse" />
                                    <span>{t("sms_list.statuses.pending")}</span>
                                  </div>
                                )}
                                {isSent && (
                                  <div className="flex items-center gap-1">
                                    <MdCheckCircle className="text-green-600 w-4 h-4" />
                                    <span>{t("sms_list.statuses.sent")}</span>
                                  </div>
                                )}
                                {isFailed && (
                                  <div className="flex items-center gap-1">
                                    <MdErrorOutline className="text-red-600 w-4 h-4" />
                                    <span>{t("sms_list.statuses.failed")}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-center gap-2">
                                {sms.status !== "sent" && (
                                  <MdScheduleSend
                                    className="cursor-pointer w-5 h-5 text-blue-700 hover:text-blue-900"
                                    title={t("sms_list.actions.send_now")}
                                    onClick={() => handleSendNow(sms.id)}
                                  />
                                )}
                                <button
                                  onClick={() => openDeleteModal(sms.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                  </div>
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
                    {currentPage} {t("dashboard.of")} {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <MdArrowForwardIos />
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="lg:w-1/4">
            <div className="sticky" style={{ top: '118px' }}>
              <div className="bg-white/90 text-blue-900 rounded-2xl shadow-xl p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">{t("filters.title")}</h2>
                </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">
                      {t("filters.id")}
                    </label>
                    <input
                      type="text"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      placeholder={t("filters.search_by_id")}
                      className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring focus:ring-blue-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">
                      {t("filters.recipients")}
                    </label>
                    <input
                      type="text"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder={t("filters.search_by_recipient")}
                      className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring focus:ring-blue-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">
                      {t("filters.subject")}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t("filters.search_by_subject")}
                      className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring focus:ring-blue-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">
                      {t("filters.status")}
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={status.sent}
                          onChange={() =>
                            setStatus((prev) => ({ ...prev, sent: !prev.sent }))
                          }
                          className="accent-green-500"
                        />
                        {t("filters.sent")}
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={status.pending}
                          onChange={() =>
                            setStatus((prev) => ({ ...prev, pending: !prev.pending }))
                          }
                          className="accent-yellow-500"
                        />
                        {t("filters.pending")}
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={status.failed}
                          onChange={() =>
                            setStatus((prev) => ({ ...prev, failed: !prev.failed }))
                          }
                          className="accent-red-500"
                        />
                        {t("filters.failed")}
                      </label>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-1">
                      {t("filters.date_sent")}
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={applyFilters}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      {t("filters.apply")}
                    </button>
                    <button
                      onClick={clearFilters}
                      className="bg-gray-300 text-blue-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                      {t("filters.clear")}
                    </button>
                   </div>
              </div>
            </div>
          </div>
        </div>

        <Modal title="Receptores" isVisible={isModalOpen} onClose={closeModal}>
          <div className="flex flex-col gap-3">
            {modalPhones.map((phone, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg shadow-sm hover:bg-blue-100 transition"
              >
                <CiPhone className="text-blue-500 w-5 h-5" />
                <div className="flex flex-col">
                  <span className="text-blue-900 font-semibold">
                    {modalNames[index] || "Sem nome"}
                  </span>
                  <span className="text-blue-800 text-sm">
                    {formatPhoneNumber(phone)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={closeModal}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl transition"
            >
              {t("modal.close")}
            </button>
          </div>
        </Modal>

        <MessageModal
          isVisible={showMessageModal}
          message={selectedMessage}
          onClose={() => setShowMessageModal(false)}
        />

        <DeleteConfirmModal
          isVisible={isModalCrashOpen}
          onClose={() => {
            setIsModalCrashOpen(false);
            setSmsIdToDelete(null);
          }}
          onConfirm={() => {
            if (smsIdToDelete !== null) {
              handleDelete(smsIdToDelete);
            }
          }}
        />
      </div>
    </div>
  );
};

export default SmsPage;
