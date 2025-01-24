import {OccaSearchItemBaseUnit} from "@/features/search/components/OccaSearchItem.tsx";
import {recommendData, trendingData} from "@/features/search/hooks/mockData.tsx";

export const searchOccasAPI = async (query: string): Promise<OccaSearchItemBaseUnit[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (query.toLowerCase().includes('fest')) {
    return [
      {
        id: 'api-1',
        title: `Similar to "${query}" - Occa 1`,
        date: '2025-01-15',
        location: 'Location A',
      },
      {
        id: 'api-2',
        title: `Similar to "${query}" - Occa 2`,
        date: '2025-01-20',
        location: 'Location B',
      }
    ];
  }
  return [];
};

export const fetchTrendingData = async (): Promise<OccaSearchItemBaseUnit[]> => {
  return new Promise<OccaSearchItemBaseUnit[]>((resolve) => {
    setTimeout(() => resolve(trendingData), 1000);
  });
};

export const fetchRecommendedData = async (): Promise<OccaSearchItemBaseUnit[]> => {
  return new Promise<OccaSearchItemBaseUnit[]>((resolve) => {
    setTimeout(() => resolve(recommendData), 1000);
  });
}