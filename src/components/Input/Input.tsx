import React, { CSSProperties, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

interface InputProps {
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  text?: string;
  type?: string;
  styles?: CSSProperties;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ required, onChange, value, text, type, styles, onClick, onKeyDown }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="w-full relative flex flex-col items-start justify-center" style={styles} onClick={onClick}>
      <input
        required={required}
        type={showPassword ? 'text' : type}
        name={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="w-[300px] border-2 border-white rounded-md bg-transparent p-[1rem] text-white pr-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <label className="absolute left-[15px] top-0 text-white pointer-events-none pb-[0.25rem] transition-all ease-in-out duration-200">{text}</label>
      {type === 'password' && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility}>
          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
        </div>
      )}
    </div>
  );
};

export default Input;
