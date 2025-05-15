import { Trash2 } from "lucide-react";
import { HiOutlinePencil, HiOutlinePaperClip, HiOutlineCalendar, HiOutlineClock, HiOutlineMail } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface EmailClient {
    id: number;
    name: string;
    mail: string;
}

interface Attachment {
    name: string;
}

interface EmailItem {
    id: number;
    subject: string;
    body: string;
    send_date: string;
    send_time: string;
    clients: EmailClient[];
    attachments: Attachment[];
    status: string;
}

interface EmailPreviewModalProps {
    isVisible: boolean;
    onClose: () => void;
    email: EmailItem | null;
    onUpdate?: (email: EmailItem) => void;
    onRemoveAttachment?: (index: number) => void;
}

const EditEmailModal = ({
    isVisible,
    onClose,
    email,
    onUpdate,
    onRemoveAttachment,
}: EmailPreviewModalProps) => {
    const [localEmail, setLocalEmail] = useState<EmailItem | null>(null);

    const { t } = useTranslation();

    useEffect(() => {
        setLocalEmail(email);
    }, [email]);

    if (!localEmail) return null;

    const handleChange = (field: keyof EmailItem, value: string) => {
        console.log("handleCharge --- entrou")
        setLocalEmail({ ...localEmail, [field]: value });
    };

    const handleSave = () => {
        console.log("handleSave --- salvou")
        if (localEmail) onUpdate?.(localEmail);
        onClose();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white text-black rounded-2xl shadow-2xl w-[800px] max-h-[90vh] flex flex-col p-0 relative"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >

                        <div className="flex justify-between items-center px-6 py-4 border-b bg-white rounded-t-xl">
                            <h2 className="text-2xl font-semibold text-blue-600 flex items-center gap-2">
                                <HiOutlinePencil className="w-6 h-6" />
                                {t("scheduled_emails.edit.title")}
                            </h2>
                            <button onClick={onClose} className="text-2xl font-bold text-gray-400 hover:text-gray-600">×</button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-5 bg-white" style={{ maxHeight: '60vh' }}>
                            {/* Assunto */}
                            <div>
                                <label className="block font-medium text-gray-700">{t("scheduled_emails.edit.subject")}</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                                    value={localEmail.subject}
                                    onChange={(e) => handleChange("subject", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="font-medium text-gray-700 flex items-center gap-1">
                                    <HiOutlineMail className="w-4 h-4" />
                                    {t("scheduled_emails.edit.to")}
                                </label>
                                <p className="text-sm text-gray-800 mt-1">
                                    {localEmail.clients.map((c) => c.mail).join(", ")}
                                </p>
                            </div>

                            {/* Data e Horário */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-medium text-gray-700 flex items-center gap-1">
                                        <HiOutlineCalendar className="w-4 h-4" />
                                        {t("scheduled_emails.edit.send_date")}
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                                        value={localEmail.send_date}
                                        onChange={(e) => handleChange("send_date", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="font-medium text-gray-700 flex items-center gap-1">
                                        <HiOutlineClock className="w-4 h-4" />
                                        {t("scheduled_emails.edit.send_time")}
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full border border-gray-300 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                                        value={localEmail.send_time}
                                        onChange={(e) => handleChange("send_time", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Corpo */}
                            <div>
                                <label className="block font-medium text-gray-700">{t("scheduled_emails.edit.body")}</label>
                                <textarea
                                    className="w-full border border-gray-300 p-3 rounded mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                                    rows={6}
                                    value={localEmail.body}
                                    onChange={(e) => handleChange("body", e.target.value)}
                                />
                            </div>

                            {/* Anexos */}
                            {localEmail.attachments?.length > 0 && (
                                <div>
                                    <label className="font-medium text-gray-700 flex items-center gap-1">
                                        <HiOutlinePaperClip className="w-4 h-4" />
                                        {t("scheduled_emails.edit.attachments")}
                                    </label>
                                    <ul className="pl-4 mt-1 space-y-2">
                                        {localEmail.attachments.map((file, idx) => (
                                            <li key={idx} className="flex items-center justify-between text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded shadow-sm">
                                                <span>{file.name}</span>
                                                {onRemoveAttachment && (
                                                    <button
                                                        onClick={() => onRemoveAttachment(idx)}
                                                        className="text-red-500 hover:text-red-700"
                                                        title={t("scheduled_emails.edit.remove_attachment")}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end items-center px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 mr-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition"
                            >
                                {t("scheduled_emails.edit.cancel")}
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
                            >
                                {t("scheduled_emails.edit.save")}
                            </button>
                        </div>


                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditEmailModal;
