import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../services/apiCoE";

export function useDepartments() {
  const { isLoading, data, error } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  return { isLoading, data, error };
}
