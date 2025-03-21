import React from "react";
import './input.css';

interface InputProps {
    required: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
    text: string;
    type: string;
}

const Input: React.FC<InputProps> = ({ required, onChange, value, text, type }) => {
  return (
    <div className="input-container">
      <input type={type} value={value} onChange={onChange} id="input" required={required} />
      <label htmlFor="input" className="label">
        {text}
      </label>
      <div className="underline"></div>
    </div>
  );
};

export default Input;