import React from 'react';
import './header.css';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  name?: string;
}

const Header: React.FC<HeaderProps> = ({ name }) => {
  const navigate = useNavigate();

  return (
    <div className="header-container">
        <div className='padding'>
        </div>
        <div className='logout' style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          <img src={`https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=34&rounded=true`} />
          <p>{name}</p>
        </div>
    </div>
  );
};

export default Header;