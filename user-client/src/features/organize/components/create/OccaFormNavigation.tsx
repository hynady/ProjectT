import { ArrowLeft } from "lucide-react";
import { Button } from "@/commons/components/button";
import { OccaFormData } from "../../internal-types/organize.type";

interface OccaFormNavigationProps {
  activeTab: string;
  occaData: OccaFormData;
  isFormValid: boolean;
  onTabChange: (tab: string) => void;
  onSave: () => void;
}

export const OccaFormNavigation = ({
  activeTab,
  occaData,
  isFormValid,
  onTabChange,
  onSave,
}: OccaFormNavigationProps) => {
  // Progress indicator for mobile
  const renderMobileTabIndicator = () => {
    let step = 0;
    let title = "Thông tin cơ bản";
    
    switch (activeTab) {
      case "basic-info": 
        step = 1; 
        title = "Thông tin cơ bản";
        break;
      case "shows": 
        step = 2; 
        title = "Suất diễn";
        break;
      case "tickets": 
        step = 3; 
        title = "Vé";
        break;
      case "gallery": 
        step = 4; 
        title = "Thư viện ảnh";
        break;
    }
    
    return (
      <div className="flex flex-col space-y-2 mb-4 sm:hidden">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Bước {step}/4</span>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-1 rounded-full transition-all duration-300" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Mobile footer navigation
  const renderMobileFooterNav = () => {
    return (
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 flex justify-between z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (activeTab === "shows") onTabChange("basic-info");
            if (activeTab === "tickets") onTabChange("shows");
            if (activeTab === "gallery") onTabChange("tickets");
          }}
          disabled={activeTab === "basic-info"}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => {
            if (activeTab === "basic-info") onTabChange("shows");
            if (activeTab === "shows") onTabChange("tickets");
            if (activeTab === "tickets") onTabChange("gallery");
            if (activeTab === "gallery" && isFormValid) onSave();
          }}
          disabled={(activeTab === "gallery" && !isFormValid) || 
                   (activeTab === "shows" && (!occaData.shows || occaData.shows.length === 0)) ||
                   (activeTab === "tickets" && (!occaData.tickets || occaData.tickets.length === 0))}
        >
          {activeTab === "gallery" ? "Hoàn tất" : "Tiếp theo"}
        </Button>
      </div>
    );
  };

  return (
    <>
      {renderMobileTabIndicator()}
      {renderMobileFooterNav()}
    </>
  );
};
