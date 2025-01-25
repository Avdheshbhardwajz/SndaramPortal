import React from 'react'
import { colors } from '../../constants/colors'

interface IconButtonProps {
  icon: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'pagination'
  className?: string
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  onClick, 
  disabled = false,
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: `hover:bg-[${colors.background.light}] rounded transition-colors`,
    pagination: `h-10 w-10 flex items-center justify-center rounded-lg border 
      border-[${colors.border.medium}] disabled:border-[${colors.border.default}] 
      text-[${colors.primary.text}] disabled:text-[${colors.border.medium}] 
      hover:border-[${colors.border.dark}] disabled:hover:border-[${colors.border.default}] 
      transition-colors`
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${className}`}
    >
      {icon}
    </button>
  )
}
