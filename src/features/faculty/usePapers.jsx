import { useQuery } from "@tanstack/react-query";
import { getPapers } from "../../services/apiFaculty";

export function usePapers() {
  const {
    isLoading,
    data: papers,
    error,
  } = useQuery({
    queryKey: ["exam_papers"],
    queryFn: getPapers,
  });

  return { isLoading, error, papers };
}
