import { Separator } from "@/commons/components/separator.tsx";
import { Card } from "@/commons/components/card.tsx";
import { DeleteAccountDialog } from "../components/DeleteAccountDialog.tsx";
import { useEffect, useState } from "react";
import { UserInfo } from "../internal-types/settings.types.ts";
import { settingsService } from "../services/settings.service";
import { AccountForm } from "../components/AccountForm";
import SettingsResetPasswordForm from "../components/SettingsResetPasswordForm";

export default function SettingsAccountPage() {
  const [profile, setProfile] = useState<UserInfo | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await settingsService.getUserInfo();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold">Tài khoản</h3>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin tài khoản và mật khẩu của bạn.
        </p>
      </div>
      <Separator className="my-6"/>
      <div className="space-y-8">
        {/* Phần thông tin cá nhân */}
        <Card id="personal-info" className="p-6 scroll-mt-32">
          <div className="space-y-1 mb-4">
            <h4 className="text-sm font-medium leading-none">
              Thông tin cá nhân
            </h4>
            <p className="text-sm text-muted-foreground">
              Cập nhật thông tin cá nhân của bạn.
            </p>
          </div>
          <AccountForm initialData={profile} isLoading={isLoading} />
        </Card>

        {/* Phần thông tin đăng nhập */}
        <Card id="password" className="p-6 scroll-mt-32">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">
              Thay đổi mật khẩu
            </h4>
            <p className="text-sm text-muted-foreground">
              Thay đổi mật khẩu để bảo vệ tài khoản của bạn.
            </p>
          </div>          
          <div className="mt-6">
            {profile?.email && (
              <SettingsResetPasswordForm userEmail={profile.email} />
            )}
          </div>
        </Card>

        {/* Xóa tài khoản */}
        <Card id="delete-account" className="p-6 scroll-mt-32">
          <div className="space-y-1 mb-4">
            <h4 className="text-sm font-medium leading-none text-destructive">
              Xóa tài khoản
            </h4>
            <p className="text-sm text-muted-foreground">
              Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn.
            </p>
          </div>
          <DeleteAccountDialog />
        </Card>
      </div>
    </div>
  );
}