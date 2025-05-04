import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
                        className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[90vh] flex flex-col p-0 relative"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-semibold text-blue-500">Prévia do E-mail</h2>
                            <button onClick={onClose} className="text-xl font-bold text-gray-400 hover:text-gray-600">×</button>
                        </div>

                        {/* Scrollable content */}
                        <div className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: '60vh' }}>
                            <div>
                                <h3 className="text-lg font-medium">Assunto: {email.subject}</h3>
                                <p className="mt-2 text-sm">
                                    Para: {email.clients.map(c => c.mail).join(", ")}
                                </p>

                                <div className="mt-2 text-sm">
                                    <div><span className="font-medium">Data do envio:</span> {email.send_date}</div>
                                    <div className="mt-1"><span className="font-medium">Horário do envio:</span> {email.send_time}</div>
                                </div>

                                <div className="mt-4">
                                    <h4 className="font-medium">Corpo do E-mail:</h4>
                                    <p style={{ whiteSpace: "pre-line" }}>{email.body}</p>
                                </div>

                                {email.attachments?.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-medium">Anexos:</h4>
                                        <ul className="pl-4">
                                            {email.attachments.map((file, idx) => (
                                                <li key={idx} className="flex items-center justify-between text-sm text-gray-700 mb-1">
                                                    <span>{file.name}</span>
                                                    {onRemoveAttachment && (
                                                        <button
                                                            onClick={() => onRemoveAttachment(idx)}
                                                            className="ml-2 text-red-500 hover:text-red-700"
                                                            title="Remover"
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
                        </div>

                    </motion.div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmailPreviewModal;
