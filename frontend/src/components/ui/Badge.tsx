import React from 'react'
import { colors } from '../../constants/colors'

interface BadgeProps {
  count: number
  variant?: 'notification'
}

export const Badge: React.FC<BadgeProps> = ({ count, variant = 'notification' }) => {
  const variants = {
    notification: `absolute -top-1 -right-1 bg-[${colors.notification.red}] text-white 
      text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-medium`
  }

  return (
    <span className={variants[variant]}>
      {count}
    </span>
  )
}
