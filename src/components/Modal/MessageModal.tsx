import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";

interface MessageModalProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ isVisible, message, onClose }) => {
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
            className="bg-white text-black rounded-2xl shadow-2xl w-[800px] max-h-[90vh] flex flex-col relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
           
           <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-blue-600">Mensagem Completa</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 text-2xl"
                title="Fechar"
              >
                <AiOutlineClose />
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-gray-800 whitespace-pre-wrap" style={{ maxHeight: "60vh" }}>
              {message}
            </div>

            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageModal;
