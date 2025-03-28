import React from "react";
import "./button.css";

interface ButtonProps {
  text: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button className="btne" onClick={onClick}>{text}</button>
  );
};

export default Button;
