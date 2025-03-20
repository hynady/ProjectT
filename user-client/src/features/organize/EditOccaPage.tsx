import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/commons/components/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/commons/components/alert";
import { Button } from "@/commons/components/button";
import { useAuth } from "@/features/auth/contexts";
import { organizeService } from "./services/organize.service";
import { OccaFormData } from "./internal-types/organize.type";
import { DashboardLayout } from "./layouts/DashboardLayout";
import CreateOccaPage from "./CreateOccaPage";

const EditOccaPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occaData, setOccaData] = useState<OccaFormData | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: `/organize/edit/${id}` } });
    }
  }, [isAuthenticated, authLoading, navigate, id]);

  useEffect(() => {
    const fetchOccaData = async () => {
      if (!id) {
        setError("ID sự kiện không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await organizeService.getOccaById(id);
        setOccaData(data);
      } catch (error) {
        console.error("Failed to fetch occa data:", error);
        setError("Không thể tải thông tin sự kiện. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOccaData();
    }
  }, [id, isAuthenticated]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate("/organize");
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error || !occaData) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              <span>{error || "Không thể tải thông tin sự kiện"}</span>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleGoBack}>
                  Quay lại
                </Button>
                <Button variant="default" onClick={handleRetry}>
                  Thử lại
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // Forward to the CreateOccaPage component with initial data and isEditing flag
  return <CreateOccaPage isEditing={true} occaId={id} initialData={occaData} />;
};

export default EditOccaPage;
