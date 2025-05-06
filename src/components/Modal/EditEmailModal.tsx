import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

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
                        className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[90vh] flex flex-col p-0 relative"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >

                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-semibold text-blue-500">Prévia do E-mail</h2>
                            <button onClick={onClose} className="text-xl font-bold text-gray-400 hover:text-gray-600">×</button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: '60vh' }}>
                            <div>
                                <label className="block font-medium">Assunto:</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded mt-1"
                                    value={localEmail.subject}
                                    onChange={(e) => handleChange("subject", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block font-medium">Para:</label>
                                <p className="text-sm text-gray-700 mt-1">
                                    {localEmail.clients.map((c) => c.mail).join(", ")}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium">Data do envio:</label>
                                    <input
                                        type="date"
                                        className="w-full border p-2 rounded mt-1"
                                        value={localEmail.send_date}
                                        onChange={(e) => handleChange("send_date", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium">Horário do envio:</label>
                                    <input
                                        type="time"
                                        className="w-full border p-2 rounded mt-1"
                                        value={localEmail.send_time}
                                        onChange={(e) => handleChange("send_time", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium">Corpo do E-mail:</label>
                                <textarea
                                    className="w-full border p-2 rounded mt-1"
                                    rows={6}
                                    value={localEmail.body}
                                    onChange={(e) => handleChange("body", e.target.value)}
                                />
                            </div>

                            {localEmail.attachments?.length > 0 && (
                                <div>
                                    <label className="block font-medium">Anexos:</label>
                                    <ul className="pl-4 mt-1">
                                        {localEmail.attachments.map((file, idx) => (
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

                        <div className="flex justify-end items-center p-4 border-t bg-gray-50">
                            <button onClick={onClose} className="px-4 py-2 mr-2 rounded text-gray-600 hover:text-gray-800">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                                Salvar
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditEmailModal;
