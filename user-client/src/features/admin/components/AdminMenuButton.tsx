import { Link } from "react-router-dom";
import { FileCheck, FileUser, LayoutDashboard, ShieldIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/commons/components/dropdown-menu";
import { Button } from "@/commons/components/button";
import { useEffect, useState } from "react";
import { checkAdminAccess, clearAdminStatus } from "@/features/auth/utils/role-utils";
import { useAuth } from "@/features/auth/contexts";

export function AdminMenuButton() {
  const { isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  // Check admin status directly with API when component mounts
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!isAuthenticated) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }      try {
        // Clear any cached admin status
        clearAdminStatus();
        
        // Make a direct API call to verify current admin status
        const isUserAdmin = await checkAdminAccess(true); // Force a fresh check
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error('Error checking admin status for menu:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminStatus();
    
    // Set up interval to check admin status regularly (every 30 seconds)
    const intervalId = setInterval(verifyAdminStatus, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  // Show nothing while loading or if not admin
  if (loading || !isAdmin) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1">
          <ShieldIcon className="h-4 w-4" />
          <span>Admin</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem asChild>
          <Link to="/admin" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Bảng thông số chung
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/approval" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Kiểm duyệt nội dung
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/users" className="flex items-center gap-2">
            <FileUser className="h-4 w-4" />
            Quản lý người dùng
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
