 import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Upload } from "lucide-react";
import { Button } from "@/commons/components/button";
import { Input } from "@/commons/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/commons/components/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/commons/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/commons/components/alert-dialog";
import { Label } from "@/commons/components/label";
import { useToast } from "@/commons/hooks/use-toast";
import { regionService, Region } from "./services/region.service";

interface RegionFormData {
  name: string;
  image?: string;
}

export default function RegionManagementPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState<RegionFormData>({ name: "", image: "" });
  const { toast } = useToast();  // Fetch regions from API
  const fetchRegions = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await regionService.getRegions();
      setRegions(response);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khu vực",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);  const handleCreateRegion = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập tên khu vực",
          variant: "destructive",
        });
        return;
      }

      await regionService.createRegion({ 
        name: formData.name,
        image: formData.image 
      });
      
      // Refresh the list after successful creation
      await fetchRegions();
      setFormData({ name: "", image: "" });
      setIsCreateDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Tạo khu vực thành công",
      });
    } catch (error) {
      console.error("Error creating region:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo khu vực",
        variant: "destructive",
      });
    }
  };  const handleEditRegion = async () => {
    try {
      if (!formData.name.trim() || !editingRegion) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập tên khu vực",
          variant: "destructive",
        });
        return;
      }

      await regionService.updateRegion(editingRegion.id, { 
        name: formData.name,
        image: formData.image 
      });

      // Refresh the list after successful update
      await fetchRegions();
      setFormData({ name: "", image: "" });
      setEditingRegion(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Cập nhật khu vực thành công",
      });
    } catch (error) {
      console.error("Error updating region:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật khu vực",
        variant: "destructive",
      });
    }
  };
  const handleDeleteRegion = async (regionId: string) => {
    try {
      await regionService.deleteRegion(regionId);
      // Refresh the list after successful deletion
      await fetchRegions();
      toast({
        title: "Thành công",
        description: "Xóa khu vực thành công",
      });
    } catch (error) {
      console.error("Error deleting region:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa khu vực",
        variant: "destructive",
      });
    }
  };const openEditDialog = (region: Region) => {
    setEditingRegion(region);
    setFormData({ name: region.regionName || "", image: region.regionImage || "" });
    setIsEditDialogOpen(true);
  };
  const filteredRegions = regions.filter(region =>
    region.regionName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Khu vực</h1>
          <p className="text-muted-foreground">
            Quản lý các khu vực tổ chức sự kiện trong hệ thống
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm khu vực
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo khu vực mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="regionName">Tên khu vực</Label>
                <Input
                  id="regionName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên khu vực..."
                />
              </div>
              <div>
                <Label htmlFor="regionImage">URL hình ảnh (tùy chọn)</Label>
                <Input
                  id="regionImage"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Nhập URL hình ảnh..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({ name: "", image: "" });
                    setIsCreateDialogOpen(false);
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreateRegion}>
                  Tạo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khu vực..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hình ảnh</TableHead>
              <TableHead>Tên khu vực</TableHead>
              <TableHead>Số sự kiện</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRegions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  {searchTerm ? "Không tìm thấy khu vực nào" : "Chưa có khu vực nào"}
                </TableCell>
              </TableRow>
            ) : (              filteredRegions.map((region) => (
                <TableRow key={region.id}>
                  <TableCell>
                    {region.regionImage ? (
                      <img 
                        src={region.regionImage} 
                        alt={region.regionName || "Region image"}
                        className="h-10 w-10 rounded-md object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/50/50";
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                        <Upload className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{region.regionName || "N/A"}</TableCell>
                  <TableCell>{region.occaCount || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(region)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa khu vực "{region.regionName || "này"}"? 
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteRegion(region.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khu vực</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editRegionName">Tên khu vực</Label>
              <Input
                id="editRegionName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên khu vực..."
              />
            </div>
            <div>
              <Label htmlFor="editRegionImage">URL hình ảnh (tùy chọn)</Label>
              <Input
                id="editRegionImage"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Nhập URL hình ảnh..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({ name: "", image: "" });
                  setEditingRegion(null);
                  setIsEditDialogOpen(false);
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleEditRegion}>
                Cập nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
