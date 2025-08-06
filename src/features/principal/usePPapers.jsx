import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getPapers } from "../../services/apiPrincipal";
import { PAGE_SIZE } from "../../utils/constants";
import { format } from "date-fns";

// Custom React Query hook to get exam papers (grouped, paginated) for the PrincipalTable UI
export function usePPapers() {
  const queryClient = useQueryClient(); // For data cache and prefetching (used below)
  const [searchParams] = useSearchParams(); // Access search params from the URL for filters/pagination

  // 1. Read filters from the URL/search params
  const dept = searchParams.get("department_name"); // Filter: department name (may be "all", meaning any)
  const academicYear = searchParams.get("academic_year"); // Filter: academic year (same logic)
  const subjectCode = searchParams.get("subject_code") ?? ""; // Filter: subject code for search (or "")
  const today = format(new Date(), "yyyy-MM-dd"); // Today's date in DB string format

  // 2. Build up the array of column/value filters for the DB query
  const filters = [{ field: "status", value: "Locked" }]; // Always show only "Locked" papers

  if (dept && dept !== "all")
    filters.push({ field: "department_name", value: dept });
  if (academicYear && academicYear !== "all")
    filters.push({ field: "academic_year", value: academicYear });

  // 3. Get the current "page" for pagination (default to 1)
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // 4. Query for papers (using React Query's useQuery)
  //    - The queryKey ensures correct caching and automatic update for these params
  //    - The query function calls getPapers with all built-up filters
  const {
    isLoading, // Boolean: loading state for spinner
    data: { data: papers, count } = {}, // The returned paginated/grouped papers and total count
    error, // Error object, if any
  } = useQuery({
    queryKey: ["exam_papers", filters, subjectCode, page, today],
    queryFn: () =>
      getPapers({
        filters,
        search: subjectCode,
        page,
        date: today, // Always limits to papers for "today" (or you can make this dynamic)
      }),
  });

  // 5. Prefetch next and previous pages for smoother user experience on pagination
  //    (populates the React Query cache for quick next page transitions)
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

  // 6. Always return a standard output API:
  //    - isLoading: for spinner while fetching
  //    - error: for error UI
  //    - papers: the grouped/paginated subject+paper rows (always [] if loading/fail)
  //    - count: total rows across all pages (used for Pagination)
  return { isLoading, error, papers: papers ?? [], count: count ?? 0 };
}
