import "./sidebar.css";
import mailIcon from "./../../../public/mail-svgrepo-com.svg";
import { IoMdHome, IoLogoWhatsapp } from "react-icons/io";
import { IoLogOut } from "react-icons/io5";
import { FaCalendar, FaUser } from "react-icons/fa";
import { IoTicketSharp, IoMail } from "react-icons/io5";
import { FaGear } from "react-icons/fa6";
import { MdSms } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { messageAlert } from "../../utils/messageAlert";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Tooltip } from 'antd';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const cargo = user.cargo_id;

  const [optionsSms, setOptionsSms] = useState(false);

  const logout = () => {
    navigate("/");
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("cargo");
    localStorage.removeItem("token");
    messageAlert({
      type: "success",
      message: "Logout realizado com sucesso.",
    });
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div
      className={`sidebar-container transition-all duration-300 ${optionsSms ? "w-[170px]" : "w-[50px]"
        }`}
    >
      <div className="first-lay">
        <img src={mailIcon} width={52} height={52} className="img-mail" />
        <div className="pages">
          <Tooltip title="teste">
            <IoMdHome
              className={`icon ${isActiveRoute("/dashboard") ? "active-icon" : ""
                }`}
              onClick={() => handleNavigation("/dashboard")}
            />
          </Tooltip>
          <FaUser
            className={`icon ${isActiveRoute("/clients") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/clients")}
          />
          <IoTicketSharp
            className={`icon ${isActiveRoute("/ticket") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/ticket")}
          />
          <FaCalendar
            className={`icon ${isActiveRoute("/calendar") ? "active-icon" : ""
              }`}
            onClick={() => handleNavigation("/calendar")}
          />

          {(cargo === 1 || cargo === 2) && (
            <>
              <div className="flex flex-col items-center w-full">
                <IoMail
                  className={`icon ${isActiveRoute("/mails") ? "active-icon" : ""
                    }`}
                    onClick={() => setOptionsSms(!optionsSms)}
                />
                {optionsSms && (
                  <button
                    className="text-[13px] text-white bg-blue-700 w-full text-left px-4 py-1 rounded hover:bg-blue-800 transition mt-3"
                    onClick={() => {
                      handleNavigation("/mails/create");
                      setOptionsSms(false);
                    }}
                  >
                    Criação de Email
                  </button>
                )}

                {optionsSms && (
                  <button
                    className="text-[13px] text-white bg-blue-700 w-full text-left px-4 py-1 rounded hover:bg-blue-800 transition mt-3"
                    onClick={() => {
                      handleNavigation("/mails");
                      setOptionsSms(false);
                    }}
                  >
                    Listagem de Mail
                  </button>
                )}
              </div>
              <div className="flex flex-col items-center w-full">
                <MdSms
                  className={`icon ${isActiveRoute("/sms") ? "active-icon" : ""}`}
                  onClick={() => setOptionsSms(!optionsSms)}
                />
                {optionsSms && (
                  <button
                    className="text-[13px] text-white bg-blue-700 w-full text-left px-4 py-1 rounded hover:bg-blue-800 transition mt-1"
                    onClick={() => {
                      handleNavigation("/sms");
                      setOptionsSms(false);
                    }}
                  >
                    Listagem de SMS
                  </button>
                )}
                {optionsSms && (
                  <button
                    className="text-[13px] text-white bg-blue-700 w-full text-left px-4 py-1 rounded hover:bg-blue-800 transition mt-3"
                    onClick={() => {
                      handleNavigation("/sms/create");
                      setOptionsSms(false);
                    }}
                  >
                    Criação de SMS
                  </button>
                )}
              </div>
              <IoLogoWhatsapp
                className={`icon ${isActiveRoute("/whatsapp") ? "active-icon" : ""
                  }`}
                onClick={() => handleNavigation("/whatsapp")}
              />
              <FaCheckCircle
                className={`icon ${isActiveRoute("/approve") ? "active-icon" : ""
                  }`}
                onClick={() => handleNavigation("/approve")}
              />
              <FaGear
                className={`icon ${isActiveRoute("/settings") ? "active-icon" : ""
                  }`}
                onClick={() => handleNavigation("/settings")}
              />
            </>
          )}
        </div>
      </div>
      <div className="logout">
        <IoLogOut className="icon-logout" width={26} onClick={logout} />
      </div>
    </div>
  );
};

export default Sidebar;
