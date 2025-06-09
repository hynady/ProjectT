import { useNavigate } from "react-router-dom";
import { Button } from "@/commons/components/button";
import { ArrowLeft, Eye, Save, Upload } from "lucide-react";
import { PreviewModal } from "../PreviewModal";
import { OccaFormData } from "../../internal-types/organize.type";
import { toast } from "@/commons/hooks/use-toast";

interface OccaFormHeaderProps {
  isEditing: boolean;
  occaData: OccaFormData;
  isFormValid: boolean;
  isSaving: boolean;
  isDraft: boolean;
  isSubmitting: boolean;
  hasChanges?: boolean; // New prop to track changes
  requiresApprovalReset?: boolean; // NEW: Track if approval status should reset
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
  hasChanges = true, // Default to true for create mode
  requiresApprovalReset = true, // Default to true for create mode
  onSave,
  onSubmit,
  onNavigateToTab
}: OccaFormHeaderProps) => {  const navigate = useNavigate();

  // Determine submit button text based on editing mode and approval reset requirement
  const getSubmitButtonText = () => {
    if (isSubmitting) {
      return requiresApprovalReset ? "Đang gửi..." : "Đang lưu...";
    }
    
    if (!isEditing) {
      return "Gửi duyệt"; // Always "Send for approval" for new events
    }
    
    // For editing mode, check if approval status needs to reset
    return requiresApprovalReset ? "Gửi duyệt" : "Lưu thay đổi";
  };

  // Only show no changes warning in edit mode
  const handleSubmitWithCheck = () => {
    if (isEditing && !hasChanges) {
      toast({
        title: "Không có thay đổi",
        description: "Không có thay đổi nào để gửi xét duyệt",
        variant: "default",
      });
      return;
    }
    onSubmit();
  };

  const handleSaveWithCheck = (asDraft: boolean) => {
    if (isEditing && !hasChanges) {
      toast({
        title: "Không có thay đổi",
        description: "Không có thay đổi nào để lưu",
        variant: "default",
      });
      return;
    }
    onSave(asDraft);
  };

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
        
        {/* Show status badge when in edit mode */}
        {isEditing && (
          <div className="ml-2">
            {hasChanges ? (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Đã thay đổi
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Không thay đổi
              </span>
            )}
          </div>
        )}
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
          onClick={() => handleSaveWithCheck(true)}
          disabled={isSaving || (isEditing && !hasChanges)}
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
          onClick={handleSubmitWithCheck}
          disabled={isSaving || isSubmitting || !isFormValid || (isEditing && !hasChanges)}
          loading={isSubmitting}
          size={window.innerWidth >= 768 && window.innerWidth < 1024 ? "icon" : "default"}
          className="gap-2 md:gap-0 lg:gap-2"
        >
          <Upload className="h-4 w-4" />
          <span className="md:hidden lg:inline">
            {getSubmitButtonText()}
          </span>
        </Button>
      </div>
    </div>
  );
};
