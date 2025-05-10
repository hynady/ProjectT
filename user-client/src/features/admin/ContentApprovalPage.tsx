import { useState, useCallback, useMemo, useEffect } from "react";
import { adminService } from "./services/admin.service";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { AdminOccaUnit, OccaFilterParams } from "./internal-types/admin.type";
import { useDataTable } from "@/commons/hooks/use-data-table";
import { DataTable, Column, StatusOption } from "@/commons/components/data-table";
import { Badge } from "@/commons/components/badge";
import { Button } from "@/commons/components/button";
import { Input } from "@/commons/components/input";
import { 
  Search, 
  Calendar, 
  Eye
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/commons/components/dialog";
import { Textarea } from "@/commons/components/textarea";
import { toast } from "@/commons/hooks/use-toast";
import { ActionMenu } from "@/commons/components/data-table/ActionMenu";
import { format } from "date-fns";
import { OccaReviewDialog } from "./components/OccaReviewDialog";

const ContentApprovalPage = () => {
  const [searchTerm, setSearchTerm] = useState("");  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedOcca, setSelectedOcca] = useState<AdminOccaUnit | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback((params: OccaFilterParams) => {
    return adminService.getOccas(params);
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
    refreshData,
    handleSearchChange,
  } = useDataTable<AdminOccaUnit, OccaFilterParams>({
    defaultSortField: "submittedAt",
    defaultSortDirection: "desc",
    fetchData,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchChange(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearchChange]);

  // Open the review dialog to examine content before approval/rejection
  const handleReviewClick = (occa: AdminOccaUnit) => {
    setSelectedOcca(occa);
    setIsReviewDialogOpen(true);
  };  // From the review dialog, open the approve dialog
  const handleApproveClick = () => {
    setIsReviewDialogOpen(false);
    setIsApproveDialogOpen(true);
  };

  // From the review dialog, open the reject dialog
  const handleRejectClick = () => {
    // Nếu đã reject trước đó, hiển thị lý do đã có
    if (selectedOcca?.approvalStatus === "rejected") {
      setRejectionReason(selectedOcca.rejectionReason || "");
    } else {
      setRejectionReason("");
    }
    setIsReviewDialogOpen(false);
    setIsRejectDialogOpen(true);
  };  const handleApproveSubmit = async () => {
    if (!selectedOcca) return;
    
    try {
      setIsSubmitting(true);
      
      const prevStatus = selectedOcca.approvalStatus;
      await adminService.updateOccaStatus(selectedOcca.id, {
        status: 'approved'
      });
      
      toast({
        title: prevStatus === 'approved' ? "Status updated" : "Event approved",
        description: prevStatus === 'approved' 
          ? `${selectedOcca.title} update processed successfully.`
          : `${selectedOcca.title} has been approved successfully.`,
        variant: "success",
      });
      
      setIsApproveDialogOpen(false);
      refreshData();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update the event status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRejectSubmit = async () => {
    if (!selectedOcca) return;
    
    if (!rejectionReason.trim()) {
      toast({
        title: "Required field",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const prevStatus = selectedOcca.approvalStatus;
      await adminService.updateOccaStatus(selectedOcca.id, {
        status: 'rejected',
        rejectionReason: rejectionReason
      });
      
      toast({
        title: prevStatus === 'rejected' ? "Rejection updated" : "Event rejected",
        description: prevStatus === 'rejected'
          ? `${selectedOcca.title} rejection reason updated.`
          : `${selectedOcca.title} has been rejected.`,
        variant: "success",
      });
      
      setIsRejectDialogOpen(false);
      refreshData();
    } catch {
      toast({
        title: "Error",
        description: "Failed to reject the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAllDialogs = () => {
    setIsReviewDialogOpen(false);
    setIsApproveDialogOpen(false);
    setIsRejectDialogOpen(false);
    setSelectedOcca(null);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const statusOptions: StatusOption[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending', badge: 'warning' },
    { value: 'approved', label: 'Approved', badge: 'success' },
    { value: 'rejected', label: 'Rejected', badge: 'destructive' }
  ];

  const columns: Column<AdminOccaUnit>[] = useMemo(() => [
    {
      id: "title",
      header: "Event Name",
      sortable: true,
      truncate: true,
      cell: (occa) => (
        <div className="flex items-center space-x-2 max-w-full">
          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {occa.image ? (
              <img 
                src={occa.image} 
                alt={occa.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    const fallbackElement = document.createElement('div');
                    e.currentTarget.parentElement.appendChild(fallbackElement);
                    fallbackElement.innerHTML = '<svg class="w-full h-full p-2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="m17 22 5-5"/><path d="m17 17 5 5"/></svg>';
                  }
                }}
              />
            ) : (
              <Calendar className="w-full h-full p-2 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1 overflow-hidden">
            <p className="font-medium truncate">{occa.title}</p>
            <p className="text-sm text-muted-foreground truncate">by {occa.organizerName}</p>
          </div>
        </div>
      )
    },
    {
      id: "location",
      header: "Location",
      sortable: true,
      truncate: true,
      cell: (occa) => (
        <div className="overflow-hidden">
          <p className="truncate">{occa.location}</p>
        </div>
      )
    },
    {
      id: "submittedAt",
      header: "Submitted",
      sortable: true,
      cell: (occa) => (
        <div className="text-sm">{formatDate(occa.submittedAt)}</div>
      )
    },
    {
      id: "approvalStatus",
      header: "Status",
      align: "center",
      cell: (occa) => (
        <div className="flex justify-center">
          <Badge
            variant={
              occa.approvalStatus === "approved"
                ? "success"
                : occa.approvalStatus === "pending"
                ? "warning"
                : "destructive"
            }
            className="whitespace-nowrap"
          >
            {occa.approvalStatus === "approved" ? "Approved" :
             occa.approvalStatus === "pending" ? "Pending" :
             "Rejected"}
          </Badge>
        </div>
      )
    },
  ], []);
  
  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Content Approval</h1>
          <p className="text-muted-foreground">Review and manage event submissions</p>
        </header>
        
        {/* Search bar */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
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
            searchQuery={searchTerm}            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            refreshData={refreshData}
            onSortChange={handleSortChange}
            onStatusChange={handleStatusChange}
            rowActions={(occa) => (
              <ActionMenu
                actions={[
                  {
                    label: occa.approvalStatus === "pending" ? "Review & Approve" : "View Details",
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => handleReviewClick(occa)
                  }
                ]}
              />
            )}
          />
        </div>
      </div>
      
      {/* Review Dialog */}
      {selectedOcca && (
        <OccaReviewDialog
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          occa={selectedOcca}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          onClose={handleCloseAllDialogs}
        />
      )}
      
      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-h-[90vh]">          <DialogHeader>            <DialogTitle>
              {selectedOcca?.approvalStatus === 'approved' 
                ? 'Update Approved Event' 
                : 'Approve Event'}
            </DialogTitle>
            <DialogDescription>
              {selectedOcca?.approvalStatus === 'approved'
                ? 'Are you sure you want to keep this event approved?'
                : `Are you sure you want to approve "${selectedOcca?.title}"?`}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApproveSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting 
                ? (selectedOcca?.approvalStatus === 'approved' ? "Updating..." : "Approving...") 
                : (selectedOcca?.approvalStatus === 'approved' ? "Update Approval" : "Approve Event")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-h-[90vh]">          <DialogHeader>
            <DialogTitle>
              {selectedOcca?.approvalStatus === 'rejected' 
                ? 'Update Rejection Reason' 
                : 'Reject Event'}
            </DialogTitle>
            <DialogDescription>
              {selectedOcca?.approvalStatus === 'rejected'
                ? `Update the rejection reason for "${selectedOcca?.title}"`
                : `Please provide a reason for rejecting "${selectedOcca?.title}"`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 overflow-y-auto max-h-[40vh] px-1">
            <label className="text-sm font-medium">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <Textarea 
              placeholder="Explain why this event is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-1.5"
              required
            />
            {!rejectionReason.trim() && (
              <p className="text-xs text-red-500 mt-1">Reason is required</p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={isSubmitting || !rejectionReason.trim()}
              loading={isSubmitting}
            >
              {isSubmitting 
                ? (selectedOcca?.approvalStatus === 'rejected' ? "Updating..." : "Rejecting...") 
                : (selectedOcca?.approvalStatus === 'rejected' ? "Update Rejection" : "Reject Event")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
};

export default ContentApprovalPage;
