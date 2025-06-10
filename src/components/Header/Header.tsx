import React from "react";
import "./header.css";
import { useNavigate } from "react-router-dom";
import { User } from "../../models/User";
import { useSwr } from "../../api/useSwr";

interface HeaderProps {
  name?: string;
  url?: string;
}

const Header: React.FC<HeaderProps> = ({ name, url }) => {
  const storedUser = localStorage.getItem("user");
  const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const navigate = useNavigate();

  const { data } = useSwr<User>(authUser ? `usersTable/${authUser.id}` : "");

  return (
    <div className="header-container">
      <div className="padding"></div>
      <div
        className="logout"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/profile")}
      >
        <img
          src={
            url ||
            data?.url ||
            `https://ui-avatars.com/api/?name=${
              data?.nome_completo || data?.nome_usuario || "Usuário"
            }&background=0D8ABC&color=fff&size=128&rounded=true`
          }
          alt="Avatar"
          style={{ width: "34px", height: "34px", borderRadius: "50%" }}
        />
        <p>{name}</p>
      </div>
    </div>
  );
};

export default Header;
