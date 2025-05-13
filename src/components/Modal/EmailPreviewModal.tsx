// import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FiTrash2, FiX, FiMail, FiCalendar, FiClock, FiPaperclip } from "react-icons/fi";


interface EmailClient {
    name: string;
    mail: string;
}

interface Attachment {
    name: string;
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
    return (
        <AnimatePresence>
            {isVisible && email && (
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
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                            <h2 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                                <FiMail className="text-blue-500" />
                                Prévia do E-mail
                            </h2>
                            <button onClick={onClose} className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition">
                                <FiX />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6 bg-white rounded-b-lg shadow-sm" style={{ maxHeight: '60vh' }}>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                    Assunto: <span className="font-normal">{email.subject}</span>
                                </h3>

                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <FiMail className="text-gray-400" />
                                    Para: {email.clients.map(c => c.mail).join(", ")}
                                </p>

                                <div className="mt-3 space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <FiCalendar className="text-gray-400" />
                                        <span><span className="font-medium">Data do envio:</span> {email.send_date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FiClock className="text-gray-400" />
                                        <span><span className="font-medium">Horário do envio:</span> {email.send_time}</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="font-medium text-gray-700 mb-2">Corpo do E-mail:</h4>
                                    <p className="text-gray-800 text-sm whitespace-pre-line bg-gray-50 p-4 rounded-md border border-gray-200 shadow-inner">
                                        {email.body}
                                    </p>
                                </div>

                                {email.attachments?.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FiPaperclip className="text-gray-500" />
                                            Anexos:
                                        </h4>
                                        <ul className="space-y-2">
                                            {email.attachments.map((file, idx) => (
                                                <li key={idx} className="flex items-center justify-between text-sm bg-gray-100 rounded-md px-4 py-2 text-gray-700 shadow-sm">
                                                    <span className="truncate">{file.name}</span>
                                                    {onRemoveAttachment && (
                                                        <button
                                                            onClick={() => onRemoveAttachment(idx)}
                                                            className="ml-3 text-red-500 hover:text-red-700 transition"
                                                            title="Remover"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>


                    </motion.div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmailPreviewModal;
