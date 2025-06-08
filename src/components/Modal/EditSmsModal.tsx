import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { FiMessageCircle, FiCalendar, FiClock, FiSave, FiX, FiAlertCircle } from "react-icons/fi";
import dayjs from "dayjs";
import { motion } from "framer-motion";

interface Sms {
  id: number;
  user_name: string;
  names: string[];
  phones: string[];
  message: string;
  scheduled_at: string;
  status: string;
  file_path: string | null;
}

interface EditSmsModalProps {
  isVisible: boolean;
  onClose: () => void;
  sms: Sms | null;
  onUpdate: (updatedSms: Sms) => Promise<void>;
}

const EditSmsModal = ({ isVisible, onClose, sms, onUpdate }: EditSmsModalProps) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MIN_MINUTES_AHEAD = 3;

  useEffect(() => {
    if (sms) {
      const date = dayjs(sms.scheduled_at);
      setMessage(sms.message);
      setScheduledDate(date.format("YYYY-MM-DD"));
      setScheduledTime(date.format("HH:mm"));
      setError(null);
    }
  }, [sms]);

  const validateDateTime = (date: string, time: string): boolean => {
    const now = dayjs();
    const selectedDateTime = dayjs(`${date}T${time}`);
    const minDateTime = now.add(MIN_MINUTES_AHEAD, 'minute');
    
    if (selectedDateTime.isBefore(minDateTime)) {
      setError(t("edit_sms.error_min_time", { minutes: MIN_MINUTES_AHEAD }));
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setScheduledDate(newDate);
    validateDateTime(newDate, scheduledTime);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setScheduledTime(newTime);
    validateDateTime(scheduledDate, newTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sms) return;

    if (!validateDateTime(scheduledDate, scheduledTime)) {
      return;
    }

    setLoading(true);
    try {
      const updatedSms: Sms = {
        ...sms,
        message,
        scheduled_at: `${scheduledDate}T${scheduledTime}`,
      };

      await onUpdate(updatedSms);
      onClose();
    } catch (error) {
      console.error("Error updating SMS:", error);
      setError(t("edit_sms.error_updating"));
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = dayjs();
    const minAllowed = now.add(MIN_MINUTES_AHEAD, 'minute');
    return {
      minDate: now.format("YYYY-MM-DD"),
      minTime: minAllowed.format("HH:mm"),
      currentDate: now.format("YYYY-MM-DD")
    };
  };

  if (!isVisible || !sms) return null;

  const { minDate, minTime, currentDate } = getCurrentDateTime();

  return (
    <Modal 
      title={
        <div className="flex items-center gap-3 text-black">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FiMessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xl font-semibold">{t("edit_sms.title")}</span>
        </div>
      } 
      isVisible={isVisible} 
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <div className="bg-blue-50 p-1.5 rounded-lg">
              <FiMessageCircle className="w-4 h-4 text-blue-500" />
            </div>
            {t("edit_sms.message")}
          </label>
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none text-black placeholder:text-gray-400 shadow-sm"
              rows={4}
              required
              placeholder={t("edit_sms.message_placeholder")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <div className="bg-blue-50 p-1.5 rounded-lg">
                <FiCalendar className="w-4 h-4 text-blue-500" />
              </div>
              {t("edit_sms.date")}
            </label>
            <input
              type="date"
              value={scheduledDate}
              min={minDate}
              onChange={handleDateChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none text-black shadow-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <div className="bg-blue-50 p-1.5 rounded-lg">
                <FiClock className="w-4 h-4 text-blue-500" />
              </div>
              {t("edit_sms.time")}
            </label>
            <input
              type="time"
              value={scheduledTime}
              min={scheduledDate === currentDate ? minTime : undefined}
              onChange={handleTimeChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none text-black shadow-sm"
              required
            />
            
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <motion.button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center gap-2 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiX className="w-4 h-4" />
            {t("edit_sms.cancel")}
          </motion.button>
          <motion.button
            type="submit"
            disabled={loading || !!error}
            className="px-4 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiSave className="w-4 h-4" />
            {loading ? t("edit_sms.saving") : t("edit_sms.save")}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSmsModal; 