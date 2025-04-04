import React, { CSSProperties } from "react";
import "./button.css";

interface ButtonProps {
  text: string;
  onClick: () => void;
  styles?: CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ text, onClick, styles }) => {
  return (
    <button className="btne" onClick={onClick} style={styles}>{text}</button>
  );
};

export default Button;
