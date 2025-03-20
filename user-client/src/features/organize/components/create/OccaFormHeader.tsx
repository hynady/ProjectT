import { useNavigate } from "react-router-dom";
import { Button } from "@/commons/components/button";
import { ArrowLeft, Eye, Save, Upload } from "lucide-react";
import { PreviewModal } from "../PreviewModal";
import { OccaFormData } from "../../internal-types/organize.type";

interface OccaFormHeaderProps {
  isEditing: boolean;
  occaData: OccaFormData;
  isFormValid: boolean;
  isSaving: boolean;
  isDraft: boolean;
  isSubmitting: boolean;
  onSave: (asDraft: boolean) => void;
  onSubmit: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const OccaFormHeader = ({
  isEditing,
  occaData,
  isFormValid,
  isSaving,
  isDraft,
  isSubmitting,
  onSave,
  onSubmit,
  onNavigateToTab
}: OccaFormHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      {/* Title section with back button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/organize")}
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-semibold">
          {isEditing ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
        </h1>
      </div>
      
      {/* Action buttons with responsive display */}
      <div className="flex items-center gap-2 justify-end">
        {/* Preview button */}
        <div className="block md:hidden lg:block">
          <PreviewModal 
            occaData={occaData}
            onNavigateToTab={onNavigateToTab}
          >
            <Button variant="outline" className="gap-2" size="sm">
              <Eye className="h-4 w-4" />
              <span className="md:hidden lg:inline">Xem trước</span>
            </Button>
          </PreviewModal>
        </div>
        <div className="hidden md:block lg:hidden">
          <PreviewModal 
            occaData={occaData}
            onNavigateToTab={onNavigateToTab}
          >
            <Button variant="outline" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </PreviewModal>
        </div>
        
        {/* Draft button */}
        <Button
          variant={isDraft ? "default" : "outline"}
          onClick={() => onSave(true)}
          disabled={isSaving}
          loading={isSaving && isDraft}
          size={window.innerWidth >= 768 && window.innerWidth < 1024 ? "icon" : "default"}
          className="gap-2 md:gap-0 lg:gap-2"
        >
          <Save className="h-4 w-4" />
          <span className="md:hidden lg:inline">
            {isSaving && isDraft ? "Đang lưu..." : "Lưu nháp"}
          </span>
        </Button>
        
        {/* Publish button */}
        <Button
          onClick={onSubmit}
          disabled={isSaving || isSubmitting || !isFormValid}
          loading={isSubmitting}
          size={window.innerWidth >= 768 && window.innerWidth < 1024 ? "icon" : "default"}
          className="gap-2 md:gap-0 lg:gap-2"
        >
          <Upload className="h-4 w-4" />
          <span className="md:hidden lg:inline">
            {isSubmitting ? "Đang gửi..." : "Gửi xét duyệt"}
          </span>
        </Button>
      </div>
    </div>
  );
};
