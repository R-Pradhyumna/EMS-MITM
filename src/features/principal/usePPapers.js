import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getPapers } from "../../services/apiPrincipal";
import { PAGE_SIZE } from "../../utils/constants";
import { format } from "date-fns";

/**
 * usePPapers
 * ----------
 * React Query hook to fetch Principal's exam papers, filtered/paginated/grouped as needed.
 *
 * Key behaviors:
 * - Reads filters/search/pagination from URL params (enables deep-linking/search)
 * - Limits papers to today's date and status "Locked" (available for principal/this session)
 * - Prefetches adjacent pages (smooth UX)
 * - Groups/returns result plus count for pagination
 */
export function usePPapers() {
  const queryClient = useQueryClient(); // Used for cache invalidation, prefetching
  const [searchParams] = useSearchParams(); // Access URL search params

  // 1. Extract filters for department, academic year, and subject code from the URL
  const dept = searchParams.get("department_name"); // "ISE", "CSE", or "all"
  const academicYear = searchParams.get("academic_year"); // "2023" or "all"
  const subjectCode = searchParams.get("subject_code") ?? ""; // Used for searching specific subject code
  const today = format(new Date(), "yyyy-MM-dd"); // Only papers for today's date considered

  // 2. Compose filter array for DB query
  const filters = [];
  if (dept && dept !== "all")
    filters.push({ field: "department_name", value: dept });
  if (academicYear && academicYear !== "all")
    filters.push({ field: "academic_year", value: academicYear });
  // NOTE: No status filter here; that should be handled in backend getPapers (or here if needed)

  // 3. Determine current page for pagination (from URL, default 1)
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // 4. Fetch paginated papers via React Query
  //    - All filter/search/page/date parameters included in queryKey (for cache separation)
  //    - getPapers fetches matching papers from backend, grouped and paginated
  const {
    isLoading,
    data: { data: papers, count } = {}, // Default to empty data object
    error,
  } = useQuery({
    queryKey: ["exam_papers", filters, subjectCode, page, today],
    queryFn: () =>
      getPapers({
        filters,
        search: subjectCode,
        page,
        date: today, // Always restrict papers for today's date
      }),
  });

  // 5. Prefetch next/previous pages so clicking pagination is instant
  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["exam_papers", filters, subjectCode, page + 1],
      queryFn: () =>
        getPapers({ filters, search: subjectCode, page: page + 1 }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["exam_papers", filters, subjectCode, page - 1],
      queryFn: () =>
        getPapers({ filters, search: subjectCode, page: page - 1 }),
    });

  // 6. Standardized return signature: loading, error, always array of papers, count for pagination
  return { isLoading, error, papers: papers ?? [], count: count ?? 0 };
}
