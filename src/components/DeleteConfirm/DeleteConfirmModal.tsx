import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Spin from "../Spin/Spin"; // ajuste o path se for diferente

interface DeleteConfirmModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean; // NOVO
}

const DeleteConfirmModal = ({
  isVisible,
  onClose,
  onConfirm,
  loading = false, // valor padrão
}: DeleteConfirmModalProps) => {
  const { t } = useTranslation();

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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 mx-4 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              disabled={loading}
            >
              ✖️
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {t("common.delete.title")}
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spin color="blue" />
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm sm:text-base mb-6">
                  {t("common.delete.confirmation")}{" "}
                  <strong>{t("common.delete.permanently")}</strong>?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {t("common.delete.confirm_button")}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
