// import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiMail, FiCalendar, FiClock, FiPaperclip, FiUser } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface EmailClient {
    name: string;
    mail: string;
}

interface Attachment {
    name: string;
    url: string;
}

interface EmailPreviewModalProps {
    isVisible: boolean;
    onClose: () => void;
    email: {
        subject: string;
        body: string;
        send_date: string;
        send_time: string;
        clients: EmailClient[];
        attachments: Attachment[];
    } | null;
    onRemoveAttachment?: (index: number) => void;
}

const EmailPreviewModal = ({
    isVisible,
    onClose,
    email,
    onRemoveAttachment,
}: EmailPreviewModalProps) => {

    const { t } = useTranslation();

    console.log('Attachments in modal:', email?.attachments);

    console.log("onRemoveAttachment:", onRemoveAttachment);

    


    return (
        <AnimatePresence>
            {isVisible && email && (
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

                        <div className="flex justify-between items-center px-6 py-3 border-b bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <FiMail className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">{t("scheduled_emails.preview.title")}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                            >
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="overflow-y-auto bg-white" style={{ maxHeight: '75vh' }}>
                            <div className="px-6 py-5 border-b">
                                <h1 className="text-xl font-semibold text-gray-900 mb-4">
                                    {email.subject}
                                </h1>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="min-w-[40px] text-gray-500">Para:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {email.clients.map((client, idx) => (
                                                <div key={idx} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                                    <FiUser className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                                                    {client.mail}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <FiCalendar className="w-4 h-4 text-gray-400" />
                                            <span>{email.send_date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiClock className="w-4 h-4 text-gray-400" />
                                            <span>{email.send_time}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="px-6 py-6">
                                <div className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-line">
                                    {email.body}
                                </div>
                            </div>

                            {email.attachments?.length > 0 && (
                                <div className="px-6 pb-6">
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                                            <FiPaperclip className="w-4 h-4" />
                                            <span>{email.attachments.length} {t("scheduled_emails.preview.attachments")}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {email.attachments.map((file, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border border-gray-200 group hover:border-gray-300 transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="bg-blue-100 p-1.5 rounded">
                                                            <FiPaperclip className="w-3.5 h-3.5 text-blue-600" />
                                                        </div>
                                                        <span className="truncate text-sm text-gray-700">{file.name}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 ml-2">
                                                        {file.url && (
                                                            <a
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-600 hover:underline"
                                                            >
                                                                {t("scheduled_emails.preview.open")}
                                                            </a>
                                                        )}
                                                        
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end items-center px-6 py-3 border-t bg-gray-50">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                            >
                                {t("scheduled_emails.preview.close")}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmailPreviewModal;
