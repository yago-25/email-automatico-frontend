import './spin.css';

interface SpinProps {
  color?: string;
}

const Spin: React.FC<SpinProps> = ({ color }) => {
  return (
    <div className="loader">
      <div className={`justify-content-center jimu-primary-loading ${color ? 'jimu-primary-loading-blue' : 'jimu-primary-loading'}`}></div>
    </div>
  );
};

export default Spin;
