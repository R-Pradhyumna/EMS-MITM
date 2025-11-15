/**
 * Dashboard Scheme Papers Query Hook
 *
 * Custom React Query hook for fetching paginated Scheme of Valuation (SoV)
 * papers that have been downloaded. Used in dashboard interfaces to track
 * and display downloaded schemes. Implements smart prefetching for instant pagination.
 *
 * @module useDPapers
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getSchema } from "../../services/apiDashboard";
import { PAGE_SIZE } from "../../utils/constants";

/**
 * Fetches paginated downloaded Scheme of Valuation papers with smart prefetching.
 *
 * Retrieves examination papers marked as downloaded (is_downloaded = true)
 * for dashboard display and tracking purposes. Shows which schemes have been
 * accessed and by whom. Automatically prefetches adjacent pages for instant navigation.
 *
 * Data filtering:
 * - Only includes papers with is_downloaded = true
 * - Shows subject_code, academic_year, subject_name, semester, uploaded_by, scheme_file_url
 * - Used for tracking scheme downloads across the institution
 *
 * Page number handling:
 * - Reads page number from URL search params (?page=2)
 * - Defaults to page 1 if no page parameter exists
 * - Updates automatically when URL changes
 *
 * Prefetching strategy:
 * - Prefetches next page when not on last page (instant forward navigation)
 * - Prefetches previous page when not on first page (instant back navigation)
 * - Reduces perceived loading time
 * - Improves pagination UX
 *
 * React Query features:
 * - Cache key includes page number for isolation
 * - Automatic background refetching on window focus
 * - Smart prefetching for adjacent pages
 * - Shared cache across dashboard components
 *
 * @returns {Object} Papers query result object
 * @returns {boolean} returns.isLoading - True while initial data is being fetched
 * @returns {Error|null} returns.error - Error object if query fails
 * @returns {Array<Object>|undefined} returns.papers - Array of downloaded paper objects (undefined if loading)
 * @returns {number} returns.count - Total count of downloaded papers (0 if loading/error)
 *
 * @example
 * // Dashboard table showing downloaded schemes
 * function DashboardSchemesTable() {
 *   const { isLoading, error, papers, count } = useDPapers();
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
 *       <h2>Downloaded Schemes ({count} total)</h2>
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>Subject Code</th>
 *             <th>Subject Name</th>
 *             <th>Semester</th>
 *             <th>Academic Year</th>
 *             <th>Uploaded By</th>
 *             <th>Scheme</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {papers?.map((paper, index) => (
 *             <tr key={`${paper.subject_code}-${index}`}>
 *               <td>{paper.subject_code}</td>
 *               <td>{paper.subject_name}</td>
 *               <td>{paper.semester}</td>
 *               <td>{paper.academic_year}</td>
 *               <td>{paper.uploaded_by}</td>
 *               <td>
 *                 <a href={paper.scheme_file_url} target="_blank" rel="noopener noreferrer">
 *                   View Scheme
 *                 </a>
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
 * // Dashboard statistics card
 * function DashboardStats() {
 *   const { papers, count, isLoading } = useDPapers();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div className="stats-card">
 *       <h3>Scheme Downloads</h3>
 *       <p className="count">{count}</p>
 *       <p className="subtitle">Total downloaded schemes</p>
 *       {papers && papers.length > 0 && (
 *         <p className="recent">
 *           Most recent: {papers[0].subject_name}
 *         </p>
 *       )}
 *     </div>
 *   );
 * }
 *
 * @example
 * // Downloaded schemes list with conditional rendering
 * function DownloadedSchemesList() {
 *   const { isLoading, error, papers, count } = useDPapers();
 *
 *   if (isLoading) return <Loader />;
 *   if (error) return <ErrorAlert message={error.message} />;
 *   if (!papers || papers.length === 0) {
 *     return <EmptyState message="No schemes have been downloaded yet" />;
 *   }
 *
 *   return (
 *     <div>
 *       <h2>{count} Schemes Downloaded</h2>
 *       <ul className="schemes-list">
 *         {papers.map((paper, idx) => (
 *           <li key={idx}>
 *             <span>{paper.subject_code} - {paper.subject_name}</span>
 *             <a href={paper.scheme_file_url}>Download</a>
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
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
