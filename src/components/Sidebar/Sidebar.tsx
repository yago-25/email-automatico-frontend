import "./sidebar.css";
import mailIcon from "./../../../public/mail-svgrepo-com.svg";
import { IoIosLogOut, IoMdHome } from "react-icons/io";
import { messageAlert } from "../../utils/messageAlert";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
    localStorage.removeItem("user");
    messageAlert({
      type: "success",
      message: "Logout realizado com sucesso.",
    });
  };

  return (
    <div className="sidebar-container">
      <div className="first-lay">
        <img src={mailIcon} width={52} height={52} className="img-mail" />
        <div className="pages">
          <IoMdHome className="icon" />
          <IoMdHome className="icon" />
          <IoMdHome className="icon" />
          <IoMdHome className="icon" />
          <IoMdHome className="icon" />
          <IoMdHome className="icon" />
          <IoMdHome className="icon" />
        </div>
      </div>
      <div className="logout">
        <IoIosLogOut className="icon-logout" width={26} onClick={logout} />
      </div>
    </div>
  );
};

export default Sidebar;
