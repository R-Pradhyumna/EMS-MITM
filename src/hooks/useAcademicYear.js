import { useQuery } from "@tanstack/react-query";
import { getAcademicYear } from "../services/apiCoE";

export function useAcademicYear() {
  const {
    isLoading,
    data: ay,
    error,
  } = useQuery({
    queryKey: ["exam_papers"],
    queryFn: getAcademicYear,
  });

  return { isLoading, ay, error };
}
