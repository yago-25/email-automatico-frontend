import React from "react";
import "./buttonRegister.css";

interface ButtonProps {
  text: string;
  onClick: () => void;
}

const ButtonRegister: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button className="btn" onClick={onClick}>{text}</button>
  );
};

export default ButtonRegister;
