import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/commons/components/dialog";
import { Button } from "@/commons/components/button";
import { UserRole } from "../internal-types/admin.type";
import { toast } from "@/commons/hooks/use-toast";
import { adminService } from "../services/admin.service";
import { RadioGroup, RadioGroupItem } from "@/commons/components/radio-group";
import { Label } from "@/commons/components/label";
import { Loader2, UserCog, UserRound } from "lucide-react";

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

  const handleSubmit = async () => {
    if (selectedRole === currentRole) {
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {" "}
          <DialogTitle>Update User Role</DialogTitle>
          <DialogDescription>
            Change the role for user {userName}. Current role is{" "}            <span className="font-medium">
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
          >            <div className="flex items-center space-x-3">
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
  );
}
