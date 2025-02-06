import React from "react";
import { colors } from "../../constants/colors";

interface BadgeProps {
  count?: number;
  variant?: "notification" | "destructive";
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  variant = "notification",
  children,
  className,
}) => {
  const variants = {
    notification: `bg-[${colors.notification.red}] text-white text-[10px] rounded-full flex items-center justify-center font-medium`,
    destructive: `bg-destructive text-destructive-foreground`,
  };

  return (
    <span className={`${variants[variant]} ${className || ""}`}>
      {children || count}
    </span>
  );
};
