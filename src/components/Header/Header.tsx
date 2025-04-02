import React from 'react';
import './header.css';

interface HeaderProps {
  name?: string;
}

const Header: React.FC<HeaderProps> = ({ name }) => {
  return (
    <div className="header-container">
        <div className='padding'>
        </div>
        <div className='logout'>
          <img src={`https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=34&rounded=true`} />
          <p>{name}</p>
        </div>
    </div>
  );
};

export default Header;