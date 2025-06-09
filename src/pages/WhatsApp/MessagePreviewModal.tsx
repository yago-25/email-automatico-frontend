import { FileTextOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import VideoModal from "./VideoModal";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

type WppScheduleData = {
  id: number;
  instance_id: string;
  name: string;
  phone: string;
  message: string;
  user_id: number;
  user_name: string;
  status: "sent" | "failed" | "pending";
  message_type: string;
  caption?: string;
  scheduled_at: string;
  file_path?: string;
};

interface MessagePreviewModalProps {
  message: WppScheduleData;
  isVisible: boolean;
  onClose: () => void;
}

export const MessagePreviewModal = ({
  message,
  isVisible,
  onClose,
}: MessagePreviewModalProps) => {
  const renderMessage = (message: WppScheduleData) => {
    const fileUrl = encodeURI(message.file_path ?? "");
    const isVideo = fileUrl.toLowerCase().endsWith(".mp4");

    return (
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl shadow-lg p-5 w-full max-w-md transition-all duration-300 hover:shadow-xl space-y-4">
        {(() => {
          switch (message.message_type) {
            case "text":
              return (
                <p className="text-lg leading-relaxed text-slate-800">
                  {message.message}
                </p>
              );

            case "media":
              return (
                <div className="flex flex-col items-start gap-3">
                  {isVideo ? (
                    <VideoModal videoUrl={fileUrl} />
                  ) : (
                    <img
                      src={fileUrl}
                      alt="media"
                      className="rounded-lg max-w-xs shadow-md border border-gray-200 object-cover"
                    />
                  )}
                  {message.caption && (
                    <p className="italic text-sm text-gray-500">
                      {message.caption}
                    </p>
                  )}
                </div>
              );

            case "document":
              return (
                <Tooltip title="Clique para abrir">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-100 hover:bg-slate-200 border border-gray-300 rounded-xl transition cursor-pointer text-slate-800 font-medium shadow-inner"
                  >
                    <FileTextOutlined className="text-xl text-slate-600" />
                    <span className="truncate">
                      {decodeURIComponent(
                        fileUrl.split("/").pop() ?? "Documento"
                      )}
                    </span>
                  </a>
                </Tooltip>
              );

            case "poll":
              try {
                const poll = JSON.parse(message.message);
                return (
                  <div className="w-full">
                    <p className="font-semibold text-slate-700 text-base mb-2">
                      📊 {poll.question}
                    </p>
                    <div className="flex flex-col gap-2">
                      {poll.options?.map(
                        (option: { text: string }, idx: number) => (
                          <div
                            key={idx}
                            className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-slate-700 border border-gray-200 shadow-sm transition"
                          >
                            {option.text}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              } catch (err) {
                console.log("Erro ao renderizar enquete: ", err);
                return <p className="text-red-500">❌ Enquete inválida</p>;
              }

            default:
              return (
                <p className="text-gray-400 italic">
                  Tipo de mensagem desconhecido 😶
                </p>
              );
          }
        })()}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-[500px] h-[700px] bg-[#efeae2] rounded-2xl overflow-hidden flex flex-col shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)]"
          >
            <div className="bg-[#00a884] text-white px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${message.name}&background=random`}
                  alt={message.name}
                  className="w-full h-full rounded-full"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{message.name}</p>
                <p className="text-xs opacity-80">{message.phone}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div
              className="flex-1 overflow-auto px-4 py-6 space-y-4 flex flex-col bg-[#efeae2]"
              style={{
                backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABeSURBVEhL7ZOxDQAwCMN4/6GzMBr0R0rE0EuQctYB3X0zM1/RwlKFDpYqdLBUoYOlCh0sVehgqUIHSxU6WKrQwVKFDpYqdLBUoYOlCh0sVehgqUIHSxU6WKrQwVKFDpYqVLB7AQNEt+zXxYbLAAAAAElFTkSuQmCC")`,
                backgroundRepeat: "repeat",
                opacity: 0.06,
              }}
            />
            <div className="flex-1 overflow-auto px-4 py-6 space-y-4 flex flex-col absolute inset-0 top-[60px] bottom-[64px]">
              <div className="self-end max-w-[80%] bg-[#d9fdd3] p-3 rounded-xl rounded-tr-none shadow-sm text-sm text-gray-800">
                {renderMessage(message)}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[11px] text-[#667781]">
                    {new Date(message.scheduled_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-[#53bdeb]">✓✓</span>
                </div>
              </div>
            </div>

            <div className="h-16 bg-[#f0f2f5] border-t border-[#e9edef] px-4 flex items-center justify-between text-[#54656f] text-sm">
              <span>
                Mensagem agendada para{" "}
                {new Date(message.scheduled_at).toLocaleString()}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
