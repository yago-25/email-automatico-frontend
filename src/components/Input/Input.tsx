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
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ required, onChange, value, text, type, styles, onClick, onKeyDown }) => {
  return (
    <div className="input-group"  style={styles} onClick={onClick}>
      <input required={required} type={type} name={type} value={value} onChange={onChange} onKeyDown={onKeyDown} className="input" />
      <label className="user-label">{text}</label>
    </div>
  );
};

export default Input;