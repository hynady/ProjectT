import { useBackgroundContext } from "@/features/chatbot/hooks/useBackgroundContext";
import { BackgroundContext } from "@/features/chatbot/services/backgroundContextService";
import {
  RefreshCw,
  Plus,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/commons/components/button";
import { Input } from "@/commons/components/input";
import { Label } from "@/commons/components/label";
import { Card, CardContent, CardTitle } from "@/commons/components/card";
import { Textarea } from "@/commons/components/textarea";

interface BackgroundContextFormProps {
  context?: BackgroundContext;
  onSubmit: (
    context: Omit<
      BackgroundContext,
      "id" | "createdAt" | "updatedAt" | "isActive"
    >
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BackgroundContextForm: React.FC<BackgroundContextFormProps> = ({
  context,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: context?.title || "",
    content: context?.content || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {" "}
      <div>
        <Label htmlFor="title" className="block text-sm font-medium mb-2">
          Tiêu đề
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Ví dụ: Hỗ trợ khách hàng e-commerce"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="content" className="block text-sm font-medium mb-2">
          Nội dung hướng dẫn
        </Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          placeholder="Hãy mô tả chi tiết cách bạn muốn chatbot hoạt động, ví dụ:&#10;&#10;Bạn là trợ lý ảo của cửa hàng ABC. Nhiệm vụ của bạn là:&#10;- Hỗ trợ khách hàng về sản phẩm và dịch vụ&#10;- Luôn lịch sự và chuyên nghiệp&#10;- Nếu không biết thông tin, hãy hướng dẫn khách hàng liên hệ hotline"
          rows={8}
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Nội dung này sẽ được sử dụng để hướng dẫn chatbot cách trả lời khách
          hàng
        </p>
      </div>
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button type="submit" loading={isLoading}>
          {context ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  );
};

export const BackgroundContextManagement: React.FC = () => {
  const {
    contexts,
    loading,
    error,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    createContext,
    updateContext,
    deleteContext,
    toggleActiveStatus,
    loadNextPage,
    loadPreviousPage,
    clearError,
    refresh,
  } = useBackgroundContext();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContext, setEditingContext] =
    useState<BackgroundContext | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Local state for UI responsiveness and debouncing
  const [localActiveId, setLocalActiveId] = useState<number | null>(null);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  ); // Reset local state when contexts change (e.g., after successful API call)
  useEffect(() => {
    // Reset local active ID when contexts are updated from server
    // This ensures server state is the source of truth after API calls complete
    if (localActiveId !== null) {
      const hasActiveContext = contexts.find(
        (ctx) => ctx.isActive && ctx.id === localActiveId
      );
      if (hasActiveContext) {
        // API call was successful, reset local state
        setLocalActiveId(null);
      }
    }
  }, [contexts, localActiveId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);
  const handleCreate = async (
    contextData: Omit<
      BackgroundContext,
      "id" | "createdAt" | "updatedAt" | "isActive"
    >
  ) => {
    try {
      await createContext({ ...contextData, isActive: true });
      setIsCreateDialogOpen(false);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleUpdate = async (
    contextData: Omit<
      BackgroundContext,
      "id" | "createdAt" | "updatedAt" | "isActive"
    >
  ) => {
    if (!editingContext?.id) return;

    try {
      await updateContext(editingContext.id, {
        ...contextData,
        isActive: editingContext.isActive,
      });
      setIsEditDialogOpen(false);
      setEditingContext(null);
    } catch {
      // Error is handled by the hook
    }
  };
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa context này?")) {
      try {
        await deleteContext(id);
      } catch {
        // Error is handled by the hook
      }
    }
  };
  // Handle radio button change with debounce
  const handleRadioChange = (contextId: number) => {
    // Update UI immediately for responsiveness
    setLocalActiveId(contextId);

    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Debounce API call
    const timeout = setTimeout(async () => {
      try {
        await toggleActiveStatus(contextId);
        // Reset local state after successful API call
        setLocalActiveId(null);
      } catch {
        // If API call fails, reset local state to reflect server truth
        setLocalActiveId(null);
      }
    }, 1000); // 1 second debounce

    setDebounceTimeout(timeout);
  };

  // Handle card click (same logic as radio change)
  const handleCardClick = (contextId: number, event: React.MouseEvent) => {
    // Don't trigger if clicking on buttons or radio
    if (
      (event.target as HTMLElement).closest("button") ||
      (event.target as HTMLElement).tagName === "INPUT"
    ) {
      return;
    }

    handleRadioChange(contextId);
  };

  const openEditDialog = (context: BackgroundContext) => {
    setEditingContext(context);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };
  return (
    <div className="space-y-6">
      {" "}
      {/* Action Bar */}
      <div className="flex justify-end items-center space-x-3">
        <Button variant="outline" onClick={refresh} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Reload
        </Button>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm mới
        </Button>
      </div>{" "}
      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}{" "}
      {/* Context Cards */}
      <div className="space-y-4">
        {loading && contexts.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : contexts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Chưa có nội dung hướng dẫn nào
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Tạo nội dung đầu tiên
            </Button>
          </div>
        ) : (
          <>
            {/* Instruction */}
            {contexts.map((context) => (
              <Card
                key={context.id}
                className={`transition-all cursor-pointer ${
                  localActiveId !== null
                    ? localActiveId === context.id
                      ? "border-primary bg-primary/10 shadow-md"
                      : "hover:bg-accent/50"
                    : context.isActive
                    ? "border-primary bg-primary/10 shadow-md"
                    : "hover:bg-accent/50"
                }`}
                onClick={(e) => context.id && handleCardClick(context.id, e)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Radio Button */}
                    <div className="pt-1">
                      {" "}
                      <input
                        type="radio"
                        name="activeContext"
                        checked={
                          localActiveId !== null
                            ? localActiveId === context.id
                            : context.isActive || false
                        }
                        onChange={() =>
                          context.id && handleRadioChange(context.id)
                        }
                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                        disabled={loading}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg">
                            {context.title}
                          </CardTitle>{" "}
                          {(localActiveId !== null
                            ? localActiveId === context.id
                            : context.isActive) && (
                            <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                              Đang sử dụng
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(context)}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              context.id && handleDelete(context.id)
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-card rounded-lg p-4 mb-3">
                        <p className="text-sm leading-relaxed">
                          {context.content.length > 300
                            ? `${context.content.substring(0, 300)}...`
                            : context.content}
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <span>
                          Tạo:{" "}
                          {context.createdAt && formatDate(context.createdAt)}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          Cập nhật:{" "}
                          {context.updatedAt && formatDate(context.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>{" "}
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>{" "}
      {/* Pagination */}
      {(hasNextPage || hasPreviousPage) && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={loadPreviousPage}
            disabled={!hasPreviousPage || loading}
          >
            Trang trước
          </Button>

          <span className="text-sm text-muted-foreground">
            Trang {currentPage + 1}
          </span>

          <Button
            variant="outline"
            onClick={loadNextPage}
            disabled={!hasNextPage || loading}
          >
            Trang sau
          </Button>
        </div>
      )}{" "}
      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsCreateDialogOpen(false)}
            ></div>

            <div className="relative bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Tạo nội dung hướng dẫn mới
                </h3>
                <BackgroundContextForm
                  onSubmit={handleCreate}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Dialog */}
      {isEditDialogOpen && editingContext && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingContext(null);
              }}
            ></div>

            <div className="relative bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Chỉnh sửa nội dung hướng dẫn
                </h3>
                <BackgroundContextForm
                  context={editingContext}
                  onSubmit={handleUpdate}
                  onCancel={() => {
                    setIsEditDialogOpen(false);
                    setEditingContext(null);
                  }}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
