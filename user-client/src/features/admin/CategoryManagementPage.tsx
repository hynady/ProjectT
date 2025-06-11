import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
import { categoryService } from "./services/category.service";

interface Category {
  id: string;
  name: string;
  eventCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryFormData {
  name: string;
}

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: "" });
  const { toast } = useToast();  // Fetch categories from API
  const fetchCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();      // Convert CategoryResponse to Category format
      const categoryData: Category[] = response.map(item => ({
        id: item.id,
        name: item.name,
        eventCount: item.count,
        createdAt: new Date().toISOString().split('T')[0], // Mock date
        updatedAt: new Date().toISOString().split('T')[0], // Mock date
      }));
      setCategories(categoryData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách phân loại",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);  const handleCreateCategory = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập tên phân loại",
          variant: "destructive",
        });
        return;
      }

      const result = await categoryService.createCategory({ name: formData.name });
      
      // Add new category to the list
      const newCategory: Category = {
        id: result.id,
        name: result.name,
        eventCount: result.eventCount || 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setCategories(prev => [...prev, newCategory]);
      setFormData({ name: "" });
      setIsCreateDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Tạo phân loại thành công",
      });
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo phân loại",
        variant: "destructive",
      });
    }
  };  const handleEditCategory = async () => {
    try {
      if (!formData.name.trim() || !editingCategory) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập tên phân loại",
          variant: "destructive",
        });
        return;
      }

      const result = await categoryService.updateCategory(editingCategory.id, { name: formData.name });

      // Update category in the list
      setCategories(prev =>
        prev.map(category =>
          category.id === editingCategory.id
            ? { 
                ...category, 
                name: result.name, 
                updatedAt: new Date().toISOString().split('T')[0] 
              }
            : category
        )
      );

      setFormData({ name: "" });
      setEditingCategory(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Cập nhật phân loại thành công",
      });
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật phân loại",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await categoryService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      toast({
        title: "Thành công",
        description: "Xóa phân loại thành công",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa phân loại",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsEditDialogOpen(true);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Phân loại</h1>
          <p className="text-muted-foreground">
            Quản lý các phân loại sự kiện trong hệ thống
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm phân loại
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo phân loại mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Tên phân loại</Label>
                <Input
                  id="categoryName"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Nhập tên phân loại..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({ name: "" });
                    setIsCreateDialogOpen(false);
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreateCategory}>
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
            placeholder="Tìm kiếm phân loại..."
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
              <TableHead>Tên phân loại</TableHead>
              <TableHead>Số sự kiện</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
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
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  {searchTerm ? "Không tìm thấy phân loại nào" : "Chưa có phân loại nào"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.eventCount || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa phân loại "{category.name}"? 
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.id)}
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
            <DialogTitle>Chỉnh sửa phân loại</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCategoryName">Tên phân loại</Label>
              <Input
                id="editCategoryName"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Nhập tên phân loại..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({ name: "" });
                  setEditingCategory(null);
                  setIsEditDialogOpen(false);
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleEditCategory}>
                Cập nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
