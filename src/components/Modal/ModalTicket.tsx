import React from "react";

interface ModalProps {
  title: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

const ModalTicket: React.FC<ModalProps> = ({
  title,
  isVisible,
  onClose,
  children,
  width,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div
        className={`testeTicket bg-white rounded-lg shadow-lg p-6 ${
          width ? `w-[${width}px]` : "w-96"
        }`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
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

export default ModalTicket;
