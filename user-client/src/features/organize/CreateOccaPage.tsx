import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/commons/components/button";
import { Card, CardContent } from "@/commons/components/card";
import { ArrowLeft, Save } from "lucide-react";
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

  const handleFormChange = (
    section: keyof OccaFormData,
    data: any
  ) => {
    setOccaData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const canGoToTab = (tabValue: string): boolean => {
    // Define conditions for enabling tabs
    switch(tabValue) {
      case "basic-info":
        return true;
      case "shows":
        return Boolean(
          occaData.basicInfo?.title &&
          occaData.basicInfo?.location &&
          occaData.basicInfo?.duration
        );
      case "tickets":
        return Boolean(occaData.shows && occaData.shows.length > 0);
      case "gallery":
        return Boolean(occaData.tickets && occaData.tickets.length > 0);
      default:
        return false;
    }
  };

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

  // Show nothing during authentication check
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/organize")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold">Tạo sự kiện mới</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Điền thông tin chi tiết để tạo sự kiện của bạn
            </p>
          </div>
          
          {/* Preview Button - hide on small screens */}
          <div className="hidden sm:block">
            <PreviewModal data={occaData} />
          </div>
        </div>

        {/* Show on small screens */}
        <div className="sm:hidden flex justify-end">
          <PreviewModal data={occaData} />
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8">
                <TabsTrigger value="basic-info" disabled={!canGoToTab("basic-info")}>
                  Thông tin
                </TabsTrigger>
                <TabsTrigger value="shows" disabled={!canGoToTab("shows")}>
                  Suất diễn
                </TabsTrigger>
                <TabsTrigger value="tickets" disabled={!canGoToTab("tickets")}>
                  Vé
                </TabsTrigger>
                <TabsTrigger value="gallery" disabled={!canGoToTab("gallery")}>
                  Hình ảnh
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic-info">
                <BasicInfoForm 
                  data={occaData.basicInfo} 
                  onChange={(data) => handleFormChange("basicInfo", data)}
                  onNext={() => setActiveTab("shows")}
                />
              </TabsContent>

              <TabsContent value="shows">
                <ShowsForm
                  shows={occaData.shows}
                  onChange={(data) => handleFormChange("shows", data)}
                  onBack={() => setActiveTab("basic-info")}
                  onNext={() => setActiveTab("tickets")}
                />
              </TabsContent>

              <TabsContent value="tickets">
                <TicketForm 
                  tickets={occaData.tickets}
                  shows={occaData.shows}
                  onChange={(data) => handleFormChange("tickets", data)}
                  onBack={() => setActiveTab("shows")}
                  onNext={() => setActiveTab("gallery")}
                />
              </TabsContent>

              <TabsContent value="gallery">
                <GalleryForm
                  gallery={occaData.gallery}
                  onChange={(data) => handleFormChange("gallery", data)}
                  onBack={() => setActiveTab("tickets")}
                />
              </TabsContent>

              <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-8 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="order-2 sm:order-1"
                >
                  {isSaving && isDraft ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : null}
                  Lưu nháp
                </Button>
                <Button 
                  onClick={() => handleSave(false)}
                  disabled={isSaving || !isFormValid}
                  className="gap-2 order-1 sm:order-2"
                >
                  {isSaving && !isDraft ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Đăng sự kiện
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateOccaPage;
