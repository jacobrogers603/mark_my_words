"use client";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

export const useCurrentUser = () => {
    const { data, error, isLoading, mutate } = useSWR('/api/current', fetcher);

    return { data, error, isLoading, mutate };
}