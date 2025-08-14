import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPapers } from "../../services/apiFaculty";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
import { useUserData } from "./../authentication/useUserData";

/**
 * useFPapers
 * ----------
 * Fetches (and paginates) faculty paper data from API.
 * - Reads current page number from URL search params
 * - Provides loading, error, data, and total count for UI
 * - Prefetches next/previous page for fast UX
 */
export function useFPapers() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { employee_id } = useUserData();
  // Parse "page" query param from the URL, fallback to 1 if not present
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // Fetch data using React Query.
  // - queryKey ensures caching is per-page
  // - queryFn calls getPapers with page info
  // - Destructure result so "papers" is your data array, "count" is total records
  const {
    isLoading,
    data: { data: papers, count } = {},
    error,
  } = useQuery({
    queryKey: ["exam_papers", page],
    queryFn: () => getPapers({ page, employee_id }),
  });

  // Compute how many pages exist given the current total count
  const pageCount = Math.ceil(count / PAGE_SIZE);

  // Prefetch the next page if there is one, so navigation feels instant
  if (page < pageCount)
    queryClient.prefetchQuery({
      // Query key must match the main query's pattern
      queryKey: ["exam_papers", page + 1],
      queryFn: () => getPapers({ page: page + 1 }),
    });

  // Prefetch the previous page (when not on first page)
  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["exam_papers", page - 1],
      queryFn: () => getPapers({ page: page - 1 }),
    });

  // Return all the values the component will need: loading state, error, table data, total count
  return { isLoading, error, papers, count: count ?? 0 };
}
