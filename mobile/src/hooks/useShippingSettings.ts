import { useQuery } from '@tanstack/react-query';
import { fetchShippingSettings } from '../services/shippingSettings.service';

export const useShippingSettings = () =>
  useQuery({
    queryKey: ['settings', 'shipping'],
    queryFn: fetchShippingSettings,
    staleTime: 60 * 1000,
  });
