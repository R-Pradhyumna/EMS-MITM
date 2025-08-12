import { useQuery } from "@tanstack/react-query";
import { fetchUserRole } from "../../services/apiAuth";

export function useRole() {
  const { data: role, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUserRole,
    refetchOnWindowFocus: false,
  });

  return { role, isLoading };
}
