import { useState, useEffect, useCallback } from 'react';

/**
 * useApi - Generic async data-fetching hook
 * @param {function} apiFunc - async function to call
 * @param {boolean} immediate - call on mount if true
 */
const useApi = (apiFunc, immediate = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err?.message || 'Something went wrong');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  useEffect(() => {
    if (immediate) execute();
  }, []);

  return { data, loading, error, execute };
};

export default useApi;
