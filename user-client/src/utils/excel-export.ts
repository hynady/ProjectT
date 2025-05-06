import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { 
  AnalyticsOverviewData,
  OccaAnalyticsData,
  RevenueOverviewData,
  TrendData,
  RevenueTrendData
} from '@/features/organize/services/analytics-trend.service';

interface WorksheetStyle {
  '!cols': { wch: number }[];
  '!merges'?: XLSX.Range[];
}

const applyStyles = (sheet: XLSX.WorkSheet, styles: WorksheetStyle) => {
  // Apply column widths
  sheet['!cols'] = styles['!cols'];
  
  // Apply merges if any
  if (styles['!merges']) {
    sheet['!merges'] = styles['!merges'];
  }
};

type ExcelCellValue = string | number | boolean | Date;
type ExcelRow = ExcelCellValue[];
type ExcelData = ExcelRow[];

/**
 * Generate an Excel file with all analytics data and trigger download
 */
export const generateAnalyticsExcel = (
  fileName: string,
  data: {
    overview?: AnalyticsOverviewData | null,
    revenue?: RevenueOverviewData | null,
    visitorTrend?: TrendData[] | null,
    revenueTrend?: RevenueTrendData[] | null,
    occas?: OccaAnalyticsData[] | null,
    dateRange: { from: Date, to: Date }
  }
) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Add sheet name colors and column widths
    const defaultColumnWidth = { wch: 20 };
    const titleColumnWidth = { wch: 35 };
    const numberColumnWidth = { wch: 15 };
    
    // Format data for Excel sheets
    if (data.overview) {
      // Overview Sheet
      const overviewData: ExcelData = [
        ['Thông tin tổng quan'],
        ['Thời gian', `${format(data.dateRange.from, 'dd/MM/yyyy')} - ${format(data.dateRange.to, 'dd/MM/yyyy')}`],
        ['Tổng lượt tiếp cận', data.overview.totalReach],
        [''],
        ['Phân bố nguồn truy cập'],
        ['Nguồn', 'Số lượt', 'Tỉ lệ (%)']
      ];
      
      // Add source distribution data
      const totalReach = data.overview?.totalReach || 0;
      data.overview?.sourceDistribution?.forEach(source => {
        const percentage = totalReach > 0 ? ((source.count / totalReach) * 100).toFixed(1) : '0.0';
        overviewData.push([
          source.name, 
          source.count as ExcelCellValue,
          Number(percentage) as ExcelCellValue
        ]);
      });
      
      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
      
      // Apply column widths and merge cells for title
      applyStyles(overviewSheet, {
        '!cols': [
          titleColumnWidth,
          defaultColumnWidth,
          numberColumnWidth
        ],
        '!merges': [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Merge title cells
          { s: { r: 4, c: 0 }, e: { r: 4, c: 2 } }  // Merge distribution title cells
        ]
      });

      // Format numbers
      for (let R = 2; R < overviewData.length; R++) {
        const cell = XLSX.utils.encode_cell({r: R, c: 1});
        if (overviewSheet[cell] && typeof overviewSheet[cell].v === 'number') {
          overviewSheet[cell].z = '#,##0';
        }
        const percCell = XLSX.utils.encode_cell({r: R, c: 2});
        if (overviewSheet[percCell] && typeof overviewSheet[percCell].v === 'number') {
          overviewSheet[percCell].z = '0.0"%"';
        }
      }
      
      XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Tổng quan');
    }
    
    if (data.revenue) {
      // Revenue Overview Sheet
      const revenueData: ExcelData = [
        ['Thông tin doanh thu'],
        ['Thời gian', `${format(data.dateRange.from, 'dd/MM/yyyy')} - ${format(data.dateRange.to, 'dd/MM/yyyy')}`],
        ['Tổng doanh thu', data.revenue.totalRevenue],
        [''],
        ['Phân bố doanh thu theo loại'],
        ['Loại', 'Doanh thu', 'Tỉ lệ (%)']
      ];
      
      // Add revenue distribution data
      const totalRevenue = data.revenue?.totalRevenue || 0;
      data.revenue?.revenueDistribution?.forEach(source => {
        const percentage = totalRevenue > 0 ? ((source.amount / totalRevenue) * 100).toFixed(1) : '0.0';
        revenueData.push([
          source.name, 
          source.amount as ExcelCellValue,
          Number(percentage) as ExcelCellValue
        ]);
      });
      
      const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
      
      // Apply column widths and merge cells for title
      applyStyles(revenueSheet, {
        '!cols': [
          titleColumnWidth,
          defaultColumnWidth,
          numberColumnWidth
        ],
        '!merges': [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Merge title cells
          { s: { r: 4, c: 0 }, e: { r: 4, c: 2 } }  // Merge distribution title cells
        ]
      });

      // Format currency and percentages
      for (let R = 2; R < revenueData.length; R++) {
        const moneyCell = XLSX.utils.encode_cell({r: R, c: 1});
        if (revenueSheet[moneyCell] && typeof revenueSheet[moneyCell].v === 'number') {
          revenueSheet[moneyCell].z = '#,##0" ₫"';
        }
        const percCell = XLSX.utils.encode_cell({r: R, c: 2});
        if (revenueSheet[percCell] && typeof revenueSheet[percCell].v === 'number') {
          revenueSheet[percCell].z = '0.0"%"';
        }
      }
      
      XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Doanh thu');
    }
    
    if (data.visitorTrend) {
      // Visitor Trend Sheet
      const trendData: ExcelData = [
        ['Xu hướng truy cập theo thời gian'],
        ['Thời gian', `${format(data.dateRange.from, 'dd/MM/yyyy')} - ${format(data.dateRange.to, 'dd/MM/yyyy')}`],
        [''],
        ['Ngày', 'Lượt truy cập']
      ];
      
      // Add visitor trend data
      data.visitorTrend.forEach(point => {
        trendData.push([point.date as ExcelCellValue, point.visitors as ExcelCellValue]);
      });
      
      const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
      
      // Apply column widths and merge cells for title
      applyStyles(trendSheet, {
        '!cols': [
          { wch: 12 },
          { wch: 15 }
        ],
        '!merges': [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } } // Merge title cells
        ]
      });

      // Format numbers
      for (let R = 4; R < trendData.length; R++) {
        const cell = XLSX.utils.encode_cell({r: R, c: 1});
        if (trendSheet[cell] && typeof trendSheet[cell].v === 'number') {
          trendSheet[cell].z = '#,##0';
        }
      }
      
      XLSX.utils.book_append_sheet(workbook, trendSheet, 'Xu hướng truy cập');
    }
    
    if (data.revenueTrend) {
      // Revenue Trend Sheet
      const revenueTrendData: ExcelData = [
        ['Xu hướng doanh thu theo thời gian'],
        ['Thời gian', `${format(data.dateRange.from, 'dd/MM/yyyy')} - ${format(data.dateRange.to, 'dd/MM/yyyy')}`],
        [''],
        ['Ngày', 'Doanh thu']
      ];
      
      // Add revenue trend data
      data.revenueTrend.forEach(point => {
        revenueTrendData.push([point.date as ExcelCellValue, point.revenue as ExcelCellValue]);
      });
      
      const revenueTrendSheet = XLSX.utils.aoa_to_sheet(revenueTrendData);
      
      // Apply column widths and merge cells for title
      applyStyles(revenueTrendSheet, {
        '!cols': [
          { wch: 12 },
          { wch: 18 }
        ],
        '!merges': [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } } // Merge title cells
        ]
      });

      // Format currency
      for (let R = 4; R < revenueTrendData.length; R++) {
        const cell = XLSX.utils.encode_cell({r: R, c: 1});
        if (revenueTrendSheet[cell] && typeof revenueTrendSheet[cell].v === 'number') {
          revenueTrendSheet[cell].z = '#,##0" ₫"';
        }
      }
      
      XLSX.utils.book_append_sheet(workbook, revenueTrendSheet, 'Xu hướng doanh thu');
    }
    
    if (data.occas) {
      // All Events Sheet  
      const occasData: ExcelData = [
        ['Danh sách sự kiện'],
        ['Thời gian', `${format(data.dateRange.from, 'dd/MM/yyyy')} - ${format(data.dateRange.to, 'dd/MM/yyyy')}`],
        [''],
        ['ID', 'Tên sự kiện', 'Lượt tiếp cận', 'Doanh thu', 'Tỉ lệ lấp đầy (%)']
      ];
      
      // Add all events data
      data.occas.forEach(occa => {
        occasData.push([
          occa.id as ExcelCellValue,
          occa.title as ExcelCellValue,
          occa.reach as ExcelCellValue,
          occa.revenue as ExcelCellValue,
          occa.fillRate as ExcelCellValue
        ]);
      });
      
      const occasSheet = XLSX.utils.aoa_to_sheet(occasData);
      
      // Apply column widths and merge cells for title
      applyStyles(occasSheet, {
        '!cols': [
          { wch: 10 }, // ID
          { wch: 40 }, // Event name
          { wch: 15 }, // Reach
          { wch: 18 }, // Revenue
          { wch: 15 }  // Fill rate
        ],
        '!merges': [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Merge title cells
          { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } }  // Merge date range cells
        ]
      });

      // Format numbers, currency and percentages
      for (let R = 4; R < occasData.length; R++) {
        const reachCell = XLSX.utils.encode_cell({r: R, c: 2});
        if (occasSheet[reachCell] && typeof occasSheet[reachCell].v === 'number') {
          occasSheet[reachCell].z = '#,##0';
        }
        
        const revenueCell = XLSX.utils.encode_cell({r: R, c: 3});
        if (occasSheet[revenueCell] && typeof occasSheet[revenueCell].v === 'number') {
          occasSheet[revenueCell].z = '#,##0" ₫"';
        }
        
        const rateCell = XLSX.utils.encode_cell({r: R, c: 4});
        if (occasSheet[rateCell] && typeof occasSheet[rateCell].v === 'number') {
          occasSheet[rateCell].z = '0.0"%"';
        }
      }
      
      XLSX.utils.book_append_sheet(workbook, occasSheet, 'Sự kiện');
    }
    
    // Add metadata to the workbook
    workbook.Props = {
      Title: `Báo cáo phân tích từ ${format(data.dateRange.from, 'dd/MM/yyyy')} đến ${format(data.dateRange.to, 'dd/MM/yyyy')}`,
      Subject: 'Analytics Report',
      Author: 'ProjectT Analytics',
      CreatedDate: new Date()
    };
    
    // Write to Excel file and trigger download
    XLSX.writeFile(workbook, fileName);
    return true;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return false;
  }
};
