import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash } from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import { MdOutlineFormatListNumbered, MdSchedule } from "react-icons/md";
import { CiMail } from "react-icons/ci";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { AiOutlineEye } from "react-icons/ai";
import Spin from "../../components/Spin/Spin";
import { MdCheckCircle, MdAccessTime, MdErrorOutline } from "react-icons/md";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";
import { api } from "../../api/api";
import EmailPreviewModal from "../../components/Modal/EmailPreviewModal";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import EditEmailModal from "../../components/Modal/EditEmailModal";
import { useTranslation } from "react-i18next";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter } from "react-icons/fi";
import { debounce } from "lodash";

interface EmailClient {
  id: number;
  name: string;
  mail: string;
}

interface EmailItem {
  id: number;
  subject: string;
  body: string;
  send_date: string;
  send_time: string;
  status: string;
  clients: EmailClient[];
  attachments: Attachment[];
}

interface Attachment {
  name: string;
}

const Mails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const [modalNames, setModalNames] = useState<string[]>([]);
  const [modalMails, setModalMails] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCrashOpen, setIsModalCrashOpen] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState<number | null>(null);
  const [mails, setMails] = useState<EmailItem[]>([]);
  const [filteredMails, setFilteredMails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [isPreviewModalOpenEdit, setPreviewModalOpenEdit] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailItem | null>(null);
  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState("");
  const [status, setStatus] = useState({
    sent: false,
    pending: false,
    failed: false,
  });
  const [date, setDate] = useState("");
  const [id, setId] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredMails.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await api.get("/emails", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setMails(response.data);
      setFilteredMails(response.data);
    } catch (error) {
      console.error("Erro ao carregar e-mails", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const applyFilters = () => {
    let filtered = mails;

    if (subject) {
      filtered = filtered.filter((email) =>
        email.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }

    if (recipients) {
      filtered = filtered.filter((email) =>
        email.clients.some((client) =>
          client.mail.toLowerCase().includes(recipients.toLowerCase())
        )
      );
    }

    const selectedStatuses: string[] = [];
    if (status.sent) selectedStatuses.push("sent");
    if (status.pending) selectedStatuses.push("pending");
    if (status.failed) selectedStatuses.push("failed");

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((email) =>
        selectedStatuses.includes(email.status)
      );
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((email) => selectedStatuses.includes(email.status));
    }

    if (date) {
      filtered = filtered.filter((email) => email.send_date === date);
    }

    if (id) {
      filtered = filtered.filter((email) => email.id === Number(id));
    }

    setFilteredMails(filtered);
  };


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
    setFilteredMails(mails);
  };

  const openModal = (clients: EmailClient[]) => {
    const names = clients.map((c) => c.name);
    const mails = clients.map((c) => c.mail);
    setModalNames(names);
    setModalMails(mails);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!clientIdToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/emails/${clientIdToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      await fetchEmails();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar o e-mail.");
    } finally {
      setIsModalCrashOpen(false);
      setClientIdToDelete(null);
      setLoading(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setClientIdToDelete(id);
    setIsModalCrashOpen(true);
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

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br text-white relative overflow-hidden">
      <Header name={authUser?.nome_completo} />
      <div className="max-w-1xl mx-auto py-7 z-10 relative">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4 w-full">
            {loading ? (
              <Spin />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 animate-fade-in">
                  <div className="flex items-center justify-center gap-5 flex-wrap">
                    <h1 className="text-4xl font-extrabold drop-shadow-xl flex items-center gap-2">
                      <CiMail className="w-8 h-8 animate-bounce" />
                      {t("scheduled_emails.title")}
                    </h1>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-300 animate-pulse"></span>
                      {t("scheduled_emails.statuses.sent")}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-300 animate-pulse"></span>
                      {t("scheduled_emails.statuses.failed")}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="inline-block w-3 h-3 rounded-full bg-white animate-pulse"></span>
                      {t("scheduled_emails.statuses.pending")}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-auto">
                    <AnimatePresence>
                      {!showFilter && (
                        <motion.button
                          key="filter-button"
                          layoutId="filterBox"
                          onClick={() => setShowFilter(true)}
                          className="flex items-center gap-2 bg-blue-700 text-white font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-blue-800 transition"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <FiFilter className="w-5 h-5" />
                          {t("filters.open")}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <FaPlus
                    className="cursor-pointer w-8 h-8 text-white hover:text-green-300 transition-transform transform hover:scale-110"
                    onClick={() => navigate("/mails/create")}
                    title={t("scheduled_emails.new_email")}
                  />
                </div>

                <div className="overflow-x-auto rounded-2xl shadow-2xl animate-slide-up">
                  <div className="min-w-full">
                    <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-blue-200 text-blue-900 font-semibold text-sm text-center rounded-t-2xl">
                      <div className="flex justify-center items-center gap-1">
                        <MdOutlineFormatListNumbered />
                        {t("scheduled_emails.table.id")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <CiMail />
                        {t("scheduled_emails.table.subject")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        {t("scheduled_emails.table.recipients")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <MdSchedule />
                        {t("scheduled_emails.table.schedule")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <IoIosInformationCircleOutline />
                        {t("scheduled_emails.table.status")}
                      </div>
                      <div className="flex justify-center items-center gap-1">
                        <FaPlus />
                        {t("scheduled_emails.table.actions")}
                      </div>
                    </div>

                    {filteredMails
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((mail, i) => {
                        const isSent = mail.status === "sent";
                        const isFailed = mail.status === "failed";
                        const isPending = mail.status === "pending";

                        let rowBg = "bg-white";
                        if (isSent) rowBg = "bg-green-200";
                        if (isFailed) rowBg = "bg-red-200";
                        if (isPending) rowBg = "bg-white";

                        return (
                          <div
                            key={mail.id}
                            className={`grid grid-cols-6 gap-4 px-4 py-4 text-sm text-blue-900 text-center border-b ${rowBg} ${i === mails.length - 1 ? "rounded-b-2xl" : ""
                              }`}
                          >
                            <div>{mail.id}</div>
                            <div
                              className="truncate max-w-[200px]"
                              title={mail.subject}
                            >
                              {mail.subject}
                            </div>
                            <div
                              className="flex justify-center items-center gap-1 max-w-[200px]"
                              title={mail.clients?.map((c) => c.name).join(", ")}
                            >
                              <span className="truncate">
                                {mail.clients
                                  ?.slice(0, 2)
                                  .map((c) => c.name)
                                  .join(", ")}
                              </span>
                              {mail.clients.length > 2 && (
                                <AiOutlineEye
                                  onClick={() => openModal(mail.clients)}
                                  className="text-red-500 cursor-pointer w-5 h-5 hover:scale-110 transition-transform"
                                  title={t("scheduled_emails.view_recipients")}
                                />
                              )}
                            </div>
                            <div>
                              {mail.send_date} {t("scheduled_emails.at")} {mail.send_time}
                            </div>
                            <div className="flex items-center justify-center gap-4">
                              {isPending && (
                                <div className="flex items-center gap-1">
                                  <MdAccessTime className="text-yellow-500 w-4 h-4 animate-pulse" />
                                  <span>{t("scheduled_emails.statuses2.pending")}</span>
                                </div>
                              )}
                              {isSent && (
                                <div className="flex items-center gap-1">
                                  <MdCheckCircle className="text-green-600 w-4 h-4" />
                                  <span>{t("scheduled_emails.statuses2.sent")}</span>
                                </div>
                              )}
                              {isFailed && (
                                <div className="flex items-center gap-1">
                                  <MdErrorOutline className="text-red-600 w-4 h-4" />
                                  <span>{t("scheduled_emails.statuses2.failed")}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-center gap-2">
                              <AiOutlineEye
                                className="cursor-pointer w-5 h-5 text-blue-700 hover:text-blue-900"
                                title={t("scheduled_emails.view")}
                                onClick={() => {
                                  setPreviewEmail(mail);
                                  setPreviewModalOpen(true);
                                }}
                              />
                              <button
                                title={t("scheduled_emails.edit_mail")}
                                onClick={() => {
                                  setPreviewEmail(mail);
                                  setPreviewModalOpenEdit(true);
                                }}
                              >
                                <Pencil className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(mail.id)}
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
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <MdArrowBackIos />
                  </button>
                  <span className="font-semibold">{currentPage} {t("dashboard.of")} {totalPages}</span>
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <MdArrowForwardIos />
                  </button>
                </div>
              </>
            )}

            <DeleteConfirmModal
              isVisible={isModalCrashOpen}
              onClose={() => {
                setIsModalCrashOpen(false);
                setClientIdToDelete(null);
              }}
              onConfirm={handleDelete}
            />

            <EmailPreviewModal
              isVisible={isPreviewModalOpen}
              onClose={() => {
                setPreviewModalOpen(false);
                setPreviewEmail(null);
              }}
              email={previewEmail}
            />

            <EditEmailModal
              isVisible={isPreviewModalOpenEdit}
              onClose={() => {
                setPreviewModalOpenEdit(false);
                setPreviewEmail(null);
              }}
              email={previewEmail}
              onUpdate={async (updatedEmail) => {
                try {
                  await api.put(`/emails/${updatedEmail.id}`, updatedEmail, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                      )}`,
                    },
                  });
                  setPreviewEmail(updatedEmail);
                  await fetchEmails();
                  setPreviewModalOpenEdit(false);
                } catch (error) {
                  console.error(error);
                }
              }}
              onRemoveAttachment={(index) => {
                if (!previewEmail) return;
                const updated = {
                  ...previewEmail,
                  attachments: previewEmail.attachments.filter(
                    (_, i) => i !== index
                  ),
                };
                setPreviewEmail(updated);
              }}
            />

            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">
                    {t("scheduled_emails.modal.title")}
                  </h3>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {modalNames.map((name, index) => (
                      <li key={index} className="border-b pb-2">
                        <p className="font-medium text-gray-800">{name}</p>
                        <p className="text-sm text-gray-600">{modalMails[index]}</p>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    onClick={() => setIsModalOpen(false)}
                    title={t("scheduled_emails.modal.close")}
                  >
                    ✖
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  key="filter-box"
                  layoutId="filterBox"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute w-[430px] bg-white/90 text-blue-900 mt-[29px] rounded-2xl shadow-xl p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t("filters.title")}</h2>
                    <button
                      onClick={() => setShowFilter(false)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      {t("filters.close")}
                    </button>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>


        </div>
      </div>
    </div >
  );
};
export default Mails;
