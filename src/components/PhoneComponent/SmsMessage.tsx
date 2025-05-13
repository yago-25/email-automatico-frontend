import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

interface SmsMessageProps {
  children: React.ReactNode;
  onDelete?: () => void;
  isEditable?: boolean;
}

export const SmsMessage = ({ children, onDelete, isEditable }: SmsMessageProps) => {
  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <div className="w-full flex justify-start items-center gap-1 p-1">
      <div className="px-1 bg-[#e5e5e5] rounded-lg rounded-bl-none flex flex-col max-w-[80%]">
        <div className="flex-1 p-2">{children}</div>
      </div>
      {isEditable && (
        <Button
          onClick={handleDelete}
          shape="circle"
          icon={<DeleteOutlined />}
          className="bg-red-200 text-red-500 border-0 hover:ring-2 hover:ring-red-500"
        />
      )}
    </div>
  );
};


export default SmsMessage;