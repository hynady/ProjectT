import {Button} from '@/commons/components/button.tsx';
import {Card} from '@/commons/components/card.tsx';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/commons/components/accordion.tsx';

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
import {useNavigate, useLocation} from 'react-router-dom';
import { useAuth } from "@/features/auth/contexts";
import { useState } from "react";
import { BookingInfo, OccaShowUnit } from '@/features/detail/internal-types/detail.type';
import { Info } from 'lucide-react';

interface OccaShowSelectionProps {
  shows: OccaShowUnit[];
  organizer: string;
  occaInfo: BookingInfo['occa'];
  isPreview?: boolean;
}

export const OccaShowSelection = ({shows, organizer, occaInfo, isPreview = false}: OccaShowSelectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Sort shows by date and time, closest to current time first
  const sortedShows = [...shows].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const handleNavigateToLogin = () => {
    navigate('/login', { 
      state: { 
        from: location.pathname
      }
    });
  };

  const handleShowSelect = (show: OccaShowUnit, selectedTicket: {
    id: string;
    type: string;
    price: number;
    available: number;
  }) => {
    // Không thực hiện hành động nếu đang ở chế độ preview
    if (isPreview) {
      return;
    }
    
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
  
    const selectedInfo: BookingInfo = {
      occa: {
        id: occaInfo.id,
        title: occaInfo.title,
        location: occaInfo.location, 
        address: occaInfo.address,
        shows: shows
      },
      selectedShow: {
        id: show.id,
        date: show.date,
        time: show.time
      },
      selectedTicket: {
        id: selectedTicket.id,
        type: selectedTicket.type,
        price: selectedTicket.price,
        quantity: 1
      }
    };
  
    navigate('booking', {
      state: {
        skipToStep: 2,
        selectedInfo
      }
    });
  };

  return (
    <>
      <div className="sticky top-16">
        <div className="bg-card rounded-xl p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Chọn buổi diễn</h2>
          <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span className="italic">Các buổi diễn hết thời hạn sẽ không hiển thị</span>
          </div>
          <Accordion type="single" collapsible>
            {sortedShows.map((show, index) => (
              <AccordionItem key={index} value={`show-${index}`}>
                <AccordionTrigger>
                  {new Date(show.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                  }).replace(/\//g, '/')} - {show.time.substring(0, 5)}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {show.prices.map((ticket, ticketIndex) => (
                      <Card
                        key={ticketIndex}
                        className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                      >
                        <div>
                          <h3 className="font-semibold text-primary">{ticket.type}</h3>
                            <p className="text-muted-foreground">
                            {ticket.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </p>
                          <p className="text-sm text-muted-foreground">
                            Còn {ticket.available} vé
                          </p>
                        </div>
                        
                          <Button
                            onClick={() => handleShowSelect(show, ticket)}
                            disabled={isPreview || ticket.available < 1}
                          >
                            {isPreview ? "Xem trước" : ticket.available < 1 ? "Bán hết" : "Chọn"}
                          </Button>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {isPreview ? (
            <Button
              className="w-full mt-6"
              size="lg"
              disabled
            >
              Chế độ xem trước
            </Button>
          ) : isAuthenticated ? (
            <Button
              className="w-full mt-6"
              size="lg"
              onClick={() => navigate("booking")}
              disabled={shows.every(show => show.prices.every(ticket => ticket.available < 1))}
            >
              {shows.every(show => show.prices.every(ticket => ticket.available < 1)) ? "Hết rồi, hẹn bạn lần sau :(" : "Đặt vé ngay"}
            </Button>
          ) : (
            <Button
              className="w-full mt-6"
              size="lg"
              onClick={() => setShowLoginDialog(true)}
            >
              Đăng nhập để đặt vé
            </Button>
          )}
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isPreview ? "Đây là bản xem trước" : `Vé được bán bởi ${organizer}`}
          </p>
        </div>
      </div>

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đăng nhập để tiếp tục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn cần đăng nhập để đặt vé. Sau khi đăng nhập thành công, bạn sẽ được chuyển về trang này để tiếp tục đặt vé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLoginDialog(false)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleNavigateToLogin}>
              Đăng nhập ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};