import { Separator } from '@/commons/components/separator.tsx';
import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { UserProfileCard } from '../internal-types/settings.types';
import { settingsService } from '../services/settings.service';
import { ProfileCardItem } from '../components/ProfileCardItem';
import { ProfileCardDialog } from '../components/ProfileCardDialog';
import { Button } from '@/commons/components/button.tsx';
import { toast } from '@/commons/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SettingsProfilePage() {
  const [profiles, setProfiles] = useState<UserProfileCard[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfiles = async (showLoading = false) => {
    if (showLoading) {
      setInitialLoading(true);
    }
    
    try {
      const data = await settingsService.getProfileCards();
      setProfiles(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin profile. Vui lòng thử lại sau.",
        variant: "destructive"
      });
      console.error("Error fetching profiles:", error);
    } finally {
      if (showLoading) {
        setInitialLoading(false);
      }
      if (!initialized) {
        setInitialized(true);
      }
    }
  };

  useEffect(() => {
    // Lần đầu tiên mount sẽ hiển thị loading
    fetchProfiles(true);
  }, []);

  // Hàm refresh data nhưng không hiển thị loading
  const refreshProfilesQuietly = () => {
    fetchProfiles(false);
  };

  if (initialLoading && !initialized) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div id="profile-cards" className="space-y-6 scroll-mt-32">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Thẻ thông tin</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý các thẻ thông tin người dùng của bạn.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm thẻ mới
        </Button>
      </div>
      <Separator />
      
      <div>
        {profiles.length === 0 ? (
          <div className="text-center py-10 border rounded-md">
            <h3 className="text-lg font-medium mb-2">Chưa có thẻ thông tin nào</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Thêm thẻ thông tin để lưu các thông tin liên hệ khác nhau cho bạn.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm thẻ mới
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {profiles.map((profile) => (
              <ProfileCardItem 
                key={profile.id} 
                profile={profile} 
                onUpdate={refreshProfilesQuietly} 
              />
            ))}
          </div>
        )}
      </div>
      
      <ProfileCardDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        mode="create"
        onSuccess={refreshProfilesQuietly}
      />
    </div>
  );
}