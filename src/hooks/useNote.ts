import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const useNote = (id?: string) => {
  const { data, error, isLoading } = useSWR(
    id ? `/api/getNote/${id}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  return { data, error, isLoading };
};

export default useNote;
