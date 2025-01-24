import {QRCodeSVG} from "qrcode.react";
import {format, parseISO} from "date-fns";
import {Button} from "@/commons/components/button.tsx";
import {
  Download,
  CheckCircle,
  Calendar,
  Clock,
  Tag,
  MapPin,
  Share2, ExternalLink, XCircle, Banknote
} from "lucide-react";
import {cn} from "@/commons/lib/ultils/utils.ts";
import {TicketDisplay} from "@/features/my-ticket/blocks/TicketList.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/commons/components/dialog.tsx";
import {ScrollArea} from "@/commons/components/scroll-area.tsx";
import {Separator} from "@/commons/components/separator.tsx";
import {Card, CardContent} from "@/commons/components/card.tsx";
import React from "react";
import {isTicketCheckedIn, isTicketExpired} from "@/commons/lib/ultils/ticketUtils.tsx";

interface TicketModalProps {
  ticket: TicketDisplay;
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
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  </div>
);

export const TicketModal = ({ticket, onClose}: TicketModalProps) => {
  const currentDate = new Date('2025-01-21 08:41:54');
  const checkedIn = isTicketCheckedIn(ticket);
  const expired = isTicketExpired(ticket, currentDate);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-center text-xl sm:text-2xl font-bold">
                {ticket.occa.title}
              </DialogTitle>
              <p className="text-center text-muted-foreground mt-1">
                {ticket.occa.location}
              </p>
            </DialogHeader>

            <Card className="mt-6">
              <CardContent className={cn(
                "p-6 flex flex-col items-center justify-center",
                checkedIn ? "bg-primary/10" :
                  expired ? "bg-destructive/10" : "bg-secondary/10"
              )}>
                {checkedIn ? (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-3">
                      <CheckCircle className="w-8 h-8 text-primary"/>
                    </div>
                    <h3 className="text-lg font-semibold text-primary">Checked In</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(parseISO(ticket.ticket.checkedInAt!), 'PPp')}
                    </p>
                  </div>
                ) : expired ? (
                  <div className="text-center">
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20 mb-3">
                      <XCircle className="w-8 h-8 text-destructive"/>
                    </div>
                    <h3 className="text-lg font-semibold text-destructive">Expired</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Event ended on {format(parseISO(`${ticket.show.date}T${ticket.show.time}`), 'PPp')}
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-[200px] mx-auto">
                    <QRCodeSVG
                      value={ticket.ticket.qrCode}
                      level="H"
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 space-y-6">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <InfoItem
                    icon={Calendar}
                    label="Ngày"
                    value={format(new Date(ticket.show.date), 'PPP')}
                  />
                  <InfoItem
                    icon={Clock}
                    label="Thời gian"
                    value={ticket.show.time}
                  />
                  <InfoItem
                    icon={Clock}
                    label="Thời lượng"
                    value={ticket.occa.duration}
                  />
                  <InfoItem
                    icon={Tag}
                    label="Loại vé"
                    value={ticket.ticketType.type}
                  />
                  <InfoItem
                    icon={Banknote}
                    label="Giá"
                    value={`$${ticket.ticketType.price}`}
                  />
                  <Separator className="my-2"/>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <InfoItem
                        icon={MapPin}
                        value={
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-medium">{ticket.occa.location}</span>
                            <span className="hidden sm:block text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{ticket.occa.address}</span>
                          </div>
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 sm:ml-4 w-full sm:w-auto"
                        onClick={() => {
                          const destination = encodeURIComponent(`${ticket.occa.location}, ${ticket.occa.address}`);
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2"/>
                        Mở trên Bản đồ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!checkedIn && !expired && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => window.print()}
                  >
                    <Download className="w-4 h-4 mr-2"/>
                    Tải vé
                  </Button>
                  <Button className="flex-1 h-12">
                    <Share2 className="w-4 h-4 mr-2"/>
                    Chia sẻ vé
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};