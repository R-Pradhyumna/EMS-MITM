import { useQuery } from "@tanstack/react-query";

export function useDept() {
  const { data, error } = useQuery({
    queryKey: ["departments"],
  });
}
