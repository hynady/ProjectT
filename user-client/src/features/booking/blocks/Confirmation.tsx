import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/commons/components/card.tsx';
import { Button } from '@/commons/components/button.tsx';
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Separator } from "@/commons/components/separator.tsx";
import { BookingState, OccaShortInfo, PaymentDetails } from '@/features/booking/internal-types/booking.type';
import { Check, ChevronDown, PlusCircle, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { UserProfileCard } from '@/features/setting/internal-types/settings.types';
import { settingsService } from '@/features/setting/services/settings.service';
import { toast } from '@/commons/hooks/use-toast';
import { ProfileCardDialog } from '@/features/setting/components/ProfileCardDialog';
import { Alert, AlertDescription, AlertTitle } from '@/commons/components/alert.tsx';
import { bookingService } from '@/features/booking/services/booking.service';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/commons/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/commons/components/popover";
import { cn } from '@/commons/lib/utils/utils';
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

interface ConfirmationProps {
  bookingState: BookingState;
  occaInfo: OccaShortInfo;
  onConfirmPayment: (paymentDetails: PaymentDetails) => void;
  onBack: () => void;
  updateSelectedProfile?: (profile: UserProfileCard) => void;
  occaId: string;
}

export const Confirmation = ({ bookingState, occaInfo, onConfirmPayment, onBack, updateSelectedProfile, occaId }: ConfirmationProps) => {
  const navigate = useNavigate();
  const [profileCards, setProfileCards] = useState<UserProfileCard[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfileCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProfileDialog, setShowAddProfileDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLockingTickets, setIsLockingTickets] = useState(false);
  const [bookingError, setBookingError] = useState<Error | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const data = await settingsService.getProfileCards();
        setProfileCards(data);
        
        // Set default profile if available
        const defaultProfile = data.find(profile => profile.isDefault);
        if (defaultProfile) {
          setSelectedProfile(defaultProfile);
          if (updateSelectedProfile) {
            updateSelectedProfile(defaultProfile);
          }
        } else if (data.length > 0) {
          setSelectedProfile(data[0]);
          if (updateSelectedProfile) {
            updateSelectedProfile(data[0]);
          }
        }
      } catch {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin thẻ. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [updateSelectedProfile]);

  const handleProfileCreated = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getProfileCards();
      setProfileCards(data);
      
      // Select the newly created profile (should be the last one)
      const newProfile = data[data.length - 1];
      if (newProfile) {
        setSelectedProfile(newProfile);
        if (updateSelectedProfile) {
          updateSelectedProfile(newProfile);
        }
      }
      
      toast({
        title: "Thành công",
        description: "Đã thêm thẻ thông tin mới và chọn để nhận vé"
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin thẻ sau khi tạo mới.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedProfile) {
      toast({
        title: "Vui lòng chọn thông tin nhận vé",
        description: "Hãy chọn hoặc tạo hồ sơ mới để tiếp tục",
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmDialog(true);
  };
  
  // Xử lý khi người dùng xác nhận thanh toán - tiến hành khóa vé ở bước này
  const handleLockTickets = async () => {
    setShowConfirmDialog(false);
    
    if (!bookingState.selectedShow || !selectedProfile) {
      return;
    }
    
    try {
      setIsLockingTickets(true);
      setBookingError(null);
      
      // Tạo payload cho việc khóa vé
      const lockPayload = {
        showId: bookingState.selectedShow.id,
        tickets: bookingState.selectedTickets.map(ticket => ({
          id: ticket.id,
          type: ticket.type,
          quantity: ticket.quantity
        })),
        recipient: {
          id: selectedProfile.id,
          name: selectedProfile.name,
          email: selectedProfile.email,
          phoneNumber: selectedProfile.phoneNumber
        }
      };
      
      // Chỉ gọi API để khóa vé tại bước này
      const lockResponse = await bookingService.lockTickets(lockPayload);
      
      // Nếu thành công, chuyển đến trang thanh toán chỉ với thông tin cơ bản
      onConfirmPayment(lockResponse);
      
    } catch (error) {
      // Xử lý lỗi nếu không thể khóa vé
      setBookingError(error as Error);
      setShowErrorDialog(true);
    } finally {
      setIsLockingTickets(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Thông tin sự kiện */}
      <Card>
        <CardHeader className="text-lg font-semibold pb-2">
          Thông tin sự kiện
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-primary">
                {occaInfo.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Địa điểm:</p>
                <p className="text-muted-foreground">{occaInfo.location}</p>
              </div>
              <div>
                <p className="font-semibold">Thời lượng:</p>
                <p className="text-muted-foreground">{occaInfo.duration}</p>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-semibold">Địa chỉ:</p>
              <p className="text-muted-foreground">{occaInfo.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-lg font-semibold pb-2">
          Thông tin nhận vé
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải thẻ thông tin...</div>
              ) : (
                <div className="flex flex-col space-y-4">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {selectedProfile ? selectedProfile.name : "Chọn thẻ thông tin..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Tìm thẻ thông tin..." />
                        <CommandEmpty>Không tìm thấy thẻ thông tin.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {profileCards.map((profile) => (
                            <CommandItem
                              key={profile.id}
                              value={profile.id}
                              onSelect={() => {
                                setSelectedProfile(profile);
                                if (updateSelectedProfile) {
                                  updateSelectedProfile(profile);
                                }
                                setOpen(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span>{profile.name}</span>
                                <span className="text-xs text-muted-foreground">{profile.email}</span>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedProfile?.id === profile.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                          <CommandItem 
                            onSelect={() => {
                              setOpen(false);
                              setShowAddProfileDialog(true);
                            }}
                            className="text-primary cursor-pointer"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            <span>Thêm thẻ thông tin mới</span>
                          </CommandItem>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  {selectedProfile && (
                    <div className="border rounded-md p-3 bg-muted/30">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-medium">Tên:</p>
                          <p className="text-muted-foreground">{selectedProfile.name}</p>
                        </div>
                        <div>
                          <p className="font-medium">Số điện thoại:</p>
                          <p className="text-muted-foreground">{selectedProfile.phoneNumber}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-medium">Email:</p>
                          <p className="text-muted-foreground break-words">{selectedProfile.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground mb-2">
                Vé điện tử sẽ được gửi đến email được chọn sau khi thanh toán thành công.
              </p>
              
              <Alert className="border-amber-600/50 bg-amber-600/10 [&>svg]:text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm text-amber-600">Lưu ý quan trọng</AlertTitle>
                <AlertDescription className="text-sm text-amber-600">
                  Vui lòng kiểm tra kỹ thông tin liên hệ của bạn. Email không chính xác có thể dẫn đến việc 
                  không nhận được vé sau khi thanh toán. Số điện thoại sẽ được sử dụng để liên hệ trong trường hợp cần thiết.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chi tiết đặt vé */}
      <Card>
        <CardHeader className="text-lg font-semibold pb-2">
          Chi tiết đặt vé
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Suất diễn:</span>
            <span>
              {format(
                new Date(bookingState.selectedShow?.date || ''),
                'EEEE, dd/MM/yyyy',
                { locale: vi }
              )} - {bookingState.selectedShow?.time}
            </span>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="font-medium">Vé đã chọn:</p>
            {bookingState.selectedTickets.map((ticket, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{ticket.type} x{ticket.quantity}</span>
                <span className="font-medium">
                  {(ticket.price * ticket.quantity)
                    .toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Tổng tiền:</span>
            <span className="text-primary">
              {bookingState.totalAmount.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND'
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end mt-6">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Quay lại
        </Button>
        <Button
          onClick={handleConfirmPayment}
          disabled={!selectedProfile || isLoading}
        >
          Xác nhận và Thanh toán
        </Button>
      </div>

      <ProfileCardDialog
        open={showAddProfileDialog}
        onOpenChange={setShowAddProfileDialog}
        mode="create"
        onSuccess={handleProfileCreated}
      />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thanh toán</AlertDialogTitle>
            <AlertDialogDescription className="mb-2">
              Lưu ý quan trọng: Sau khi chuyển sang bước thanh toán, bạn sẽ <span className="font-semibold">không thể quay lại</span> để chỉnh sửa thông tin vé đã chọn.
            </AlertDialogDescription>
            
            <div className="text-sm text-muted-foreground mt-2">
              Vui lòng kiểm tra kỹ lại các thông tin sau:
              <ul className="list-disc list-inside mt-2">
                <li>Thông tin liên hệ nhận vé</li>
                <li>Suất diễn đã chọn</li>
                <li>Loại vé và số lượng</li>
                <li>Tổng số tiền thanh toán</li>
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kiểm tra lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleLockTickets}>
              Tiếp tục đến thanh toán
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog hiển thị lỗi khi không thể khóa vé */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Không thể đặt vé
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-4">
              {bookingError?.message || "Có lỗi xảy ra khi đặt vé. Vui lòng thử lại sau."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate(`/occas/${occaId}`)}>
              Quay lại trang chi tiết
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Overlay hiển thị khi đang khóa vé */}
      {isLockingTickets && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 max-w-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-center">Đang xử lý đặt vé của bạn...</p>
            <p className="text-sm text-muted-foreground text-center">
              Vui lòng không đóng trình duyệt hoặc tải lại trang.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};