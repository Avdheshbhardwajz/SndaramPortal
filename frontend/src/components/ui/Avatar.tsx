import React from 'react'
import { colors } from '../../constants/colors'

interface AvatarProps {
  initial: string
  size?: 'default' | 'small' | 'large'
}

export const Avatar: React.FC<AvatarProps> = ({ initial, size = 'default' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-[${colors.background.light}] flex items-center justify-center`}
    >
      {initial}
    </div>
  )
}
