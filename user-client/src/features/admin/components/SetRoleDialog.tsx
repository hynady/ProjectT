import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/commons/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/commons/components/alert-dialog";
import { Button } from "@/commons/components/button";
import { UserRole } from "../internal-types/admin.type";
import { toast } from "@/commons/hooks/use-toast";
import { adminService } from "../services/admin.service";
import { RadioGroup, RadioGroupItem } from "@/commons/components/radio-group";
import { Label } from "@/commons/components/label";
import { Loader2, UserCog, UserRound } from "lucide-react";
import { clearAdminStatus } from "@/features/auth/utils/role-utils";
import { useUser } from "@/features/auth/contexts/UserContext";

interface SetRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentRole: UserRole;
  userName: string;
  onRoleUpdate?: () => void;
}

export function SetRoleDialog({
  open,
  onOpenChange,
  userId,
  currentRole,
  userName,
  onRoleUpdate,
}: SetRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelfUpdate, setIsSelfUpdate] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { userData, refreshUserData } = useUser();
  const navigate = useNavigate();

  // Check if user is updating their own role
  useEffect(() => {
    if (userData?.id === userId) {
      setIsSelfUpdate(true);
    } else {
      setIsSelfUpdate(false);
    }
  }, [userId, userData?.id]);
  const handleSubmit = async () => {
    if (selectedRole === currentRole) {
      onOpenChange(false);
      return;
    }

    // Show a warning if admin is demoting themselves
    if (isSelfUpdate && selectedRole === "role_user" && currentRole === "role_admin") {
      setShowConfirmDialog(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.updateUserRole(userId, { role: selectedRole });

      toast({
        title: "Role updated",
        description: `User role changed to ${selectedRole === "role_user" ? "User" : "Administrator"}`,
        variant: "success",
      });

      // If user demoted themselves, clear admin status and redirect
      if (isSelfUpdate && selectedRole === "role_user" && currentRole === "role_admin") {
        // Clear cached admin status
        clearAdminStatus();
        
        // Refresh user data to update UI
        await refreshUserData();
        
        // Close dialog and redirect to home page
        onOpenChange(false);
        navigate("/", { replace: true });
        return;
      }

      if (onRoleUpdate) {
        onRoleUpdate();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDemotion = async () => {
    setShowConfirmDialog(false);
    
    try {
      setIsSubmitting(true);
      await adminService.updateUserRole(userId, { role: selectedRole });

      toast({
        title: "Role updated",
        description: "Your role has been changed to User. You've been redirected to the home page.",
        variant: "success",
      });

      // Clear cached admin status
      clearAdminStatus();
      
      // Refresh user data to update UI
      await refreshUserData();
      
      // Close dialog and redirect to home page
      onOpenChange(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update your role. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            {" "}
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Change the role for user {userName}. Current role is{" "}
              <span className="font-medium">
                {currentRole === "role_user" ? "User" : "Administrator"}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {" "}
            <RadioGroup
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="role_user" id="user-role" />
                <UserRound className="h-4 w-4" />
                <Label htmlFor="user-role">
                  User
                  {currentRole === "role_user" && selectedRole === "role_user" && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Current)
                    </span>
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="role_admin" id="admin-role" />
                <UserCog className="h-4 w-4" />
                <Label htmlFor="admin-role">
                  Administrator
                  {currentRole === "role_admin" && selectedRole === "role_admin" && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Current)
                    </span>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedRole === currentRole}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for confirming admin self-demotion */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin Privileges</AlertDialogTitle>
            <AlertDialogDescription>
              Warning: You are about to remove your own admin privileges.
              You will be redirected to the home page and lose access to admin features.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDemotion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
