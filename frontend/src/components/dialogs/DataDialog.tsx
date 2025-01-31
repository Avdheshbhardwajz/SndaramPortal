import React from 'react'
import { Dialog, DialogContent } from '../../components/ui/Dialog'
import { DataDialogProps } from '../../types/rowRequest'

export const DataDialog: React.FC<DataDialogProps> = ({ isOpen, onClose, data }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="w-[50vw] h-[50vh] overflow-y-auto bg-white font-poppins rounded-lg p-6">
      <div className="absolute right-4 top-4">
        <button
          onClick={onClose}
          className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-50 transition-colors group"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500 group-hover:text-red-500"
          >
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-1.5">
            <div className="text-sm font-medium text-gray-700">{key}</div>
            <div className="text-sm text-gray-600">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </div>
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
)
