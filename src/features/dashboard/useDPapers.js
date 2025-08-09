import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSchema } from "../../services/apiDashboard";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";

export function useDPapers() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    data: { data: papers, count } = {},
    error,
  } = useQuery({
    queryKey: ["exam_papers", page],
    queryFn: () => getSchema({ page }),
  });

  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      // Query key must match the main query's pattern
      queryKey: ["exam_papers", page + 1],
      queryFn: () => getSchema({ page: page + 1 }),
    });

  // Prefetch the previous page (when not on first page)
  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["exam_papers", page - 1],
      queryFn: () => getSchema({ page: page - 1 }),
    });

  // Return all the values the component will need: loading state, error, table data, total count
  return { isLoading, error, papers, count: count ?? 0 };
}
