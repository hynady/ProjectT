import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/commons/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/tabs";
import { BasicInfoForm } from "./components/BasicInfoForm";
import { ShowsForm } from "./components/ShowsForm";
import { TicketForm } from "./components/TicketForm";
import { GalleryForm } from "./components/GalleryForm";
import { useAuth } from "@/features/auth/contexts";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { OccaFormData } from "./internal-types/organize.type";
import { useOccaForm } from "./hooks/useOccaForm";
import { OccaFormHeader } from "./components/create/OccaFormHeader";
import { OccaFormNavigation } from "./components/create/OccaFormNavigation";

interface CreateOccaPageProps {
  isEditing?: boolean;
  occaId?: string;
  initialData?: OccaFormData;
}

const CreateOccaPage = ({ isEditing = false, occaId, initialData }: CreateOccaPageProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  // Use our custom hook to manage form state and logic
  const { 
    occaData, 
    activeTab, 
    isSaving, 
    isDraft, 
    isSubmitting, 
    isFormValid,
    setActiveTab,
    handleSave,
    handleSubmitForApproval,
    updateBasicInfo,
    updateShows,
    updateTickets,
    updateGallery
  } = useOccaForm({ isEditing, occaId, initialData });

  // Handle auth redirect
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { state: { from: isEditing ? `/organize/edit/${occaId}` : "/organize/create" } });
    }
  }, [isAuthenticated, loading, navigate, isEditing, occaId]);

  // Show nothing during authentication check
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container py-4 sm:py-6 pb-16 sm:pb-6 px-4 sm:px-6">
        {/* Header with actions */}
        <OccaFormHeader
          isEditing={isEditing}
          occaData={occaData}
          isFormValid={isFormValid}
          isSaving={isSaving}
          isDraft={isDraft}
          isSubmitting={isSubmitting}
          onSave={handleSave}
          onSubmit={handleSubmitForApproval}
          onNavigateToTab={setActiveTab}
        />

        <Card>
          <CardContent className="p-4 sm:p-6">
            {/* Mobile navigation components (progress indicator) */}
            <OccaFormNavigation
              activeTab={activeTab}
              occaData={occaData}
              isFormValid={isFormValid}
              onTabChange={setActiveTab}
              onSave={() => handleSave(false)}
            />
            
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
                  onChange={updateBasicInfo}
                  onNext={() => setActiveTab("shows")}
                />
              </TabsContent>
              <TabsContent value="shows">
                <ShowsForm
                  shows={occaData.shows}
                  onChange={updateShows}
                  onBack={() => setActiveTab("basic-info")}
                  onNext={() => setActiveTab("tickets")}
                />
              </TabsContent>
              <TabsContent value="tickets">
                <TicketForm
                  tickets={occaData.tickets}
                  shows={occaData.shows}
                  onChange={updateTickets}
                  onBack={() => setActiveTab("shows")}
                  onNext={() => setActiveTab("gallery")}
                />
              </TabsContent>
              <TabsContent value="gallery">
                <GalleryForm
                  gallery={occaData.gallery}
                  onChange={updateGallery}
                  onBack={() => setActiveTab("tickets")}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateOccaPage;
