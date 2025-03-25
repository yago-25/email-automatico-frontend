import './header.css';
import { IoIosLogOut } from "react-icons/io";


const Header = () => {
  return (
    <div className="header-container">
        <div>a</div>
        <div className='logout'>
          <p>Bruna</p>
          <IoIosLogOut className='icon-logout' />
        </div>
    </div>
  );
};

export default Header;