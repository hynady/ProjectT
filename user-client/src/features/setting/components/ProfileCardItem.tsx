import { Card } from "@/commons/components/card.tsx";
import { Button } from "@/commons/components/button.tsx";
import { PenLine, Trash2, Star } from "lucide-react";
import { UserProfileCard } from "../internal-types/settings.types";
import { useState } from "react";
import { toast } from "@/commons/hooks/use-toast";
import { settingsService } from "../services/settings.service";
import { ProfileCardDialog } from "@/features/setting/components/ProfileCardDialog";
import { ProfileCardViewDialog } from "@/features/setting/components/ProfileCardViewDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/commons/components/alert-dialog.tsx";

interface ProfileCardItemProps {
  profile: UserProfileCard;
  onUpdate: () => void;
}

export function ProfileCardItem({ profile, onUpdate }: ProfileCardItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingDefault, setIsTogglingDefault] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (profile.isDefault) {
      toast({
        title: "Không thể xóa",
        description: "Bạn không thể xóa thẻ thông tin mặc định. Hãy đặt một thẻ khác làm mặc định trước.",
        variant: "destructive",
      });
      return;
    }
    
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await settingsService.deleteProfileCard(profile.id);
      toast({
        title: "Thành công",
        description: "Đã xóa thẻ thông tin"
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa thẻ thông tin.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const toggleDefault = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (profile.isDefault) return; // Already default
    
    try {
      setIsTogglingDefault(true);
      await settingsService.updateProfileCard({
        id: profile.id,
        isDefault: true
      });
      toast({
        title: "Thành công",
        description: "Đã đặt thẻ thông tin làm mặc định"
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật thẻ thông tin.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingDefault(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  return (
    <>
      <Card 
        className={`p-4 border hover:shadow-md transition-shadow cursor-pointer ${profile.isDefault ? 'border-primary' : ''}`}
        onClick={() => setShowViewDialog(true)}
      >
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <h3 className="font-medium text-sm mr-2 line-clamp-1">{profile.name}</h3>
              {profile.isDefault && (
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap">
                  Mặc định
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1 shrink-0 ml-2">
              {!profile.isDefault && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={toggleDefault}
                  disabled={isTogglingDefault}
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={handleEditClick}
              >
                <PenLine className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-1">{profile.email}</p>
        </div>
      </Card>
      
      <ProfileCardDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
        profileData={profile}
        mode="edit"
        onSuccess={onUpdate}
      />
      
      <ProfileCardViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        profile={profile}
        onEdit={() => {
          setShowViewDialog(false);
          setShowEditDialog(true);
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thẻ thông tin</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thẻ thông tin này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xử lý..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
