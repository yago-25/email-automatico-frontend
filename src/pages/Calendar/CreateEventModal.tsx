import { FC } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

export interface EventData {
  label: string;
  description: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  repeat: boolean;
  backgroundColor: string;
  status: string;
}

export interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventData) => void;
}

const CreateEventModal: FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { control, handleSubmit, reset } = useForm<EventData>({
    defaultValues: {
      label: "",
      description: "",
      startDate: "",
      endDate: "",
      allDay: false,
      repeat: false,
      backgroundColor: "#2563EB",
      status: "ativo",
    },
  });

  const onSubmitHandler = (data: EventData) => {
    if (!data.label || !data.startDate) return;
    onSubmit(data);
    onClose();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-gray-800">🆕 Novo Evento</h2>

        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Título</label>
            <Controller
              name="label"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite um título"
                />
              )}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Digite uma descrição (opcional)"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Início</label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    selected={field.value ? dayjs(field.value).toDate() : null}
                    onChange={(date: Date | null) => field.onChange(date ? dayjs(date).toString() : '')}
                    showTimeSelect
                    dateFormat="Pp"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Término</label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    selected={field.value ? dayjs(field.value).toDate() : null}
                    onChange={(date: Date | null) => field.onChange(date ? dayjs(date).toString() : '')}
                    showTimeSelect
                    dateFormat="Pp"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center">
            <Controller
              name="allDay"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-500"
                  checked={field.value}
                />
              )}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">Evento o dia todo</label>
          </div>

          <div className="flex items-center">
            <Controller
              name="repeat"
              control={control}
              render={() => (
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-500"
                />
              )}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">Repetir evento</label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Cor de fundo</label>
            <Controller
              name="backgroundColor"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="color"
                  className="w-16 h-10 p-0 border-0"
                />
              )}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ativo">Ativo</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="adiado">Adiado</option>
                </select>
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Criar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
