/**
 * CoE Papers Query Hook
 *
 * Custom React Query hook for fetching Controller of Examinations papers
 * with institution-wide filtering, searching, and pagination. Implements
 * URL-based state management and smart prefetching for optimal performance.
 *
 * @module useCPapers
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPapers } from "../../services/apiCoE";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";

/**
 * Fetches filtered, searchable, and paginated CoE papers with smart prefetching.
 *
 * Retrieves examination papers from across all departments for Controller of
 * Examinations oversight. Supports multi-department filtering, academic year,
 * status filtering, subject code search, and pagination with automatic prefetching
 * of adjacent pages for instant navigation.
 *
 * URL-based state management:
 * - ?department_name=ISE - Filter by specific department
 * - ?academic_year=2024 - Filter by academic year
 * - ?status=Locked - Filter by paper status
 * - ?subject_code=CS501 - Search by subject code
 * - ?page=2 - Current page number
 * - All filters are optional and default to showing all
 *
 * Filter behavior:
 * - department_name: Filters papers by department (omits if "all" or empty)
 * - academic_year: Filters papers by year (omits if "all" or empty)
 * - status: Filters by paper status (omits if "all" or empty)
 * - subject_code: Case-insensitive partial match search
 * - CoE sees papers from ALL departments (unlike BoE which is department-specific)
 *
 * Prefetching strategy:
 * - Prefetches next page when available (instant forward pagination)
 * - Prefetches previous page when not on first page (instant back pagination)
 * - Maintains same filters for prefetched pages
 * - Significantly improves perceived performance
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
 * // CoE papers table with institution-wide filtering
 * function CoEPapersTable() {
 *   const { isLoading, error, papers, count } = useCPapers();
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
 *         onDepartmentChange={(dept) => setSearchParams({ department_name: dept })}
 *         onYearChange={(year) => setSearchParams({ academic_year: year })}
 *         onStatusChange={(status) => setSearchParams({ status })}
 *         onSearch={(code) => setSearchParams({ subject_code: code })}
 *       />
 *       <h2>All Papers ({count} total)</h2>
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>Subject Code</th>
 *             <th>Subject Name</th>
 *             <th>Department</th>
 *             <th>Status</th>
 *             <th>Actions</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {papers.map(paper => (
 *             <tr key={paper.id}>
 *               <td>{paper.subject_code}</td>
 *               <td>{paper.subject_name}</td>
 *               <td>{paper.department_name}</td>
 *               <td>{paper.status}</td>
 *               <td>
 *                 <Link to={`/coe/papers/${paper.id}`}>View</Link>
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
 * // Dashboard with multiple filter combinations
 * function CoEDashboard() {
 *   const { papers, count, isLoading } = useCPapers();
 *   const [searchParams, setSearchParams] = useSearchParams();
 *
 *   const applyFilters = (filters) => {
 *     setSearchParams({
 *       department_name: filters.department,
 *       academic_year: filters.year,
 *       status: filters.status,
 *       subject_code: filters.search,
 *       page: 1 // Reset to first page when filters change
 *     });
 *   };
 *
 *   const clearFilters = () => {
 *     setSearchParams({});
 *   };
 *
 *   return (
 *     <div>
 *       <h1>Institution-wide Paper Management</h1>
 *       <p>{count} papers across all departments</p>
 *       <AdvancedFilterForm
 *         onApply={applyFilters}
 *         onClear={clearFilters}
 *       />
 *       {isLoading ? <Spinner /> : <PapersGrid papers={papers} />}
 *     </div>
 *   );
 * }
 *
 * @example
 * // Department-specific view with status filter
 * function CoEDepartmentView() {
 *   const { papers, count, isLoading } = useCPapers();
 *   const [searchParams, setSearchParams] = useSearchParams();
 *   const department = searchParams.get('department_name');
 *
 *   return (
 *     <div>
 *       <h2>{department} Department Papers</h2>
 *       <StatusFilter
 *         onChange={(status) =>
 *           setSearchParams({ ...Object.fromEntries(searchParams), status })
 *         }
 *       />
 *       {isLoading ? <Loader /> : <PapersList papers={papers} count={count} />}
 *     </div>
 *   );
 * }
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
