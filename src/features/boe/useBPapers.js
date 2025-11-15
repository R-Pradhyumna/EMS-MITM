/**
 * BoE Papers Query Hook
 *
 * Custom React Query hook for fetching Board of Examiners examination papers
 * with advanced filtering, searching, and pagination. Implements URL-based
 * state management and smart prefetching for optimal user experience.
 *
 * @module useBPapers
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getPapers } from "../../services/apiBoE";
import { PAGE_SIZE } from "../../utils/constants";
import { useUserData } from "./../authentication/useUserData";

/**
 * Fetches filtered, searchable, and paginated BoE papers with smart prefetching.
 *
 * Retrieves examination papers for Board of Examiners review filtered by department,
 * academic year, and status. Supports subject code search and pagination with
 * automatic prefetching of adjacent pages for instant navigation.
 *
 * URL-based state management:
 * - ?academic_year=2024 - Filter by academic year
 * - ?status=Locked - Filter by paper status
 * - ?subject_code=CS501 - Search by subject code
 * - ?page=2 - Current page number
 * - All filters are optional and default to showing all
 *
 * Filter behavior:
 * - academic_year: Filters papers by year (omits if "all" or empty)
 * - status: Filters by paper status (omits if "all" or empty)
 * - subject_code: Exact match search on subject code
 * - department_name: Automatically filtered by current BoE user's department
 *
 * Prefetching strategy:
 * - Prefetches next page when available (instant forward pagination)
 * - Prefetches previous page when not on first page (instant back pagination)
 * - Maintains same filters for prefetched pages
 * - Improves perceived performance significantly
 *
 * React Query features:
 * - Cache key includes all filters and page for proper isolation
 * - Automatic background refetching on window focus
 * - Smart prefetching for adjacent pages
 * - Filter changes trigger new queries automatically
 *
 * @returns {Object} Papers query result object
 * @returns {boolean} returns.isLoading - True while initial data is being fetched
 * @returns {Error|null} returns.error - Error object if query fails
 * @returns {Array<Object>} returns.papers - Array of exam paper objects (empty array if loading/error)
 * @returns {number} returns.count - Total count of papers matching filters (0 if loading/error)
 *
 * @example
 * // BoE papers table with filters and pagination
 * function BoEPapersTable() {
 *   const { isLoading, error, papers, count } = useBPapers();
 *   const [searchParams, setSearchParams] = useSearchParams();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage>{error.message}</ErrorMessage>;
 *
 *   const pageCount = Math.ceil(count / PAGE_SIZE);
 *   const currentPage = Number(searchParams.get('page')) || 1;
 *
 *   return (
 *     <div>
 *       <FilterBar
 *         onYearChange={(year) => setSearchParams({ academic_year: year })}
 *         onStatusChange={(status) => setSearchParams({ status })}
 *         onSearch={(code) => setSearchParams({ subject_code: code })}
 *       />
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>Subject Code</th>
 *             <th>Subject Name</th>
 *             <th>Status</th>
 *             <th>Actions</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {papers.map(paper => (
 *             <tr key={paper.id}>
 *               <td>{paper.subject_code}</td>
 *               <td>{paper.subject_name}</td>
 *               <td>{paper.status}</td>
 *               <td>
 *                 <Link to={`/boe/papers/${paper.id}`}>Review</Link>
 *               </td>
 *             </tr>
 *           ))}
 *         </tbody>
 *       </table>
 *       <Pagination
 *         currentPage={currentPage}
 *         pageCount={pageCount}
 *         count={count}
 *         onPageChange={(page) => setSearchParams({ page })}
 *       />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Combined filters with multiple criteria
 * function BoEDashboard() {
 *   const { papers, count, isLoading } = useBPapers();
 *   const [searchParams, setSearchParams] = useSearchParams();
 *
 *   const applyFilters = (filters) => {
 *     setSearchParams({
 *       academic_year: filters.year,
 *       status: filters.status,
 *       subject_code: filters.search,
 *       page: 1 // Reset to first page when filters change
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <h1>Papers for Review ({count} total)</h1>
 *       <AdvancedFilterForm onApply={applyFilters} />
 *       {isLoading ? <Spinner /> : <PapersGrid papers={papers} />}
 *     </div>
 *   );
 * }
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
      queryFn: () =>
        getPapers({ filters, subjectCode, page: page + 1, department_name }),
    });

  // Prefetch previous page if not already on page 1
  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["exam_papers", filters, subjectCode, page - 1],
      queryFn: () =>
        getPapers({ filters, subjectCode, page: page - 1, department_name }),
    });

  // --- 5. Return standardized result
  // Always returns an array (never undefined) and a page count for UI
  return { isLoading, error, papers: papers ?? [], count: count ?? 0 };
}
