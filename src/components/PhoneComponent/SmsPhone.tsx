import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import {
  Battery100Icon,
  CameraIcon,
  ChevronLeftIcon,
  MicrophoneIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { FaUser } from "react-icons/fa";
import { useEffect, useState } from "react";

interface SmsPhoneProps {
  photo?: string;
  name?: string;
  isGroup?: boolean;
  layout?: "WhatsApp" | "Call" | "SMS";
  children: React.ReactNode;
}

interface LayoutProps {
  time?: string;
  isGroup?: boolean;
  photo?: string;
  name?: string;
  children: React.ReactNode;
}

const SmsLayout = ({
  children,
  time,
  name = "Martins Adviser",
}: LayoutProps) => {
  const formattedDate = format(new Date(), "d 'de' MMMM, HH:mm", {
    locale: ptBR,
  });

  return (
    <div className="bg-white w-full h-full flex flex-col justify-between">
      <div className="w-full flex px-4 py-1 text-xs 2xl:text-sm font-semibold justify-between items-center">
        {time}
        <div className="flex gap-1 2xl:hidden">
          <WifiIcon width={18} />
          <Battery100Icon width={18} />
        </div>
        <div className="gap-2 hidden 2xl:flex">
          <WifiIcon width={18} />
          <Battery100Icon width={18} />
        </div>
      </div>
      <div className="grid grid-cols-3 p-1 border-b border-gray-100 shadow-md">
        <ChevronLeftIcon className="w-4 h-4 md:w-6 md:h-6 text-blue-500 self-center" />
        <div className="flex flex-col items-center gap-1">
          <FaUser className="w-8 h-8 md:w-10 md:h-10 p-1 rounded-full bg-gray-400 text-white" />
          <span className="text-xs font-semibold text-center">{name}</span>
        </div>
        <div></div>
      </div>
      <div className="flex justify-center mt-6">{formattedDate}</div>
      <div className="flex-1 p-2 gap-4 flex flex-col">{children}</div>
      <div className="p-2 bg-gray-100 flex items-center">
        <CameraIcon className="h-8 w-8 text-gray-400 mr-2" />
        <div className="border border-gray-300 rounded-xl px-2 py-1 flex w-full items-center">
          <input
            type="text"
            disabled
            className="w-full"
            placeholder="Digite sua mensagem"
          />
          <MicrophoneIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

const SmsPhone: React.FC<SmsPhoneProps> = ({ name, children }) => {
  const [dateNow, setDateNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative px-2.5 pt-2.5 pb-2 pb-7.5 w-[260px] h-[520px] 2xl:w-[320px] 2xl:h-[640px] shadow-xl rounded-[30px] bg-gray-700">
      <div className="w-[130px] 2xl:w-[150px] h-[20px] bg-gray-700 absolute top-0 left-1/2 transform -translate-x-1/2 border-black rounded-[20px]">
        <span className="block w-[40px] 2xl:w-[60px] h-[5px] bg-gray-300 mx-auto mt-1.5 rounded-full"></span>
      </div>
      <div className="rounded-[30px] overflow-y-auto flex flex-col w-full h-full">
        <SmsLayout name={name} time={dayjs(dateNow).format("HH:mm")}>
          <div className="flex-1 overflow-auto scrollbar-none">{children}</div>
        </SmsLayout>
        <div className="w-full h-4 bg-gray-100 flex justify-center items-center">
          <div className="w-2/5 rounded-full h-1 bg-black"></div>
        </div>
      </div>
    </div>
  );
};

export default SmsPhone;
