import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getPapers } from "../../services/apiPrincipal";
import { PAGE_SIZE } from "../../utils/constants";
import { format } from "date-fns";

/**
 * usePPapers
 * ----------
 * Custom React Query hook to fetch (paginated, filtered, grouped) exam papers
 * for the PrincipalTable component.
 *
 * - Reads filters/search/pagination from the URL (using useSearchParams)
 * - Always filters for today's date ("Locked" papers available for principal's download)
 * - Supports prefetching of next/previous pages for fast, smooth UX
 *
 * Returns: { isLoading, error, papers, count }
 */
export function usePPapers() {
  const queryClient = useQueryClient(); // For cache/update/prefetching
  const [searchParams] = useSearchParams(); // Current URL search params

  // 1. Extract possible filters from the URL
  const dept = searchParams.get("department_name"); // "ISE", "CSE", or "all"
  const academicYear = searchParams.get("academic_year"); // e.g., "2023" or "all"
  const subjectCode = searchParams.get("subject_code") ?? ""; // For subject code search
  const today = format(new Date(), "yyyy-MM-dd"); // Today's date (DB format as YYYY-MM-DD)

  // 2. Build filters array; always limit to Locked status (only those available for download today)
  const filters = [{ field: "status", value: "Locked" }];
  if (dept && dept !== "all")
    filters.push({ field: "department_name", value: dept });
  if (academicYear && academicYear !== "all")
    filters.push({ field: "academic_year", value: academicYear });

  // 3. Get current page number (from URL), default to 1 if not present
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // 4. Fetch papers (React Query) with all params in the queryKey for cache separation and auto-update
  const {
    isLoading,
    data: { data: papers, count } = {},
    error,
  } = useQuery({
    queryKey: ["exam_papers", filters, subjectCode, page, today],
    queryFn: () =>
      getPapers({
        filters,
        search: subjectCode,
        page,
        date: today, // Always restricts DB query to papers for today
      }),
  });

  // 5. Prefetch next and previous pages (if they exist) for instant pagination UX
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

  // 6. Return standardized API: loading state, error, always-array of papers, and total count
  return { isLoading, error, papers: papers ?? [], count: count ?? 0 };
}
