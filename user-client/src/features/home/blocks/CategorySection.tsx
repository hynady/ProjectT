import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/commons/components/card.tsx";
import { Badge } from "@/commons/components/badge.tsx";
import { CategorySkeleton } from "@/features/home/skeletons/CategorySkeleton.tsx";
import { useNavigate } from "react-router-dom";
import { CategorySectionUnit } from "@/features/home/internal-types/home";

interface CategorySectionProps {
  categories: CategorySectionUnit[] | null;
  isLoading: boolean;
  error: string | null;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  isLoading,
  error,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CategorySkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <svg
          className="w-12 h-12 text-gray-400 mb-4" /* Add maintenance icon SVG */
        />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <svg
          className="w-12 h-12 text-gray-400 mb-4" /* Add empty state icon SVG */
        />
        <p className="text-gray-600">Không có bộ lọc nào</p>
      </div>
    );
  }

  const gradientClasses = [
    "bg-gradient-to-br from-chart-1 to-transparent",
    "bg-gradient-to-br from-chart-2 to-transparent",
    "bg-gradient-to-br from-chart-3 to-transparent",
    "bg-gradient-to-br from-chart-4 to-transparent",
    "bg-gradient-to-br from-chart-5 to-transparent",
  ];

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/search?categoryId=${categoryId}`);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.isArray(categories) ? (
        categories.map((category, index) => (
          <Card
            key={category.id}
            className={`group hover:-translate-y-2 cursor-pointer transition-all duration-300 ease-out ${gradientClasses[index % 5]
              }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <CardDescription>
                <Badge variant="secondary">{category.count} sự kiện</Badge>
              </CardDescription>
            </CardHeader>
          </Card>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
          <svg
            className="w-12 h-12 text-gray-400 mb-4" /* Add maintenance icon SVG */
          />
          <p className="text-gray-600">
            Lỗi hệ thống: thành phần không thể hiển thị, thử lại sau
          </p>
        </div>
      )}
    </div>
  );
};
