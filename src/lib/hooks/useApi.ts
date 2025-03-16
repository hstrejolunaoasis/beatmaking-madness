import { useState, useEffect } from "react";
import type { ApiResponse } from "@/lib/utils/api";

interface UseApiOptions<T> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  immediate?: boolean;
}

export function useApi<T>({
  url,
  method = "GET",
  body,
  onSuccess,
  onError,
  immediate = true,
}: UseApiOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (customBody?: any) => {
    try {
      setLoading(true);
      setError(null);

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (method !== "GET" && (body || customBody)) {
        options.body = JSON.stringify(customBody || body);
      }

      const response = await fetch(url, options);
      const result = await response.json() as ApiResponse<T>;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "An error occurred");
      }

      setData(result.data as T);
      onSuccess?.(result.data as T);
      return result.data;
    } catch (err) {
      setError(err);
      onError?.(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [url, immediate]);

  return { data, error, loading, refetch: fetchData };
} 