import { useState, useEffect } from "react";
import { adminService } from "../services/admin.service";
import { AdminUserDetail, UserStatus } from "../internal-types/admin.type";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/commons/components/dialog";
import { Button } from "@/commons/components/button";
import { Switch } from "@/commons/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/commons/components/card";
import { Separator } from "@/commons/components/separator";
import { format } from "date-fns";
import { toast } from "@/commons/hooks/use-toast";
import { Loader2, User, Calendar, MailIcon, PhoneIcon, Clock } from "lucide-react";
import { Badge } from "@/commons/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/commons/components/avatar";

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onStatusUpdate?: () => void;
}

export function UserDetailsDialog({ 
  open, 
  onOpenChange, 
  userId,
  onStatusUpdate 
}: UserDetailsDialogProps) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserData();
    }
  }, [open, userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await adminService.getUserDetails(userId);
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to load user details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!user) return;

    try {
      setIsUpdatingStatus(true);
      const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
      
      await adminService.updateUserStatus(user.id, { status: newStatus });
      
      // Update local state
      setUser(prev => prev ? {...prev, status: newStatus} : null);
      
      toast({
        title: "Status updated",
        description: `User status changed to ${newStatus}`,
        variant: "success"
      });
      
      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (err) {
      console.error("Error updating user status:", err);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading user details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchUserData()}>Retry</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">User Details</DialogTitle>
          <DialogDescription>
            View and manage user information
          </DialogDescription>
        </DialogHeader>

        {/* User header information */}
        <div className="flex items-center space-x-4 mt-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MailIcon className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center mt-1 space-x-3">
                <Badge variant={user.role === 'role_admin' ? "default" : "secondary"}>
                {user.role === 'role_admin' ? "Admin" : "User"}
                </Badge>
              <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                {user.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm mr-2">
              {user.status === 'active' ? 'Active' : 'Inactive'}
            </span>
            <Switch 
              checked={user.status === 'active'}
              onCheckedChange={handleStatusToggle}
              disabled={isUpdatingStatus}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* User details in tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Basic Info</TabsTrigger>
            <TabsTrigger value="profiles">User Profiles</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="info" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p>{user.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Active</p>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      {formatDate(user.lastActive)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* User Profiles Tab */}
          <TabsContent value="profiles" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                {user.profiles.length > 0 ? (
                  <div className="space-y-4">
                    {user.profiles.map(profile => (
                      <div key={profile.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-1">
                              <h3 className="font-medium text-sm mr-2">{profile.name}</h3>
                              {profile.isDefault && (
                                <Badge variant="outline" className="text-primary bg-primary/10">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <PhoneIcon className="h-3.5 w-3.5 mr-1.5" />
                                <span>{profile.phoneNumber}</span>
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <MailIcon className="h-3.5 w-3.5 mr-1.5" />
                                <span>{profile.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No profiles found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Statistics Tab */}
          <TabsContent value="stats" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Events Attended</p>
                    <p className="text-xl font-semibold">{user.stats.eventsAttended}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Tickets Purchased</p>
                    <p className="text-xl font-semibold">{user.stats.ticketsPurchased}</p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Events Organized</p>
                      <p className="text-xl font-semibold">{user.stats.eventsOrganized}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                    <p className="text-xl font-semibold">{formatCurrency(user.stats.totalSpent)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
