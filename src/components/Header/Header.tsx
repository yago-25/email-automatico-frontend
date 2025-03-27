import React from 'react';
import './header.css';
import { IoIosLogOut } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { messageAlert } from '../../utils/messageAlert';
import mailIcon from './../../../public/mail-svgrepo-com.svg';

interface HeaderProps {
  name?: string;
}

const Header: React.FC<HeaderProps> = ({ name }) => {
  const navigate = useNavigate();

  const logout = () => {
    navigate('/');
    localStorage.removeItem('user');
    messageAlert({
      type: 'success',
      message: 'Logout realizado com sucesso.'
    });
  };

  return (
    <div className="header-container">
        <div className='padding'>
          <img src={mailIcon} width={52} height={52} />
        </div>
        <div className='logout'>
          <img src={`https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=34&rounded=true`} />
          <p>{name}</p>
          <IoIosLogOut className='icon-logout' width={26} onClick={logout} />
        </div>
    </div>
  );
};

export default Header;