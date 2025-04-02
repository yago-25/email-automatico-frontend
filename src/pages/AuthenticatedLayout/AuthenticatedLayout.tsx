import { PropsWithChildren } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './authenticated-layout.css';

const AuthenticatedLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="authenticated-layout">
      <Sidebar />
      <div className="authenticated-content">
        {children}
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
