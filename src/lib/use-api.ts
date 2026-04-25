import { DependencyList, useEffect, useState } from 'react';

export function useApiData<T>(
  loader: () => Promise<T>,
  deps: DependencyList,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const result = await loader();
        if (!cancelled) {
          setData(result);
        }
      } catch (loaderError) {
        if (!cancelled) {
          setError(loaderError instanceof Error ? loaderError.message : 'Request failed');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return {
    data,
    loading,
    error,
    reload: () => setReloadKey((current) => current + 1),
    setData,
  };
}
