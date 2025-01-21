import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";

interface ConfirmCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmCancelDialog = ({
                                      isOpen,
                                      onClose,
                                      onConfirm,
                                    }: ConfirmCancelDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xác nhận hủy đặt vé</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn hủy đặt vé không? Thao tác này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Tiếp tục đặt vé
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            Hủy đặt vé
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};