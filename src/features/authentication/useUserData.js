import { useQuery } from "@tanstack/react-query";
import { fetchUserData } from "../../services/apiAuth";

export function useUserData() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUserData,
    refetchOnWindowFocus: false,
  });

  return {
    employee_id: data?.employee_id || "",
    username: data?.username || "",
    department_name: data?.department_name || "",
    role: data?.role || "",
    isLoading,
  };
}
