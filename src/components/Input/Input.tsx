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
  ref?: React.Ref<HTMLInputElement>;
  width?: number;
  className?: string;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  required,
  onChange,
  value,
  text,
  type,
  styles,
  onClick,
  onKeyDown,
  ref,
  width,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="w-full h-12 relative flex rounded-xl" style={styles}>
      <div className="w-full flex items-center justify-center h-12 gap-2">
        <input
          ref={ref}
          onChange={onChange}
          value={value}
          onClick={onClick}
          onKeyDown={onKeyDown}
          required={required}
          className={`peer ${width ? `w-[${width}px]` : ' w-full'} h-full text-blue-500 bg-transparent outline-none px-4 text-base rounded-xl bg-white border border-[#4070f4] focus:shadow-md`}
          id={text}
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={text}
        />
        {type === 'password' && (
          <div onClick={togglePasswordVisibility}>
            {showPassword ? (
              <FaRegEye className="w-6 h-6 text-white cursor-pointer" />
            ) : (
              <FaRegEyeSlash className="w-6 h-6 text-white cursor-pointer" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
