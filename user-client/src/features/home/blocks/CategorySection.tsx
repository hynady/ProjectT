import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/commons/components/card.tsx";
import { Badge } from "@/commons/components/badge.tsx";
import {CategorySkeleton} from "@/features/home/skeletons/CategorySkeleton.tsx";
import {useNavigate} from "react-router-dom";

export interface CategorySectionUnit {
  id: string;
  name: string;
  count: number;
}

interface CategorySectionProps {
  categories: CategorySectionUnit[];
  loading: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ categories, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CategorySkeleton key={index} />
        ))}
      </div>
    );
  }

  const gradientClasses = [
    "bg-gradient-to-br from-chart-1 to-transparent",
    "bg-gradient-to-br from-chart-2 to-transparent",
    "bg-gradient-to-br from-chart-3 to-transparent",
    "bg-gradient-to-br from-chart-4 to-transparent",
    "bg-gradient-to-br from-chart-5 to-transparent"
  ];

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/search?categoryId=${categoryId}`);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category, index) => (
        <Card
          key={category.id}
          className={`group hover:-translate-y-2 cursor-pointer transition-all duration-300 ease-out ${gradientClasses[index % 5]}`}
          onClick={() => handleCategoryClick(category.id)}
        >
          <CardHeader>
            <CardTitle className="text-lg">
              {category.name}
            </CardTitle>
            <CardDescription>
              <Badge variant="secondary">
                {category.count} sự kiện
              </Badge>
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};