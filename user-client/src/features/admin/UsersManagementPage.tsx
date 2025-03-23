import { useState, useCallback, useMemo, useEffect } from "react";
import { adminService } from "./services/admin.service";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { AdminUserInfo, AdminUserFilterParams } from "./internal-types/admin.type";
import { useDataTable } from "@/commons/hooks/use-data-table";
import { DataTable, Column, StatusOption } from "@/commons/components/data-table";
import { Badge } from "@/commons/components/badge";
import { Input } from "@/commons/components/input";
import { Search, UserIcon, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ActionMenu } from "@/commons/components/data-table/ActionMenu";

const UsersManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback((params: AdminUserFilterParams) => {
    return adminService.getUsersList(params);
  }, []);

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

  const statusOptions: StatusOption[] = [
    { value: 'all', label: 'All Users' },
    { value: 'active', label: 'Active', badge: 'success' },
    { value: 'inactive', label: 'Inactive', badge: 'secondary' },
    { value: 'suspended', label: 'Suspended', badge: 'destructive' }
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
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="truncate max-w-[200px]">{user.email}</span>
        </div>
      )
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => (
        <Badge variant={
          user.role === "admin" 
            ? "default" 
            : user.role === "organizer" 
              ? "outline" 
              : "secondary"
        }>
          {user.role === "admin" 
            ? "Admin" 
            : user.role === "organizer" 
              ? "Organizer" 
              : "User"}
        </Badge>
      )
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => (
        <Badge variant={
          user.status === "active" 
            ? "success" 
            : user.status === "inactive" 
              ? "secondary" 
              : "destructive"
        }>
          {user.status === "active" 
            ? "Active" 
            : user.status === "inactive" 
              ? "Inactive" 
              : "Suspended"}
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
  ], []);
  
  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">View and manage platform users</p>
        </header>
        
        {/* Search bar */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name or email..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Main table */}
        <div className="rounded-md border flex-1 flex flex-col h-[calc(100vh-13rem)] bg-background overflow-hidden">
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
            rowActions={(user) => (
              <ActionMenu
                actions={[
                  {
                    label: "View Details",
                    icon: <UserIcon className="h-4 w-4" />,
                    onClick: () => console.log("View user details:", user.id)
                  },
                  {
                    label: user.status === "active" ? "Suspend User" : "Activate User",
                    icon: <UserIcon className="h-4 w-4" />,
                    onClick: () => console.log("Toggle user status:", user.id),
                    variant: user.status === "active" ? "destructive" : "default"
                  }
                ]}
              />
            )}
          />
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default UsersManagementPage;
