import useSWR from "swr";
import fetcher from "@/lib/fetcher";

// Get the current path ids

const useCurrentPath = () => {
    const {data, error, isLoading, mutate} = useSWR('/api/getCurrentPath', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false        
    });

    return {data, error, isLoading, mutate};
}

export default useCurrentPath;