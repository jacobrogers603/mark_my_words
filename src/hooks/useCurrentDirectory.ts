// File to get the list of notes in the current directory
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const useCurrentDirectory = () => {
    const {data, error, isLoading, mutate} = useSWR('/api/getCurrentDirectory', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false        
    });

    return {data, error, isLoading, mutate};
}

export default useCurrentDirectory;