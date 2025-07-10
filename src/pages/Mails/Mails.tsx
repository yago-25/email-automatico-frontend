import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash, X } from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import { MdOutlineFormatListNumbered, MdSchedule, MdCheckCircle, MdAccessTime, MdErrorOutline, MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { CiMail } from "react-icons/ci";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { AiOutlineEye } from "react-icons/ai";
import { HiOutlineMail, HiOutlineDocumentText, HiOutlineCalendar } from "react-icons/hi";
import Spin from "../../components/Spin/Spin";
import DeleteConfirmModal from "../../components/DeleteConfirm/DeleteConfirmModal";
import { api } from "../../api/api";
import EmailPreviewModal from "../../components/Modal/EmailPreviewModal";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import EditEmailModal from "../../components/Modal/EditEmailModal";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { useRef } from "react";
import useSwr from "swr";

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
interface EmailAttachment {
  name: string;
  file: File;
  mime_type?: string;
  size?: number;
}
interface Attachment {
  name: string;
  url: string;
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
  const [filteredMails, setFilteredMails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [isPreviewModalOpenEdit, setPreviewModalOpenEdit] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailItem | null>(null);
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState("");
  const [status, setStatus] = useState({
    sent: false,
    pending: false,
    failed: false,
  });
  const [date, setDate] = useState("");
  const [id, setId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredMails.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const { data: mails = [], mutate } = useSwr<EmailItem[]>("/emails", () =>
    api.get("/emails", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then(res => res.data)
  );

  useEffect(() => {
    setFilteredMails(mails);
  }, [mails]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await api.get("/emails", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      mutate(response.data, false);
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
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }

    if (recipients) {
      filtered = filtered.filter(email =>
        email.clients.some(client =>
          client.mail.toLowerCase().includes(recipients.toLowerCase())
        )
      );
    }

    const selectedStatuses = Object.entries(status)
      .filter(([, value]) => value)
      .map(([key]) => key);

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(email =>
        selectedStatuses.includes(email.status)
      );
    }

    if (date) {
      filtered = filtered.filter(email => email.send_date === date);
    }

    if (id) {
      filtered = filtered.filter(email => email.id === Number(id));
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
  if (clientIdToDelete === null || clientIdToDelete === undefined) return;

  setLoading(true); 
  try {
    await api.delete(`/emails/${clientIdToDelete}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    await mutate();
  } catch (error) {
    console.error("Erro ao deletar:", error);
    alert("Erro ao deletar o e-mail.");
  } finally {
    setIsModalCrashOpen(false);
    setClientIdToDelete(null);
    setLoading(false);
  }
};

  const handleRemoveAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);

    if (updated.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openDeleteModal = (id: number) => {
    setClientIdToDelete(id);
    setIsModalCrashOpen(true);
  };

  const debouncedApplyFilters = useMemo(
    () => debounce(applyFilters, 500),
    [id, recipients, subject, status, date, mails]
  );

  useEffect(() => {
    if (mails.length > 0) {
      debouncedApplyFilters();
    }

    return () => {
      debouncedApplyFilters.cancel();
    };
  }, [id, recipients, subject, status, date, mails]);

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
              onRemoveAttachment={handleRemoveAttachment}
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

          <div className="lg:w-1/4">
            <div className="sticky" style={{ top: '118px' }}>
              <div className="bg-white/90 backdrop-blur-sm text-blue-900 rounded-2xl shadow-xl p-6 border border-blue-100/50">
                <div className="mb-6 flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <MdOutlineFormatListNumbered className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-blue-900">{t("filters.title")}</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <div className="bg-blue-50 p-1.5 rounded-lg">
                        <MdOutlineFormatListNumbered className="w-4 h-4 text-blue-500" />
                      </div>
                      {t("filters.id")}
                    </label>
                    <input
                      type="text"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      placeholder={t("filters.search_by_id")}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-all duration-200 hover:border-gray-300 text-[15px] shadow-sm bg-white/70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <div className="bg-blue-50 p-1.5 rounded-lg">
                        <HiOutlineMail className="w-4 h-4 text-blue-500" />
                      </div>
                      {t("filters.recipients")}
                    </label>
                    <input
                      type="text"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder={t("filters.search_by_recipient")}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-all duration-200 hover:border-gray-300 text-[15px] shadow-sm bg-white/70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <div className="bg-blue-50 p-1.5 rounded-lg">
                        <HiOutlineDocumentText className="w-4 h-4 text-blue-500" />
                      </div>
                      {t("filters.subject")}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t("filters.search_by_subject")}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-all duration-200 hover:border-gray-300 text-[15px] shadow-sm bg-white/70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                      <div className="bg-blue-50 p-1.5 rounded-lg">
                        <IoIosInformationCircleOutline className="w-4 h-4 text-blue-500" />
                      </div>
                      {t("filters.status")}
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <input
                            type="checkbox"
                            checked={status.sent}
                            onChange={() => setStatus((prev) => ({ ...prev, sent: !prev.sent }))}
                            className="peer appearance-none w-5 h-5 border-2 border-green-200 rounded-lg checked:bg-green-500 checked:border-green-500 hover:border-green-400 transition-all duration-200"
                          />
                          <MdCheckCircle className="absolute w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform duration-200" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-[15px] text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                            {t("filters.sent")}
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <input
                            type="checkbox"
                            checked={status.pending}
                            onChange={() => setStatus((prev) => ({ ...prev, pending: !prev.pending }))}
                            className="peer appearance-none w-5 h-5 border-2 border-yellow-200 rounded-lg checked:bg-yellow-500 checked:border-yellow-500 hover:border-yellow-400 transition-all duration-200"
                          />
                          <MdAccessTime className="absolute w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform duration-200" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="text-[15px] text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                            {t("filters.pending")}
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <input
                            type="checkbox"
                            checked={status.failed}
                            onChange={() => setStatus((prev) => ({ ...prev, failed: !prev.failed }))}
                            className="peer appearance-none w-5 h-5 border-2 border-red-200 rounded-lg checked:bg-red-500 checked:border-red-500 hover:border-red-400 transition-all duration-200"
                          />
                          <MdErrorOutline className="absolute w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform duration-200" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-[15px] text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                            {t("filters.failed")}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <div className="bg-blue-50 p-1.5 rounded-lg">
                        <HiOutlineCalendar className="w-4 h-4 text-blue-500" />
                      </div>
                      {t("filters.date_sent")}
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-all duration-200 hover:border-gray-300 text-[15px] shadow-sm bg-white/70"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={clearFilters}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-[15px] font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow"
                    >
                      <X className="w-4 h-4" />
                      {t("filters.clear")}
                    </button>
                    <button
                      onClick={applyFilters}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-[15px] font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow"
                    >
                      <MdOutlineFormatListNumbered className="w-4 h-4" />
                      {t("filters.apply")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div >
  );
};
export default Mails;
