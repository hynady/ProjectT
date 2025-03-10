import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/commons/components/card.tsx';
import { Button } from '@/commons/components/button.tsx';
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Separator } from "@/commons/components/separator.tsx";
import { BookingState, OccaShortInfo } from '@/features/booking/internal-types/booking.type';
import { Check, ChevronDown, PlusCircle, AlertTriangle } from 'lucide-react';
import { UserProfileCard } from '@/features/setting/internal-types/settings.types';
import { settingsService } from '@/features/setting/services/settings.service';
import { toast } from '@/commons/hooks/use-toast';
import { ProfileCardDialog } from '@/features/setting/components/ProfileCardDialog';
import { Alert, AlertDescription, AlertTitle } from '@/commons/components/alert.tsx';
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

interface ConfirmationProps {
  bookingState: BookingState;
  occaInfo: OccaShortInfo;
  onConfirmPayment: () => void;
  onBack: () => void;
}

export const Confirmation = ({ bookingState, occaInfo, onConfirmPayment, onBack }: ConfirmationProps) => {
  const [profileCards, setProfileCards] = useState<UserProfileCard[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfileCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProfileDialog, setShowAddProfileDialog] = useState(false);
  const [open, setOpen] = useState(false);

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
        } else if (data.length > 0) {
          setSelectedProfile(data[0]);
        }
      } catch (error) {
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
  }, []);

  const handleProfileCreated = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getProfileCards();
      setProfileCards(data);
      
      // Select the newly created profile (should be the last one)
      const newProfile = data[data.length - 1];
      if (newProfile) {
        setSelectedProfile(newProfile);
      }
      
      toast({
        title: "Thành công",
        description: "Đã thêm thẻ thông tin mới và chọn để nhận vé"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin thẻ sau khi tạo mới.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
          onClick={onConfirmPayment}
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
    </div>
  );
};