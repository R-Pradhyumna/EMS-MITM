import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPapers } from "../../services/apiFaculty";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";

export function useFPapers() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    data: { data: papers, count } = {},
    error,
  } = useQuery({
    queryKey: ["exam_papers", page],
    queryFn: () => getPapers({ page }),
  });

  // Prefetching
  const pageCount = Math.ceil(count / PAGE_SIZE);
  if (page < pageCount)
    queryClient.prefetchQuery({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ["exam_papers", page + 1],
      queryFn: () => getPapers({ page: page + 1 }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ["exam_papers", page - 1],
      queryFn: () => getPapers({ page: page - 1 }),
    });

  return { isLoading, error, papers, count: count ?? 0 };
}
