import { X } from "lucide-react";
import { HiOutlinePencil, HiOutlinePaperClip, HiOutlineCalendar, HiOutlineClock, HiOutlineMail, HiOutlineDocumentText } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmationModal from "./ConfirmationModal";
import { FiTrash2 } from "react-icons/fi";
import dayjs from "dayjs";
import { messageAlert } from "../../utils/messageAlert";

interface EmailClient {
    id: number;
    name: string;
    mail: string;
}

interface Attachment {
    name: string;
    url: string;
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

    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; attachmentIndex: number }>({
        isOpen: false,
        attachmentIndex: -1,
    });

    const { t } = useTranslation();

    useEffect(() => {
        setLocalEmail(email);
    }, [email]);

    if (!localEmail) return null;

    const handleChange = (field: keyof EmailItem, value: string) => {
        setLocalEmail({ ...localEmail, [field]: value });
    };

    const handleSave = () => {
        if (!localEmail) return;

        const now = dayjs();
        const selectedDate = dayjs(localEmail.send_date);
        const selectedTime = localEmail.send_time;

        if (!/^\d{2}:\d{2}$/.test(selectedTime)) {
            messageAlert({
                type: "error",
                message: t("text_message.errors.time_invalid"),
            });
            return;
        }

        const [hour, minute] = selectedTime.split(":").map(Number);
        const selectedDateTime = selectedDate.hour(hour).minute(minute);

        if (selectedDate.isBefore(now, "day")) {
            messageAlert({
                type: "error",
                message: t("text_message.errors.date_in_past"),
            });
            return;
        }

        if (
            selectedDate.isSame(now, "day") &&
            selectedDateTime.isBefore(now.add(3, "minute"))
        ) {
            messageAlert({
                type: "error",
                message: t("text_message.errors.time_invalid"),
            });
            return;
        }

        onUpdate?.(localEmail);
        onClose();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white text-black rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] w-[800px] max-h-[90vh] flex flex-col p-0 relative overflow-hidden"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <div className="flex justify-between items-center px-8 py-5 border-b bg-gradient-to-r from-blue-50/80 to-white rounded-t-xl">
                            <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-3">
                                <div className="bg-blue-100 p-2.5 rounded-xl shadow-sm">
                                    <HiOutlinePencil className="w-6 h-6" />
                                </div>
                                {t("scheduled_emails.edit.title")}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100/80 transition-colors duration-200"
                            >
                                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="overflow-y-auto px-8 py-6 space-y-7 bg-white" style={{ maxHeight: '65vh' }}>
                            <div className="space-y-2.5">
                                <label className="block font-medium text-gray-700 flex items-center gap-2 text-[15px]">
                                    <HiOutlineDocumentText className="w-5 h-5 text-blue-500" />
                                    {t("scheduled_emails.edit.subject")}
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 p-3.5 rounded-xl mt-1 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200 shadow-sm hover:border-gray-400 text-[15px]"
                                    value={localEmail.subject}
                                    onChange={(e) => handleChange("subject", e.target.value)}
                                    placeholder="Digite o assunto do email..."
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label className="font-medium text-gray-700 flex items-center gap-2 text-[15px]">
                                    <HiOutlineMail className="w-5 h-5 text-blue-500" />
                                    {t("scheduled_emails.edit.to")}
                                </label>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 shadow-sm">
                                    <p className="text-[15px] text-gray-800">
                                        {localEmail.clients.map((c) => c.mail).join(", ")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="font-medium text-gray-700 flex items-center gap-2 text-[15px]">
                                        <HiOutlineCalendar className="w-5 h-5 text-blue-500" />
                                        {t("scheduled_emails.edit.send_date")}
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 p-3.5 rounded-xl mt-1 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200 shadow-sm hover:border-gray-400 text-[15px]"
                                        value={localEmail.send_date}
                                        onChange={(e) => handleChange("send_date", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="font-medium text-gray-700 flex items-center gap-2 text-[15px]">
                                        <HiOutlineClock className="w-5 h-5 text-blue-500" />
                                        {t("scheduled_emails.edit.send_time")}
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full border border-gray-300 p-3.5 rounded-xl mt-1 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200 shadow-sm hover:border-gray-400 text-[15px]"
                                        value={localEmail.send_time}
                                        onChange={(e) => handleChange("send_time", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="block font-medium text-gray-700 flex items-center gap-2 text-[15px]">
                                    <HiOutlineDocumentText className="w-5 h-5 text-blue-500" />
                                    {t("scheduled_emails.edit.body")}
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 p-4 rounded-xl mt-1 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200 shadow-sm hover:border-gray-400 min-h-[180px] text-[15px]"
                                    rows={6}
                                    value={localEmail.body}
                                    onChange={(e) => handleChange("body", e.target.value)}
                                    placeholder="Digite o conteúdo do email..."
                                />
                            </div>

                            {localEmail.attachments?.length > 0 && (
                                <div className="space-y-3">
                                    <label className="font-medium text-gray-700 flex items-center gap-2 text-[15px]">
                                        <HiOutlinePaperClip className="w-5 h-5 text-blue-500" />
                                        {t("scheduled_emails.edit.attachments")}
                                    </label>
                                    <ul className="space-y-2.5">
                                        {localEmail.attachments.map((file, idx) => (
                                            <li key={idx} className="flex items-center justify-between text-[15px] text-gray-700 bg-gray-50 px-5 py-3.5 rounded-xl border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/80 transition-all duration-200 group">
                                                <span className="flex items-center gap-2.5">
                                                    <HiOutlinePaperClip className="w-5 h-5 text-gray-500" />
                                                    {file.name}
                                                </span>
                                                {onRemoveAttachment && (
                                                    <button
                                                        onClick={() => setDeleteConfirmation({ isOpen: true, attachmentIndex: idx })}
                                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                        title={t("scheduled_emails.edit.remove_attachment")}
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end items-center px-8 py-5 border-t bg-gray-50/50 rounded-b-xl">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 mr-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-xl transition-colors duration-200 text-[15px]"
                            >
                                {t("scheduled_emails.edit.cancel")}
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 text-[15px] shadow-sm hover:shadow"
                            >
                                <HiOutlinePencil className="w-4.5 h-4.5" />
                                {t("scheduled_emails.edit.save")}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            <ConfirmationModal
                isVisible={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, attachmentIndex: -1 })}
                onConfirm={() => {
                    if (onRemoveAttachment) {
                        onRemoveAttachment(deleteConfirmation.attachmentIndex);
                    }
                }}
                title={t("scheduled_emails.edit.delete_attachment")}
                message={t("scheduled_emails.edit.delete_attachment_confirmation")}
            />
        </AnimatePresence>
    );
};

export default EditEmailModal;
