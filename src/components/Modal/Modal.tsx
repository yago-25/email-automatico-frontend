import React from "react";

interface ModalProps {
  title: string;
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

const Modal: React.FC<ModalProps> = ({ title, isVisible, onClose, children, width }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center w-[1500px] items-center z-50 max-w-[1600px]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[1500px] max-w-[1600px]" style={{ width: `${width ? `${width}px` : '700px'}` }}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-blue-500 font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;