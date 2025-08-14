import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPapers } from "../../services/apiBoE";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
import { useUserData } from "./../authentication/useUserData";

/**
 * useBPapers
 * ----------
 * Custom hook for fetching Board of Examiners (BoE) papers with filtering, searching, and pagination.
 * Features:
 *   - Filters by academic year and status, from URL/search params
 *   - Optionally searches by subject code
 *   - Supports pagination with page param from URL
 *   - Prefetches next and previous pages for fast navigation
 *   - Uses React Query for caching/invalidating API calls
 *
 * Returns { isLoading, error, papers, count }
 */
export function useBPapers() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { department_name } = useUserData();
  // --- 1. Filters ---
  // Get filter/search params from the URL
  const academicYear = searchParams.get("academic_year");
  const subjectCode = searchParams.get("subject_code") ?? "";
  const status = searchParams.get("status") ?? "";

  // Build filters array for the API (omits blank/"all" values)
  const filters = [];
  if (academicYear && academicYear !== "all")
    filters.push({ field: "academic_year", value: academicYear });
  if (status && status !== "all")
    filters.push({ field: "status", value: status });

  // --- 2. Pagination ---
  // Read current page number from URL param (default to 1)
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // --- 3. Data Fetching ---
  // React Query: fetch the filtered, paginated papers
  const {
    isLoading,
    data: { data: papers, count } = {}, // Avoids undefined destructure
    error,
  } = useQuery({
    queryKey: ["exam_papers", filters, subjectCode, page], // Unique per filter & page
    queryFn: () =>
      getPapers({ filters, search: subjectCode, page, department_name }), // API call
  });

  // --- 4. Prefetching ---
  // Compute total number of result pages, then prefetch next/previous for fast UI
  const pageCount = Math.ceil(count / PAGE_SIZE);

  // Prefetch next page if it exists
  if (page < pageCount)
    queryClient.prefetchQuery({
      // prefetch key must match main query
      queryKey: ["exam_papers", filters, subjectCode, page + 1],
      queryFn: () => getPapers({ filters, subjectCode, page: page + 1 }),
    });

  // Prefetch previous page if not already on page 1
  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["exam_papers", filters, subjectCode, page - 1],
      queryFn: () => getPapers({ filters, subjectCode, page: page - 1 }),
    });

  // --- 5. Return standardized result
  // Always returns an array (never undefined) and a page count for UI
  return { isLoading, error, papers: papers ?? [], count: count ?? 0 };
}
