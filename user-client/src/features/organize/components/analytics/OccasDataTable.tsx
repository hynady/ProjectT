import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/commons/components/table';

import { Button } from '@/commons/components/button';
import { Input } from '@/commons/components/input';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/commons/components/card';
import { Skeleton } from '@/commons/components/skeleton';
import { OccaAnalyticsData } from '../../services/analytics-trend.service';
import { formatCurrency } from '@/utils/formatters';

interface OccasDataTableProps {
  title?: string;
  description?: string;
  data: OccaAnalyticsData[] | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onSortChange: (field: keyof OccaAnalyticsData, order: 'asc' | 'desc') => void;
  onSearch?: (term: string) => void;
  sortField: keyof OccaAnalyticsData;
  sortOrder: 'asc' | 'desc';
}

const OccasDataTable: React.FC<OccasDataTableProps> = ({
  title = 'Phân tích sự kiện',
  description = 'Dữ liệu chi tiết về các sự kiện',
  data,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  onPageChange,
  onSortChange,
  onSearch,
  sortField,
  sortOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchTerm);
    }
  };

  const renderSortIcon = (field: keyof OccaAnalyticsData) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const handleSort = (field: keyof OccaAnalyticsData) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newOrder);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm sự kiện..."
                className="w-full pl-8 md:w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              <Filter className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead className="w-[350px]">Sự kiện</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('reach')}>
                <div className="flex items-center">
                  Lượt tiếp cận {renderSortIcon('reach')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('revenue')}>
                <div className="flex items-center">
                  Doanh thu {renderSortIcon('revenue')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('fillRate')}>
                <div className="flex items-center">
                  Tỉ lệ lấp đầy {renderSortIcon('fillRate')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>          <TableBody>
            {data && data.length > 0 ? (
              data.map((occa) => (
                <TableRow key={occa.id}>
                  <TableCell>{occa.id}</TableCell>
                  <TableCell className="font-medium">{occa.title}</TableCell>
                  <TableCell>{occa.reach.toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(occa.revenue)}</TableCell>
                  <TableCell>{occa.fillRate}%</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Không có dữ liệu sự kiện
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} trên {total} sự kiện
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = page;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OccasDataTable;
