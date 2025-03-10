import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/commons/components/dialog.tsx';
import { ScrollArea } from '@/commons/components/scroll-area.tsx';
import { Button } from '@/commons/components/button.tsx';
import { Pencil } from 'lucide-react';
import { UserProfileCard } from '../internal-types/settings.types';

interface ProfileCardViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfileCard;
  onEdit: () => void;
}

export function ProfileCardViewDialog({
  open,
  onOpenChange,
  profile,
  onEdit,
}: ProfileCardViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className="flex items-center space-x-2">
              <span className="truncate">{profile.name}</span>
              {profile.isDefault && (
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap">
                  Mặc định
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center">
                <span className="text-sm font-medium">Tên:</span>
                <span className="col-span-2 text-sm">{profile.name}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-sm font-medium">Số điện thoại:</span>
                <span className="col-span-2 text-sm">{profile.phoneNumber}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-sm font-medium">Email:</span>
                <span className="col-span-2 text-sm break-all">{profile.email}</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
