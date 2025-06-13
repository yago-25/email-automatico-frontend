import "./sidebar.css";
import mailIcon from "./../../../public/martinsadviser.svg";
import { IoMdHome, IoLogoWhatsapp } from "react-icons/io";
// import { IoLogOut } from "react-icons/io5";
import { FaCalendar, FaUser } from "react-icons/fa";
import { IoTicketSharp, IoMail } from "react-icons/io5";
import { FaGear } from "react-icons/fa6";
import { MdSms } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { messageAlert } from "../../utils/messageAlert";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { MdAnalytics     } from "react-icons/md";

const Sidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const cargo = user.cargo_id;

  const [optionsSms, setOptionsSms] = useState(false);
  const [optionsEmail, setOptionsEmail] = useState(false);

  const logout = () => {
    navigate("/");
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("cargo");
    localStorage.removeItem("token");
    messageAlert({
      type: "success",
      message: t("sidebar.logout_message"),
    });
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div
      className={`sidebar-container transition-all duration-300 ${
        optionsSms || optionsEmail ? "w-[180px]" : "w-[90px]"
      }`}
    >
      <div className="first-lay">
        <img
          src={mailIcon}
          width={105}
          height={105}
          className="img-mail"
          style={{ paddingLeft: "15px", paddingRight: "15px" }}
        />
        <div className="pages">
          <Tooltip title={t("sidebar.tooltips.dashboard")} placement="right">
            <IoMdHome
              className={`icon ${
                isActiveRoute("/dashboard") ? "active-icon" : ""
              }`}
              onClick={() => handleNavigation("/dashboard")}
            />
          </Tooltip>
          <Tooltip title={t("sidebar.tooltips.clients")} placement="right">
            <FaUser
              className={`icon ${
                isActiveRoute("/clients") ? "active-icon" : ""
              }`}
              onClick={() => handleNavigation("/clients")}
            />
          </Tooltip>
          <Tooltip title={t("sidebar.tooltips.tickets")} placement="right">
            <IoTicketSharp
              className={`icon ${
                isActiveRoute("/ticket") ? "active-icon" : ""
              }`}
              onClick={() => handleNavigation("/ticket")}
            />
          </Tooltip>
          <Tooltip title={t("sidebar.tooltips.calendar")} placement="right">
            <FaCalendar
              className={`icon ${
                isActiveRoute("/calendar") ? "active-icon" : ""
              }`}
              onClick={() => handleNavigation("/calendar")}
            />
          </Tooltip>

          {(cargo === 1 || cargo === 2) && (
            <>
              <div className="flex flex-col items-center w-full">
                <Tooltip
                  title={t("sidebar.tooltips.email.tooltip")}
                  placement="right"
                >
                  <IoMail
                    className={`icon ${
                      isActiveRoute("/mails") ? "active-icon" : ""
                    }`}
                    onClick={() => {
                      setOptionsEmail(!optionsEmail);
                      setOptionsSms(false);
                    }}
                  />
                </Tooltip>
                {optionsEmail && (
                  <button
                    className="text-[13px] text-white bg-blue-700 w-full px-4 py-1 rounded flex items-center justify-center text-center hover:bg-blue-800 transition mt-3"
                    onClick={() => {
                      handleNavigation("/mails");
                      setOptionsEmail(false);
                      setOptionsSms(false);
                    }}
                  >
                    {t("sidebar.tooltips.email.list")}
                  </button>
                )}
                {optionsEmail && (
                  <button
                    className="text-[13px] text-white bg-blue-700 w-full px-4 py-1 rounded flex items-center justify-center text-center hover:bg-blue-800 transition mt-3"
                    onClick={() => {
                      handleNavigation("/mails/create");
                      setOptionsEmail(false);
                      setOptionsSms(false);
                    }}
                  >
                    {t("sidebar.tooltips.email.create")}
                  </button>
                )}
              </div>
              <div className="flex flex-col items-center w-full">
                <Tooltip
                  title={t("sidebar.tooltips.sms.tooltip")}
                  placement="right"
                >
                  <MdSms
                    className={`icon ${
                      isActiveRoute("/sms") ? "active-icon" : ""
                    }`}
                    onClick={() => {
                      setOptionsSms(!optionsSms);
                      setOptionsEmail(false);
                    }}
                  />
                </Tooltip>
                {optionsSms && (
                  <button
                    className="text-[13px] text-white bg-blue-700 w-full px-4 py-1 rounded flex items-center justify-center text-center hover:bg-blue-800 transition mt-1"
                    onClick={() => {
                      handleNavigation("/sms");
                      setOptionsSms(false);
                      setOptionsEmail(false);
                    }}
                  >
                    {t("sidebar.tooltips.sms.list")}
                  </button>
                )}
                {optionsSms && (
                  <button
                    className="text-[13px] text-white bg-blue-700 w-full px-4 py-1 rounded flex items-center justify-center text-center hover:bg-blue-800 transition mt-3"
                    onClick={() => {
                      handleNavigation("/sms/create");
                      setOptionsSms(false);
                      setOptionsEmail(false);
                    }}
                  >
                    {t("sidebar.tooltips.sms.create")}
                  </button>
                )}
              </div>
              <Tooltip title={t("sidebar.tooltips.wpp")} placement="right">
                <IoLogoWhatsapp
                  className={`icon ${
                    isActiveRoute("/whatsapp") ? "active-icon" : ""
                  }`}
                  onClick={() => handleNavigation("/whatsapp")}
                />
              </Tooltip>
              <Tooltip title={t("sidebar.tooltips.approve")} placement="right">
                <FaCheckCircle
                  className={`icon ${
                    isActiveRoute("/approve") ? "active-icon" : ""
                  }`}
                  onClick={() => handleNavigation("/approve")}
                />
              </Tooltip>
              <Tooltip title={t("sidebar.tooltips.metrics")} placement="right">
                <MdAnalytics    
                  className={`icon ${
                    isActiveRoute("/metrics") ? "active-icon" : ""
                  }`}
                  onClick={() => handleNavigation("/metrics")}
                />
              </Tooltip>
              <Tooltip title={t("sidebar.tooltips.config")} placement="right">
                <FaGear
                  className={`icon ${
                    isActiveRoute("/settings") ? "active-icon" : ""
                  }`}
                  onClick={() => handleNavigation("/settings")}
                />
              </Tooltip>

            </>
          )}
        </div>
      </div>
      <div className="logout">
        <Tooltip title={t("sidebar.tooltips.logout")} placement="right">
          <LogOut
            className="text-red-500 hover:scale-110 transition-transform"
            size={26}
            onClick={logout}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default Sidebar;
