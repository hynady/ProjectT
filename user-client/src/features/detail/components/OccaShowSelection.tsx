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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/commons/components/dialog";
import {useNavigate, useLocation} from 'react-router-dom';
import { useAuth } from "@/features/auth/contexts";
import { useState } from "react";

export interface OccaShowUnit {
  date: string;
  time: string;
  prices: {
    type: string;
    price: number;
    available: number;
  }[];
}

interface OccaShowSelectionProps {
  shows: OccaShowUnit[];
  organizer: string;
}

export const OccaShowSelection = ({shows, organizer}: OccaShowSelectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    show?: OccaShowUnit;
    ticket?: {
      type: string;
      price: number;
      available: number;
    };
  }>({});

  const handleNavigateToLogin = () => {
    navigate('/login', { 
      state: { 
        from: location.pathname
      }
    });
  };

  const handleShowSelect = (show: OccaShowUnit, selectedTicket: {
    type: string;
    price: number;
    available: number;
  }) => {
    if (!isAuthenticated) {
      setPendingAction({ show, ticket: selectedTicket });
      setShowLoginDialog(true);
      return;
    }

    // Lưu thông tin show và vé đã chọn
    const selectedInfo = {
      show: {
        date: show.date,
        time: show.time
      },
      ticket: {
        type: selectedTicket.type,
        price: selectedTicket.price.toString(),
        quantity: 1 // Mặc định chọn 1 vé
      }
    };

    // Chuyển đến trang booking với state
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
          <Accordion type="single" collapsible>
            {shows.map((show, index) => (
              <AccordionItem key={index} value={`show-${index}`}>
                <AccordionTrigger>
                  {show.date} - {show.time}
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
                            {ticket.price.toLocaleString('vi-VN')}đ
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Còn {ticket.available} vé
                          </p>
                        </div>
                        
                          <Button
                            onClick={() => handleShowSelect(show, ticket)}
                            disabled={ticket.available < 1}
                          >
                            Chọn
                          </Button>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {isAuthenticated ? (
            <Button
              className="w-full mt-6"
              size="lg"
              onClick={() => navigate("booking")}
            >
              Đặt vé ngay
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
            Vé được bán bởi {organizer}
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