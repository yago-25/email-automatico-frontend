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


const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // const cargo = user.cargo && user.cargo.nome ? user.cargo.nome.toLowerCase() : ""; 
  const cargo = user.cargo_id; 

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
          <IoTicketSharp
            className={`icon ${isActiveRoute("/ticket") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/ticket")}
          />
          <FaCalendar
            className={`icon ${isActiveRoute("/calendar") ? "active-icon" : ""}`}
            onClick={() => handleNavigation("/calendar")}
          />

          {(cargo === 1 || cargo === 2) && (
            <>
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
              <FaCheckCircle
                className={`icon ${isActiveRoute("/approve") ? "active-icon" : ""}`}
                onClick={() => handleNavigation("/approve")}
              />
              <FaGear
                className={`icon ${isActiveRoute("/settings") ? "active-icon" : ""}`}
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