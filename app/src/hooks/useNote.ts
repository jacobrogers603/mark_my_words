import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const useNote = (id?: string) => {
  const { data, error, isLoading } = useSWR(
    id && id !== "new" ? `/api/getNote/${id}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: true,
      revalidateOnReconnect: false,
    }
  );

  if (id === "new") {
    return {
      data: { title: "", content: "" },
      error: null,
      isLoading: false,
    };
  }

  return { data, error, isLoading };
};

export default useNote;
