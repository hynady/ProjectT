import { QRCodeSVG } from "qrcode.react";
import { format, parseISO } from "date-fns";
import { Button } from "@/commons/components/button.tsx";
import {
  Download,
  CheckCircle,
  Calendar,
  Clock,
  Tag,
  MapPin,
  Share2, ExternalLink, XCircle, Banknote
} from "lucide-react";
import { cn } from "@/commons/lib/utils/utils";
import { TicketDisplayUnit } from "@/features/my-ticket/internal-types/ticket.type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/commons/components/dialog.tsx";
import { ScrollArea } from "@/commons/components/scroll-area.tsx";
import { Separator } from "@/commons/components/separator.tsx";
import { Card, CardContent } from "@/commons/components/card.tsx";
import React from "react";
import { isTicketCheckedIn, isTicketExpired } from "@/commons/lib/utils/ticketUtils";
import { useToast } from "@/commons/hooks/use-toast";

interface TicketModalProps {
  ticket: TicketDisplayUnit;
  onClose: () => void;
}

interface InfoItemProps {
  icon: React.ElementType;
  label?: string;
  value: React.ReactNode;
  className?: string;
}

const InfoItem = ({icon: Icon, label, value, className}: InfoItemProps) => (
  <div className={cn("flex items-center space-x-3", className)}>
    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <span className="font-medium">{value}</span>
    </div>
  </div>
);

export const TicketModal = ({ticket, onClose}: TicketModalProps) => {
  const { toast } = useToast();
  const currentDate = new Date();
  const checkedIn = isTicketCheckedIn(ticket);
  const expired = isTicketExpired(ticket, currentDate);

  const handleDownload = () => {
    // In a real app, this would generate a PDF or image of the ticket
    toast({
      title: "Đang tải vé",
      description: "Vé của bạn đang được tải xuống..."
    });
    
    setTimeout(() => {
      toast({
        title: "Tải vé thành công",
        description: "Vé đã được tải xuống vào thiết bị của bạn",
        variant: "success"
      });
    }, 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Vé cho ${ticket.occa.title}`,
        text: `Vé của tôi cho ${ticket.occa.title} tại ${ticket.occa.location} vào ngày ${format(new Date(ticket.show.date), 'dd/MM/yyyy')} lúc ${ticket.show.time}`,
        url: window.location.href,
      }).catch(() => {
        toast({
          title: "Chia sẻ không thành công",
          description: "Không thể chia sẻ vé. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết vé đã được sao chép vào clipboard",
        variant: "success"
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-center text-xl sm:text-2xl font-bold">
                {ticket.occa.title}
              </DialogTitle>
            </DialogHeader>

            {/* Ticket status banner */}
            {(checkedIn || expired) && (
              <div className={cn(
                "mt-4 p-3 rounded-lg flex items-center justify-center gap-2",
                checkedIn ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : 
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              )}>
                {checkedIn ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Đã check-in vào {ticket.ticket.checkedInAt ? format(parseISO(ticket.ticket.checkedInAt), 'HH:mm, dd/MM/yyyy') : ''}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span>Vé đã hết hạn</span>
                  </>
                )}
              </div>
            )}

            {/* QR Code */}
            <div className="flex justify-center mt-6">
              <Card className={cn(
                "w-64 h-64 flex items-center justify-center p-4",
                (checkedIn || expired) && "opacity-50"
              )}>
                <CardContent className="p-0">
                  <QRCodeSVG
                    value={`TICKET:${ticket.ticket.id}:${ticket.occa.id}:${ticket.show.id}`}
                    size={224}
                    level="H"
                    includeMargin={false}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-2 text-xs text-muted-foreground">
              <p>Mã vé: {ticket.ticket.id}</p>
            </div>

            {/* Ticket Info */}
            <div className="mt-6 space-y-4">
              <InfoItem 
                icon={Calendar} 
                label="Ngày:" 
                value={format(new Date(ticket.show.date), 'PPP')} 
              />
              <InfoItem 
                icon={Clock} 
                label="Giờ:" 
                value={ticket.show.time} 
              />
              <InfoItem 
                icon={MapPin} 
                label="Địa điểm:" 
                value={ticket.occa.location} 
              />
              <InfoItem 
                icon={Tag} 
                label="Loại vé:" 
                value={ticket.ticketType.type} 
              />
              <InfoItem 
                icon={Banknote} 
                label="Giá vé:" 
                value={`${ticket.ticketType.price.toLocaleString('vi-VN')}đ`} 
              />
            </div>

            <Separator className="my-6" />

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" onClick={handleDownload} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Tải vé
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
                <Button 
                variant="outline" 
                onClick={() => window.open(`/occas/${ticket.occa.id}`, '_blank')} 
                className="flex-1"
                >
                <ExternalLink className="mr-2 h-4 w-4" />
                Chi tiết sự kiện
                </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};