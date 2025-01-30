import type React from "react"
import type { ReactNode } from "react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ open, children }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${open ? "block" : "hidden"}`}>
      <div className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative bg-white rounded-lg">{children}</div>
    </div>
  )
}

interface DialogContentProps {
  children: ReactNode
  className?: string
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>
}

interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => {
  return <div className={className + " flex items-center justify-between border-b pb-4"}>{children}</div>
}

interface DialogTitleProps {
  children: ReactNode
  className?: string
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => {
  return <h2 className={className + " text-lg font-medium"}>{children}</h2>
}

interface DialogDescriptionProps {
  children: ReactNode
  className?: string
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className }) => {
  return (
    <div className={`text-sm text-gray-500 ${className || ''}`}>
      {children}
    </div>
  )
}

interface DialogFooterProps {
  children: ReactNode
  className?: string
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>
}
