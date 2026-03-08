import { useQuery } from '@tanstack/react-query';
import homeCategoryService from '../services/homeCategory.service';

export const useHomeCategoriesForApp = () => {
  return useQuery({
    queryKey: ['home-categories', 'app'],
    queryFn: () => homeCategoryService.getActiveForApp(),
    staleTime: 5 * 60 * 1000,
  });
};
