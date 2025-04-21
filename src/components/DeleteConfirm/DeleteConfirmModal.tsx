import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading
}: DeleteConfirmModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Excluir registro
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-500">
                Deseja realmente excluir esse registro definitivamente?
              </Dialog.Description>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Sim, desejo excluir!
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
