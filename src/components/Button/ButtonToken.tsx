import React from "react";
import "./ButtonToken.css";

interface ButtonProps {
  text: string;
  onClick: () => void;
}

const ButtonToken: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button className="btn" onClick={onClick}>{text}</button>
  );
};

export default ButtonToken;
