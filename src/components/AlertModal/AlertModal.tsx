import React from "react";
import { createPortal } from "react-dom";
import { IoMdAlert } from "react-icons/io";

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  subtitle,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl text-center">
        <div className="text-yellow-500 text-6xl mb-4 flex justify-center">
          <IoMdAlert />
        </div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
          >
            Avançar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertModal;
