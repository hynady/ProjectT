import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {CategorySkeleton} from "@/app/homepage/components/skeletons/CategorySkeleton.tsx";

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category, index) => (
        <Card
          key={category.id}
          className={`group hover:-translate-y-2 cursor-pointer transition-all duration-300 ease-out ${gradientClasses[index % 5]}`}
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