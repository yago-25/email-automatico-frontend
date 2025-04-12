import { useEffect, useState } from "react";
import "./sidebar.css";
import mailIcon from "./../../../public/mail-svgrepo-com.svg";
import { IoIosLogOut, IoMdHome, IoLogoWhatsapp } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { IoTicketSharp, IoMail } from "react-icons/io5";
import { FaGear } from "react-icons/fa6";
import { MdSms } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { messageAlert } from "../../utils/messageAlert";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/api";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    navigate("/");
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    messageAlert({
      type: "success",
      message: "Logout realizado com sucesso.",
    });
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const ticketRes = await api.get("/tickets/count");
        setTicketCount(ticketRes.data.total); 
      } catch (err) {
        console.error("Erro ao buscar contagens:", err);
      }
    };
  
    fetchCounts();
  }, []);
  const SidebarIconWithBadge = ({
    icon: Icon,
    count,
    isActive,
    onClick,
  }: {
    icon: any;
    count?: number;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <div className="">
      <Icon
        className={`icon ${isActive ? "active-icon" : ""}`}
        onClick={onClick}
      />
     {typeof count === "number" && (
        <span>
          {count}
        </span>
      )}
    </div>
  );


  return (
    <div className="sidebar-container">
      <div className="first-lay">
        <img src={mailIcon} width={52} height={52} className="img-mail" />
        <div className="pages">
          <IoMdHome
            className={`icon ${isActiveRoute("/dashboard") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/dashboard")}
          />
          <FaUser
            className={`icon ${isActiveRoute("/clients") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/clients")}
          />
          <FaCheckCircle 
            className={`icon ${isActiveRoute("/approve") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/approve")}
          />
          <IoTicketSharp
            className={`icon ${isActiveRoute("/ticket") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/ticket")}
          />
          <IoMail
            className={`icon ${isActiveRoute("/mails") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/mails")}
          />
          <MdSms
            className={`icon ${isActiveRoute("/sms") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/sms")}
          />
          <IoLogoWhatsapp
            className={`icon ${isActiveRoute("/whatsapp") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/whatsapp")}
          />
          <FaGear
            className={`icon ${isActiveRoute("/settings") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/settings")}
          />
          <SidebarIconWithBadge
            icon={IoTicketSharp}
            count={ticketCount}
            isActive={isActiveRoute("/ticket")}
            onClick={() => handleNavigation("/ticket")}
          />
          
        </div>
      </div>
      <div className="logout">
        <IoIosLogOut className="icon-logout" width={26} onClick={logout} />
      </div>
    </div>
  );
};

export default Sidebar;
