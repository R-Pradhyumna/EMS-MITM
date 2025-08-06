import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPapers } from "../../services/apiCoE";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";

/**
 * useCPapers
 * ----------
 * Custom React hook for fetching CoE (Committee of Examinations) paper records with support for:
 *   - Filtering by department, academic year, status
 *   - Searching by subject code
 *   - Pagination
 *   - React Query caching and background prefetching of next/previous pages
 *
 * Returns: { isLoading, error, papers, count }
 */
export function useCPapers() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // --- 1. Building Filters ---
  // Read filter values from URL search params (e.g., ?department_name=ISE)
  const dept = searchParams.get("department_name");
  const academicYear = searchParams.get("academic_year");
  const subjectCode = searchParams.get("subject_code") ?? "";
  const status = searchParams.get("status") ?? "";

  // Build filters array (omit "all"/blank values)
  const filters = [];
  if (dept && dept !== "all")
    filters.push({ field: "department_name", value: dept });
  if (academicYear && academicYear !== "all")
    filters.push({ field: "academic_year", value: academicYear });
  if (status && status !== "all")
    filters.push({ field: "status", value: status });

  // --- 2. Pagination (page number from search param, defaults to 1) ---
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // --- 3. Main Data Fetching (React Query) ---
  // - queryKey uniquely identifies cache for {filters, search, page}
  // - queryFn calls server with those params
  // - Destructure data: papers = array, count = total for pagination
  const {
    isLoading,
    data: { data: papers, count } = {},
    error,
  } = useQuery({
    queryKey: ["exam_papers", filters, subjectCode, page],
    queryFn: () => getPapers({ filters, search: subjectCode, page }),
  });

  // --- 4. Prefetch Next/Previous Pages for Smooth Pagination ---
  const pageCount = Math.ceil(count / PAGE_SIZE);

  // Prefetch next page (if one exists)
  if (page < pageCount)
    queryClient.prefetchQuery({
      // Ensure prefetch key matches main query key structure
      queryKey: ["exam_papers", filters, subjectCode, page + 1],
      queryFn: () => getPapers({ filters, subjectCode, page: page + 1 }),
    });

  // Prefetch previous page (if not on first page)
  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["exam_papers", filters, subjectCode, page - 1],
      queryFn: () => getPapers({ filters, subjectCode, page: page - 1 }),
    });

  // --- 5. Final Return (always arrays/count, never undefined) ---
  return { isLoading, error, papers: papers ?? [], count: count ?? 0 };
}
