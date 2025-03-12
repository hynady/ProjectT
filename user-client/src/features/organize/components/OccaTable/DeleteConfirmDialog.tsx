import { Trash2 } from "lucide-react";
import { Button } from "@/commons/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/commons/components/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteConfirmDialog = ({ open, onOpenChange, onConfirm }: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa sự kiện</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Sự kiện sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
