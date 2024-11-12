import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const RejectionModal = ({ isOpen, onClose, onSend }) => {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejection Reason</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Enter the reason for rejection."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mb-4"
        />
        <DialogFooter>
          <Button onClick={() => onSend(reason)} variant="primary">Send</Button>
          <Button onClick={onClose} variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionModal;
