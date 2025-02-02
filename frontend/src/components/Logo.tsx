import React from "react";
import logo from "../assets/images/Logo-Full.svg";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => (
  <img src={logo} alt="Sundaram Finance" className={className} />
);
