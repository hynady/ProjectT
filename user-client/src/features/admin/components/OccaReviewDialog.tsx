import { useState, useEffect, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/commons/components/dialog";
import { Button } from "@/commons/components/button";
import { AdminOccaUnit, AdminOccaDetail } from "../internal-types/admin.type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/tabs";
import { Calendar, Clock, MapPin, User, Info, Image, CheckCircle, XCircle, Ticket, PencilLine } from "lucide-react";
import { Separator } from "@/commons/components/separator";
import { Badge } from "@/commons/components/badge";
import { format } from "date-fns";
import { Card, CardContent } from "@/commons/components/card";
import { adminService } from "../services/admin.service";
import { SlateContentRenderer } from "@/commons/components/rich-text-editor/slate-content-renderer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/commons/components/accordion";

interface OccaReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occa: AdminOccaUnit;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export function OccaReviewDialog({ 
  open, 
  onOpenChange, 
  occa, 
  onApprove, 
  onReject, 
  onClose 
}: OccaReviewDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<AdminOccaDetail | null>(null);

  useEffect(() => {
    if (open && occa) {
      setLoading(true);
      
      // Fetch detailed data from service
      adminService.getOccaDetail(occa.id)
        .then(data => {
          setDetails(data);
        })
        .catch(error => {
          console.error("Failed to fetch occa details:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, occa]);

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM/yyyy');
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Store the ticket-show assignments in a stable reference
  const [ticketAssignments] = useState(new Map());
  
  // Group tickets by showId - using a stable reference to avoid flickering
  const showsWithTickets = useMemo(() => {
    if (!details) return [];
    
    // Only compute the assignments once when details change
    if (!ticketAssignments.has(details)) {
      const showTicketMap = new Map();
      
      // Pre-populate with empty arrays for all shows
      details.shows.forEach(show => {
        showTicketMap.set(show.id, []);
      });
      
      // Assign tickets to their shows
      details.tickets.forEach(ticket => {
        let assigned = false;
        
        details.shows.forEach(show => {
          // Try to match ticket to show with deterministic criteria
          if (ticket.id.includes(show.id)) {
            showTicketMap.get(show.id).push(ticket);
            assigned = true;
          }
        });
        
        // If ticket wasn't assigned to any show, add it to all shows
        if (!assigned) {
          details.shows.forEach(show => {
            showTicketMap.get(show.id).push(ticket);
          });
        }
      });
      
      ticketAssignments.set(details, showTicketMap);
    }
    
    // Use the stored assignments to create the result
    const showMap = ticketAssignments.get(details);
    return details.shows.map(show => ({
      ...show,
      tickets: showMap.get(show.id) || []
    }));
  }, [details, ticketAssignments]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Review Event Content
          </DialogTitle>
          <DialogDescription>
            Review the event details before making an approval decision
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="pb-2">
                {/* Banner image */}
                <div className="w-full aspect-video bg-muted relative rounded-md overflow-hidden mb-4">
                  {details?.basicInfo.bannerUrl ? (
                    <img 
                      src={details.basicInfo.bannerUrl} 
                      alt={details.basicInfo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted">
                      <Image className="w-8 h-8 text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">No banner image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{details?.basicInfo.title}</h2>
                  <Badge variant={
                    details?.submissionDetails.approvalStatus === "approved" ? "success" :
                    details?.submissionDetails.approvalStatus === "pending" ? "warning" :
                    "destructive"
                  }>
                    {details?.submissionDetails.approvalStatus === "approved" ? "Approved" :
                    details?.submissionDetails.approvalStatus === "pending" ? "Pending Approval" :
                    "Rejected"}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Submitted by {details?.basicInfo.organizerName}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>Submitted on {details && formatDate(details.submissionDetails.submittedAt)}</span>
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="sticky top-2 z-10 border-2 m-">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="shows">Shows & Tickets</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-4">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="p-1 pb-4 mt-0">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium flex items-center mb-2">
                            <Info className="w-4 h-4 mr-2" />
                            Event Details
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 mr-2 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="font-medium">{details?.basicInfo.location}</div>
                                <div className="text-sm text-muted-foreground">{details?.basicInfo.address}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium">Description</h3>
                          <Card className="border-muted/40">
                            <CardContent className="p-4 max-w-none">
                              {details?.basicInfo.description && (
                                <SlateContentRenderer content={details.basicInfo.description} />
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Shows & Tickets Tab */}
                    <TabsContent value="shows" className="p-1 pb-4 mt-0">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Shows & Tickets
                          </h3>
                          
                          <Accordion type="single" collapsible className="w-full">
                            {showsWithTickets.map((show) => (
                              <AccordionItem key={show.id} value={show.id}>
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-primary/10 p-2 rounded-md">
                                        <Calendar className="h-4 w-4 text-primary" />
                                      </div>
                                      <div className="text-left">
                                        <div className="font-medium">{formatDate(show.date)}</div>
                                        <div className="text-sm text-muted-foreground">{show.time}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <Badge variant="outline">
                                        {show.tickets.length} ticket types
                                      </Badge>
                                    </div>
                                  </div>
                                </AccordionTrigger>                                <AccordionContent>
                                  <div className="pl-10 pt-2 pb-1 space-y-3">
                                    {show.tickets.map((ticket: {id: string, type: string, price: number, quantity: number}) => (
                                      <div 
                                        key={ticket.id}
                                        className="bg-muted/50 p-3 rounded-md flex justify-between items-center"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Ticket className="h-4 w-4 text-primary/70" />
                                          <div>
                                            <div className="font-medium">{ticket.type}</div>
                                            <div className="text-xs text-muted-foreground">
                                              Available: {ticket.quantity} tickets
                                            </div>
                                          </div>
                                        </div>
                                        <div className="font-medium">
                                          {formatCurrency(ticket.price)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Gallery Tab */}
                    <TabsContent value="gallery" className="p-1 pb-4 mt-0">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium flex items-center">
                          <Image className="w-4 h-4 mr-2" />
                          Event Gallery
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {details?.gallery.map((image) => (
                            <div key={image.id} className="aspect-square rounded-md overflow-hidden bg-muted">
                              <img 
                                src={image.url} 
                                alt="Gallery image" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.parentElement) {
                                    const fallbackElement = document.createElement('div');
                                    e.currentTarget.parentElement.appendChild(fallbackElement);
                                    fallbackElement.classList.add('flex', 'items-center', 'justify-center', 'w-full', 'h-full', 'text-muted-foreground');
                                    fallbackElement.innerHTML = '<svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                  }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
              <DialogFooter className="pt-4 border-t mt-4">
              {/* Hiển thị các nút hành động dựa trên trạng thái hiện tại */}
              {details?.submissionDetails.approvalStatus === "pending" ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={onReject}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={onApprove}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </>
              ) : details?.submissionDetails.approvalStatus === "approved" ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={onReject}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Change to Rejected
                  </Button>
                </>
              ) : details?.submissionDetails.approvalStatus === "rejected" ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={onApprove}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Change to Approved
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={onReject}
                  >
                    <PencilLine className="w-4 h-4 mr-2" />
                    Update Rejection Reason
                  </Button>
                </>
              ) : (
                <Button onClick={onClose}>Close</Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
