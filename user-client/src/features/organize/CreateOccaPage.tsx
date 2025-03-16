import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/commons/components/button";
import { Card, CardContent } from "@/commons/components/card";
import { ArrowLeft, Eye, Save, Upload } from "lucide-react";
import { toast } from "@/commons/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/tabs";
import { BasicInfoForm } from "./components/BasicInfoForm";
import { ShowsForm } from "./components/ShowsForm";
import { CreateOccaPayload, OccaFormData } from "./internal-types/organize.type";
import { organizeService } from "./services/organize.service";
import { useAuth } from "@/features/auth/contexts";
import { TicketForm } from "@/features/organize/components/TicketForm";
import { GalleryForm } from "@/features/organize/components/GalleryForm";
import { uploadImageToCloudinary } from "@/utils/cloudinary.utils";
import { PreviewModal } from "./components/PreviewModal";
import { DashboardLayout } from "./layouts/DashboardLayout";

const CreateOccaPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [occaData, setOccaData] = useState<OccaFormData>({
    basicInfo: {
      title: "",
      artist: "",
      location: "",
      address: "",
      duration: 120,
      description: "",
      bannerUrl: "",
    },
    shows: [],
    tickets: [],
    gallery: []
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      navigate("/login", { state: { from: "/organize/create" } });
    }
  }, [isAuthenticated, loading, navigate]);

  // Chuyển validateForm thành useCallback để tránh tạo lại hàm này mỗi lần render
  const validateForm = useCallback((): boolean => {
    if (!occaData.basicInfo?.title) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên sự kiện",
        variant: "destructive",
      });
      setActiveTab("basic-info");
      return false;
    }

    if (!occaData.basicInfo?.location) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập địa điểm",
        variant: "destructive",
      });
      setActiveTab("basic-info");
      return false;
    }

    if (!occaData.shows || occaData.shows.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng thêm ít nhất một suất diễn",
        variant: "destructive",
      });
      setActiveTab("shows");
      return false;
    }

    if (!occaData.tickets || occaData.tickets.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng thêm ít nhất một loại vé",
        variant: "destructive",
      });
      setActiveTab("tickets");
      return false;
    }

    return true;
  }, [occaData.basicInfo?.title, occaData.basicInfo?.location, occaData.shows, occaData.tickets, setActiveTab]);

  // Cập nhật trạng thái isFormValid mỗi khi dữ liệu form thay đổi
  useEffect(() => {
    // Fix: Ensure we're setting a boolean value
    const isValid = Boolean(
      occaData.basicInfo?.title &&
      occaData.basicInfo?.location &&
      occaData.shows?.length > 0 &&
      occaData.tickets?.length > 0
    );
    setIsFormValid(isValid);
  }, [occaData]);

  const handleSave = async (asDraft: boolean) => {
    // Chỉ kiểm tra hợp lệ nếu không phải lưu nháp
    if (!asDraft && !validateForm()) {
      return;
    }

    setIsSaving(true);
    setIsDraft(asDraft);

    try {
      // Chuẩn bị dữ liệu để submit
      const processedData = { ...occaData };
      
      // Upload banner nếu có
      if (processedData.basicInfo.bannerFile) {
        try {
          // Fix the function call to match the signature from utils/cloudinary.utils.ts
          const bannerResponse = await uploadImageToCloudinary(
            processedData.basicInfo.bannerFile,
            "occa_banners"
          );
          processedData.basicInfo.bannerUrl = bannerResponse.secure_url;
        } catch (err) {
          console.error("Failed to upload banner:", err);
          toast({
            title: "Lỗi",
            description: "Không thể tải lên ảnh banner. Vui lòng thử lại.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }
      
      // Upload gallery images nếu có
      if (processedData.gallery && processedData.gallery.length > 0) {
        const galleryWithFiles = processedData.gallery.filter(item => item.file);
        
        if (galleryWithFiles.length > 0) {
          try {
            const uploadPromises = galleryWithFiles.map(async (item) => {
              if (!item.file) return item;
              
              // Fix the function call to match the signature
              const response = await uploadImageToCloudinary(
                item.file,
                "occa_galleries"
              );
              
              return {
                ...item,
                image: response.secure_url
              };
            });
            
            // Thay thế gallery cũ bằng gallery mới với URL từ Cloudinary
            const updatedGallery = await Promise.all(uploadPromises);
            processedData.gallery = updatedGallery;
          } catch (err) {
            console.error("Failed to upload gallery images:", err);
            toast({
              title: "Lỗi",
              description: "Không thể tải lên một số ảnh thư viện. Vui lòng thử lại.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
        }
      }
      
      // Xóa các trường File không cần thiết trước khi gửi lên API
      processedData.basicInfo = { ...processedData.basicInfo };
      delete processedData.basicInfo.bannerFile;
      
      processedData.gallery = processedData.gallery.map(item => ({
        id: item.id,
        image: item.image
      }));

      // Gọi API để tạo sự kiện
      const payload: CreateOccaPayload = {
        ...processedData,
        status: asDraft ? "draft" : "active",
      };

      const result = await organizeService.createOcca(payload);

      toast({
        title: "Thành công",
        description: asDraft 
          ? "Đã lưu bản nháp sự kiện" 
          : "Đã tạo mới sự kiện thành công",
      });

      // Redirect to event detail page or back to organize page
      navigate(asDraft ? "/organize" : `/occas/${result.id}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo sự kiện. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if form has enough data for preview
  const canPreview = useCallback((): boolean => {
    const { basicInfo, shows } = occaData;
    // Fix: Return a proper boolean value
    return Boolean(
      basicInfo &&
      basicInfo.title &&
      basicInfo.title.length >= 5 &&
      basicInfo.location &&
      basicInfo.location.length >= 3 &&
      shows &&
      shows.length > 0
    );
  }, [occaData]);

  // Log the current state of occaData whenever it changes (for debugging)
  useEffect(() => {
    // console.log("Current occaData state:", occaData);
    // Fix: Ensure we're setting a boolean value
    const previewable = canPreview();
    setIsFormValid(previewable);
  }, [occaData, canPreview]);

  // Function to navigate to a specific tab
  const navigateToTab = (tabName: string) => {
    setActiveTab(tabName);
  };

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

  const renderMobileFooterNav = () => {
    return (
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 flex justify-between z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (activeTab === "shows") setActiveTab("basic-info");
            if (activeTab === "tickets") setActiveTab("shows");
            if (activeTab === "gallery") setActiveTab("tickets");
          }}
          disabled={activeTab === "basic-info"}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => {
            if (activeTab === "basic-info") setActiveTab("shows");
            if (activeTab === "shows") setActiveTab("tickets");
            if (activeTab === "tickets") setActiveTab("gallery");
            if (activeTab === "gallery" && isFormValid) handleSave(false);
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

  // Show nothing during authentication check
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container py-4 sm:py-6 pb-16 sm:pb-6 px-4 sm:px-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          {/* Title section with back button - always on top or left */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/organize")}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-semibold">Tạo sự kiện mới</h1>
          </div>
          
          {/* Action buttons with responsive display */}
          <div className="flex items-center gap-2 justify-end">
            {/* Preview button */}
            <div className="block md:hidden lg:block">
              <PreviewModal 
                occaData={occaData}
                onNavigateToTab={navigateToTab}
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
                onNavigateToTab={navigateToTab}
              >
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </PreviewModal>
            </div>
            
            {/* Draft button */}
            <Button
              variant={isDraft ? "default" : "outline"}
              onClick={() => handleSave(true)}
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
              onClick={() => handleSave(false)}
              disabled={isSaving || !isFormValid}
              loading={isSaving && !isDraft}
              size={window.innerWidth >= 768 && window.innerWidth < 1024 ? "icon" : "default"}
              className="gap-2 md:gap-0 lg:gap-2"
            >
              <Upload className="h-4 w-4" />
              <span className="md:hidden lg:inline">
                {isSaving && !isDraft ? "Đang đăng..." : "Đăng sự kiện"}
              </span>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            {renderMobileTabIndicator()}
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Tab list - Hidden on small screens, left-aligned on larger screens */}
              <div className="hidden sm:block mb-6 overflow-x-auto">
                <TabsList className="inline-flex">
                  <TabsTrigger value="basic-info">Thông tin cơ bản</TabsTrigger>
                  <TabsTrigger 
                    value="shows" 
                    disabled={!occaData.basicInfo?.title}
                  >
                    Suất diễn
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tickets" 
                    disabled={!occaData.shows || occaData.shows.length === 0}
                  >
                    Vé
                  </TabsTrigger>
                  <TabsTrigger 
                    value="gallery"
                    disabled={
                      !occaData.tickets || occaData.tickets.length === 0
                    }
                  >
                    Thư viện ảnh
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="basic-info">
                <BasicInfoForm
                  data={occaData.basicInfo}
                  onChange={(data) =>
                    setOccaData({ ...occaData, basicInfo: data })
                  }
                  onNext={() => setActiveTab("shows")}
                />
              </TabsContent>
              <TabsContent value="shows">
                <ShowsForm
                  shows={occaData.shows}
                  onChange={(shows) => setOccaData({ ...occaData, shows })}
                  onBack={() => setActiveTab("basic-info")}
                  onNext={() => setActiveTab("tickets")}
                />
              </TabsContent>
              <TabsContent value="tickets">
                <TicketForm
                  tickets={occaData.tickets}
                  shows={occaData.shows}
                  onChange={(tickets) => setOccaData({ ...occaData, tickets })}
                  onBack={() => setActiveTab("shows")}
                  onNext={() => setActiveTab("gallery")}
                />
              </TabsContent>
              <TabsContent value="gallery">
                <GalleryForm
                  gallery={occaData.gallery}
                  onChange={(gallery) => setOccaData({ ...occaData, gallery })}
                  onBack={() => setActiveTab("tickets")}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Mobile navigation footer */}
        {renderMobileFooterNav()}
      </div>
    </DashboardLayout>
  );
};

export default CreateOccaPage;
