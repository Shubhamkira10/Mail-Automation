import { useState, useEffect, useCallback } from "react";

export default function usePolling(fetchFn, interval = 5000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setLoading(false);
    } catch (err) {
      console.error("Polling error:", err);
      setLoading(false);
    }
  }, [fetchFn, interval]);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, interval);
    return () => clearInterval(id);
  }, [loadData, interval]);

  return { data, loading };
}
