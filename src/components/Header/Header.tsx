import React from 'react';
import './header.css';
import { useNavigate } from 'react-router-dom';
import { User } from "../../models/User";

interface HeaderProps {
  name?: string;
}
const storedUser = localStorage.getItem("user");
const authUser: User | null = storedUser ? JSON.parse(storedUser) : null;

const Header: React.FC<HeaderProps> = ({ name }) => {
  const navigate = useNavigate();

  return (
    <div className="header-container">
        <div className='padding'>
        </div>
        <div className='logout' style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
        <img
            src={
              authUser?.url ||
              `https://ui-avatars.com/api/?name=${authUser?.nome_completo}&background=0D8ABC&color=fff&size=128&rounded=true`
            }
            alt="Avatar"
            style={{ width: '34px', height: '34px', borderRadius: '50%' }}
          />
          <p>{name}</p>
        </div>
    </div>
  );
};

export default Header;