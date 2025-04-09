import useSWR from 'swr';
import { api } from './api';

const fetcher = async <T>(url: string): Promise<T> => {
  const token = localStorage.getItem('accessToken');

  const response = await api.get<T>(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  return response.data;
};

export function useSwr<T>(url: string) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher);

  return {
    data,
    error,
    loading: isLoading,
    mutate,
  };
}
