import { useState, useCallback, useMemo, useEffect } from "react";
import { adminService } from "./services/admin.service";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { AdminUserInfo, AdminUserFilterParams } from "./internal-types/admin.type";
import { useDataTable } from "@/commons/hooks/use-data-table";
import { DataTable, Column, StatusOption } from "@/commons/components/data-table";
import { Badge } from "@/commons/components/badge";
import { Input } from "@/commons/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/commons/components/select";
import { Search, UserIcon, Calendar, Eye, PowerIcon, Shield } from "lucide-react";
import { format } from "date-fns";
import { ActionMenu } from "@/commons/components/data-table/ActionMenu";
import { UserDetailsDialog } from "./components/UserDetailsDialog";
import { SetRoleDialog } from "./components/SetRoleDialog";
import { toast } from "@/commons/hooks/use-toast";

const UsersManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserInfo | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const fetchData = useCallback((params: AdminUserFilterParams) => {
    return adminService.getUsersList({
      ...params,
      role: roleFilter !== "all" ? roleFilter : undefined
    });  }, [roleFilter]);

  const {
    data,
    loading,
    error,
    totalItems,
    totalPages,
    isLast,
    isFirst,
    page,
    pageSize,
    sortField,
    sortDirection,
    statusFilter,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleStatusChange,
    handleSearchChange,
    refreshData,
  } = useDataTable<AdminUserInfo, AdminUserFilterParams>({
    defaultSortField: "name",
    defaultSortDirection: "asc",
    fetchData,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchChange(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearchChange]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const handleViewUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setShowDetailsDialog(true);
  };
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      await adminService.updateUserStatus(userId, { status: newStatus as 'active' | 'inactive' });
      
      toast({
        title: "Status updated",
        description: `User status changed to ${newStatus}`,
        variant: "success"
      });
      
      refreshData();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleSetRole = (user: AdminUserInfo) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const statusOptions: StatusOption[] = [
    { value: 'all', label: 'All Users' },
    { value: 'active', label: 'Active', badge: 'success' },
    { value: 'inactive', label: 'Inactive', badge: 'secondary' }
  ];

  const roleOptions: StatusOption[] = [
    { value: 'all', label: 'All Roles' },
    { value: 'role_user', label: 'Users', badge: 'secondary' },
    { value: 'role_admin', label: 'Administrators', badge: 'default' }
  ];

  const columns: Column<AdminUserInfo>[] = useMemo(() => [
    {
      id: "name",
      header: "Name",
      sortable: true,
      truncate: true,
      cell: (user) => (
        <div className="flex items-center space-x-2 max-w-full">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium truncate">{user.name}</p>
          </div>
        </div>
      )
    },
    {
      id: "email",
      header: "Email",
      sortable: true,
      cell: (user) => (
        <div className="flex items-center space-x-2">
          <span className="truncate max-w-[200px]">{user.email}</span>
        </div>
      )
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => (
        <Badge variant={user.role === "role_admin" ? "default" : "secondary"}>
          {user.role === "role_admin" ? "Admin" : "User"}
        </Badge>
      )
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => (
        <Badge variant={user.status === "active" ? "success" : "secondary"}>
          {user.status === "active" ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      id: "createdAt",
      header: "Created At",
      sortable: true,
      cell: (user) => (
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          <span>{formatDate(user.createdAt)}</span>
        </div>
      )
    },
    {
      id: "lastActive",
      header: "Last Active",
      sortable: true,
      cell: (user) => (
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          <span>{formatDate(user.lastActive)}</span>
        </div>
      )
    }
  ], []);
  
  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">View and manage platform users</p>
        </header>
        
        {/* Search bar */}        <div className="flex gap-4 items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users by name or email..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>          {/* Role filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Main table */}        <div className="rounded-md border flex-1 flex flex-col h-[calc(100vh-13rem)] bg-background overflow-hidden">
          <DataTable
            data={data}
            columns={columns}
            isLoading={loading}
            error={error}
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            isLast={isLast}
            isFirst={isFirst}
            sortField={sortField}
            sortDirection={sortDirection as 'asc' | 'desc'}            
            statusOptions={statusOptions}
            statusFilter={statusFilter}
            searchQuery={searchTerm}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSortChange={handleSortChange}
            onStatusChange={handleStatusChange}
            refreshData={refreshData}
            rowActions={(user) => (              <ActionMenu
                actions={[
                  {
                    label: "View Details",
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => handleViewUserDetails(user.id)
                  },
                  {
                    label: "Set Role",
                    icon: <Shield className="h-4 w-4" />,
                    onClick: () => handleSetRole(user)
                  },
                  {
                    label: user.status === "active" ? "Disable User" : "Enable User",
                    icon: <PowerIcon className="h-4 w-4" />,
                    onClick: () => handleToggleUserStatus(user.id, user.status),
                    variant: user.status === "active" ? "destructive" : "default"
                  }
                ]}
              />
            )}
          />
        </div>
      </div>      {/* User Details Dialog */}
      {selectedUserId && (
        <UserDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          userId={selectedUserId}
          onStatusUpdate={refreshData}
        />
      )}

      {/* Set Role Dialog */}
      {selectedUser && (
        <SetRoleDialog
          open={showRoleDialog}
          onOpenChange={setShowRoleDialog}
          userId={selectedUser.id}
          userName={selectedUser.name}
          currentRole={selectedUser.role}
          onRoleUpdate={refreshData}
        />
      )}
    </AdminDashboardLayout>
  );
};

export default UsersManagementPage;
