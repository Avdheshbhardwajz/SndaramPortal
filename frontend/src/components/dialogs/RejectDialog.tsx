import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { RejectDialogProps } from '../../types/rowRequest'

export const RejectDialog: React.FC<RejectDialogProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [comments, setComments] = useState('')

  const handleConfirm = () => {
    onConfirm(comments)
    setComments('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white font-poppins">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter rejection reason..."
            className="min-h-[100px]"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setComments('')
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!comments.trim()}
          >
            Reject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
