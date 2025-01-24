import { Separator } from "@/commons/components/separator.tsx";
import { Card } from "@/commons/components/card.tsx";
import ResetPassword from "@/features/auth/blocks/ResetPasswordForm.tsx";

export default function SettingsAccountPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold">Tài khoản</h3>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin tài khoản và mật khẩu của bạn.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="space-y-8">
        {/* Phần thông tin tài khoản */}
        <Card className="p-6">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">
              Thông tin đăng nhập
            </h4>
            <p className="text-sm text-muted-foreground">
              Thay đổi mật khẩu để bảo vệ tài khoản của bạn.
            </p>
          </div>
          <div className="mt-6">
            <ResetPassword hideNavigation noPadding />
          </div>
        </Card>

        {/* Có thể thêm các card khác cho các phần khác của settings */}
        <Card className="p-6">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">
              Xác thực hai yếu tố
            </h4>
            <p className="text-sm text-muted-foreground">
              Thêm lớp bảo mật cho tài khoản của bạn với xác thực hai yếu tố.
            </p>
          </div>
          {/* Thêm nội dung cho phần xác thực hai yếu tố ở đây */}
        </Card>

        <Card className="p-6">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none text-destructive">
              Xóa tài khoản
            </h4>
            <p className="text-sm text-muted-foreground">
              Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn.
            </p>
          </div>
          {/* Thêm nút và modal xác nhận xóa tài khoản ở đây */}
        </Card>
      </div>
    </div>
  );
}