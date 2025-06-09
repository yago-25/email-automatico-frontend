import { PlayCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { useState } from "react";

const VideoModal = ({ videoUrl }: { videoUrl: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="relative w-full max-w-xs h-48 rounded-lg overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition"
      >
        <video
          src={videoUrl}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center text-white text-4xl bg-black bg-opacity-40 group-hover:bg-opacity-60">
          <PlayCircleOutlined />
        </div>
      </div>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={720}
        centered
      >
        <video src={videoUrl} width="100%" controls className="rounded-lg" />
      </Modal>
    </>
  );
};

export default VideoModal;
