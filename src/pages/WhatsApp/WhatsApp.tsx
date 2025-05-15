import { Avatar, Spin } from "antd";
import { FaWhatsapp } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { Button } from "../Dashboard/Dashboard";
import Header from "../../components/Header/Header";
import { User } from "../../models/User";
import { useState } from "react";
import Input from "../../components/Input/Input";
import { messageAlert } from "../../utils/messageAlert";
import SpinScreen from "./../../components/Spin/Spin";
import { api } from "../../api/api";

const WhatsApp = () => {
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [openInputNumber, setOpenInputNumber] = useState(false);
  const [number, setNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPost, setLoadingPost] = useState<boolean>(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);

  const handleConnectNumber = async () => {
    if (!number) {
      messageAlert({
        type: "error",
        message: "Por favor, preencha o número desejado para conectar",
      });
      return;
    }

    setLoadingPost(true);
    try {
      const response = await api.post(
        "/whatsapp/create",
        {
          number: number,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const { qrcode } = response.data.data;
      console.log(response, "respoonse");

      if (qrcode?.base64) {
        setQrCodeBase64(qrcode.base64);
      }
      console.log(response, "responmse");
    } catch (e) {
      console.log("klasdnvsdfklv");
      console.log(e);
    } finally {
      setLoadingPost(false);
    }
  };

  if (loadingPost) {
    return <SpinScreen />;
  }

  return (
    <div>
      <Header name={authUser?.nome_completo} />
      <div className="p-5">
        <h1 className="text-[32px] flex items-center text-white">
          <FaWhatsapp color="#25D366" style={{ marginRight: 8 }} />
          Conecte seu número para enviar mensagens automáticas
        </h1>
        <h2 className="text-[20px] flex items-center text-white font-[200]">
          Rápido, seguro e fácil — comece a automatizar seu atendimento agora
          mesmo!
        </h2>
        <div className="mt-5 p-5 bg-white max-w-[350px] h-[400px] rounded-md flex items-center justify-center gap-4 flex-col">
          {qrCodeBase64 ? (
            <img
              src={qrCodeBase64}
              alt="QR Code para conexão"
              className="max-w-[200px] max-h-[200px] mt-4"
            />
          ) : loading ? (
            <Spin />
          ) : (
            <Avatar
              size={128}
              icon={<FaWhatsapp color="rgb(37 99 235 / 1)" size={80} />}
              className="bg-white"
            />
          )}
          {openInputNumber && (
            <div className="flex items-center justify-center gap-2">
              <Input
                text="Digite seu número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
              <IoMdSend
                className="w-7 h-7 text-blue-500 cursor-pointer"
                onClick={handleConnectNumber}
              />
            </div>
          )}
          {!openInputNumber && (
            <Button
              onClick={() => {
                setOpenInputNumber(true);
                setLoading(true);
              }}
              text="Conectar Instância"
            />
          )}
          {openInputNumber && (
            <button
              className="cursor-pointer w-44 h-12 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-lg transition-all group active:w-11 active:h-11 active:rounded-full active:duration-300 ease-in-out"
              onClick={() => {
                setOpenInputNumber(false);
                setLoading(false);
              }}
            >
              Desconectar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
