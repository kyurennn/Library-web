import { useCallback, useEffect, useState } from "react";

/**
 * Hook untuk mengambil data saat komponen tampil.
 *
 *   const { data, loading, error, reload } = useFetch(getBooks);
 *
 * - `fetcher` harus fungsi yang stabil (didefinisikan di luar komponen),
 *   menerima AbortSignal dan mengembalikan Promise.
 * - loading : true selama data belum datang
 * - error   : objek Error jika gagal (null jika berhasil)
 * - reload  : memanggil ulang request (untuk tombol "Coba lagi")
 */
export function useFetch(fetcher) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetcher(controller.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ data: null, error, loading: false });
      });

    return () => controller.abort();
  }, [fetcher, attempt]);

  const reload = useCallback(() => {
    setState({ data: null, error: null, loading: true });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}
