import React, { CSSProperties } from "react";
import './input.css';

interface InputProps {
    required?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    text?: string;
    type?: string;
    styles?: CSSProperties;
    onClick?: () => void;
}

const Input: React.FC<InputProps> = ({ required, onChange, value, text, type, styles, onClick }) => {
  return (
    <div className="input-group"  style={styles} onClick={onClick}>
      <input required={required} type={type} name={type} value={value} onChange={onChange} className="input" />
      <label className="user-label">{text}</label>
    </div>
  );
};

export default Input;