import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPaper } from "../../services/apiCoE";

export function useCPaper() {
  const { id } = useParams();
  const {
    isLoading,
    data: paper,
    error,
  } = useQuery({
    queryKey: ["exam_papers", id],
    queryFn: () => getPaper(id),
    retry: false,
  });

  return { isLoading, error, paper };
}
