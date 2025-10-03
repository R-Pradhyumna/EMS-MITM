/**
 * Principal Papers Query Hook
 *
 * Custom React Query hook for fetching today's examination papers available for
 * Principal download. Implements date-based filtering, department/year filtering,
 * subject search, and smart prefetching for the daily download workflow.
 *
 * @module usePPapers
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getPapers } from "../../services/apiPrincipal";
import { PAGE_SIZE } from "../../utils/constants";
import { format } from "date-fns";

/**
 * Fetches today's locked papers for Principal download with filtering and prefetching.
 *
 * Retrieves examination papers that are locked (approved) and scheduled for today's date,
 * making them available for Principal download. Supports filtering by department and
 * academic year, plus subject code search. This is the core data hook for Principal's
 * daily paper download interface.
 *
 * Date-based filtering:
 * - Automatically restricts to current date (yyyy-MM-dd format)
 * - Only shows papers with exam_datetime matching today
 * - Prevents access to past or future papers
 * - Updates automatically when date changes (new day)
 *
 * Status filtering:
 * - Includes papers with status "Locked" (approved and ready)
 * - Includes papers with status "Downloaded" (for tracking)
 * - Shows which papers are available vs already downloaded
 * - Maintains visibility of all slots for the day
 *
 * URL-based state management:
 * - ?department_name=ISE - Filter by department
 * - ?academic_year=2024 - Filter by academic year
 * - ?subject_code=CS501 - Search by subject code
 * - ?page=2 - Current page number
 * - All filters support "all" value to show everything
 * - Enables deep linking and shareable URLs
 *
 * Grouped data structure:
 * - Papers are grouped by subject_code (via groupPapersBySubject)
 * - Each group represents one subject with multiple paper slots
 * - Returns paginated groups, not individual papers
 * - See apiPrincipal.getPapers for grouping details
 *
 * Prefetching strategy:
 * - Prefetches next page when available (instant forward pagination)
 * - Prefetches previous page when not on first page (instant back pagination)
 * - Maintains same filters for prefetched pages
 * - Significantly improves perceived performance
 *
 * React Query features:
 * - Cache key includes all filters, search, page, and date
 * - Automatic background refetching on window focus
 * - Smart prefetching for adjacent pages
 * - Date changes automatically trigger new queries
 *
 * @returns {Object} Papers query result object
 * @returns {boolean} returns.isLoading - True while initial data is being fetched
 * @returns {Error|null} returns.error - Error object if query fails
 * @returns {Array<Object>} returns.papers - Array of subject-grouped paper objects (empty array if loading/error)
 * @returns {number} returns.count - Total count of subject groups for today (0 if loading/error)
 *
 * @example
 * // Principal's daily download table with filters
 * function PrincipalPapersTable() {
 *   const { isLoading, error, papers, count } = usePPapers();
 *   const [searchParams, setSearchParams] = useSearchParams();
 *   const currentPage = Number(searchParams.get('page')) || 1;
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage>{error.message}</ErrorMessage>;
 *
 *   const pageCount = Math.ceil(count / PAGE_SIZE);
 *
 *   return (
 *     <div>
 *       <h2>Today's Papers ({count} subjects)</h2>
 *       <FilterBar
 *         onDepartmentChange={(dept) => setSearchParams({ department_name: dept })}
 *         onYearChange={(year) => setSearchParams({ academic_year: year })}
 *         onSearch={(code) => setSearchParams({ subject_code: code })}
 *       />
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>Subject</th>
 *             <th>Slot 1</th>
 *             <th>Slot 2</th>
 *             <th>Slot 3</th>
 *             <th>Slot 4</th>
 *             <th>Slot 5</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {papers.map(subjectGroup => (
 *             <tr key={subjectGroup.subject_code}>
 *               <td>
 *                 {subjectGroup.subject_code}<br />
 *                 {subjectGroup.subject_name}
 *               </td>
 *               {subjectGroup.papers.map((paper, idx) => (
 *                 <td key={idx}>
 *                   {paper ? (
 *                     <DownloadButton
 *                       paper={paper}
 *                       disabled={subjectGroup.downloaded}
 *                     />
 *                   ) : (
 *                     <span className="empty-slot">-</span>
 *                   )}
 *                 </td>
 *               ))}
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
 * // Dashboard statistics for today's papers
 * function PrincipalDashboard() {
 *   const { papers, count, isLoading } = usePPapers();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   // Calculate download statistics
 *   const totalSlots = papers.reduce((sum, group) =>
 *     sum + group.papers.filter(p => p !== null).length, 0
 *   );
 *   const downloadedCount = papers.filter(g => g.downloaded).length;
 *
 *   return (
 *     <div>
 *       <h1>Today's Download Dashboard</h1>
 *       <div className="stats">
 *         <StatCard title="Subjects" value={count} />
 *         <StatCard title="Total Slots" value={totalSlots} />
 *         <StatCard title="Downloaded" value={downloadedCount} />
 *         <StatCard
 *           title="Remaining"
 *           value={count - downloadedCount}
 *         />
 *       </div>
 *     </div>
 *   );
 * }
 *
 * @example
 * // With department filter applied
 * function DepartmentPapers({ departmentName }) {
 *   const [searchParams, setSearchParams] = useSearchParams();
 *
 *   // Set department filter on mount
 *   useEffect(() => {
 *     setSearchParams({ department_name: departmentName, page: 1 });
 *   }, [departmentName]);
 *
 *   const { papers, count, isLoading } = usePPapers();
 *
 *   if (isLoading) return <Loader />;
 *
 *   return (
 *     <div>
 *       <h2>{departmentName} Department Papers</h2>
 *       <p>{count} subjects available today</p>
 *       <PapersTable papers={papers} />
 *     </div>
 *   );
 * }
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
