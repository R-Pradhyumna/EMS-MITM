/**
 * Faculty Papers Query Hook
 *
 * Custom React Query hook for fetching paginated papers submitted by a specific
 * faculty member. Implements employee-specific filtering and smart prefetching
 * for instant pagination navigation.
 *
 * @module useFPapers
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPapers } from "../../services/apiFaculty";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
import { useUserData } from "./../authentication/useUserData";

/**
 * Fetches paginated papers submitted by the current faculty member with smart prefetching.
 *
 * Retrieves examination papers uploaded by the logged-in faculty member only.
 * Papers are ordered by creation date (newest first) and include essential fields
 * for faculty dashboard display. Automatically prefetches adjacent pages for
 * instant navigation.
 *
 * Filtering behavior:
 * - Only shows papers where uploaded_by = current user's employee_id
 * - Faculty members only see their own submissions
 * - Uses useUserData() to get current employee_id automatically
 *
 * Page number handling:
 * - Reads page number from URL search params (?page=2)
 * - Defaults to page 1 if no page parameter exists
 * - Updates automatically when URL changes
 *
 * Prefetching strategy:
 * - Prefetches next page when not on last page (instant forward navigation)
 * - Prefetches previous page when not on first page (instant back navigation)
 * - Reduces perceived loading time significantly
 * - Improves pagination UX
 *
 * React Query features:
 * - Cache key includes page number for isolation
 * - Automatic background refetching on window focus
 * - Smart prefetching for adjacent pages
 * - Shared cache across faculty dashboard components
 *
 * @returns {Object} Papers query result object
 * @returns {boolean} returns.isLoading - True while initial data is being fetched
 * @returns {Error|null} returns.error - Error object if query fails
 * @returns {Array<Object>|undefined} returns.papers - Array of paper objects with id, subject_code, academic_year, subject_name, semester, status (undefined if loading)
 * @returns {number} returns.count - Total count of papers submitted by this faculty member (0 if loading/error)
 *
 * @example
 * // Faculty dashboard papers table with pagination
 * function FacultyPapersTable() {
 *   const { isLoading, error, papers, count } = useFPapers();
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
 *       <h2>My Submitted Papers ({count} total)</h2>
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>Subject Code</th>
 *             <th>Subject Name</th>
 *             <th>Semester</th>
 *             <th>Academic Year</th>
 *             <th>Status</th>
 *             <th>Actions</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {papers?.map(paper => (
 *             <tr key={paper.id}>
 *               <td>{paper.subject_code}</td>
 *               <td>{paper.subject_name}</td>
 *               <td>{paper.semester}</td>
 *               <td>{paper.academic_year}</td>
 *               <td><StatusBadge status={paper.status} /></td>
 *               <td>
 *                 <Link to={`/faculty/papers/${paper.id}`}>View</Link>
 *                 {paper.status === 'Submitted' && (
 *                   <Link to={`/faculty/papers/${paper.id}/edit`}>Edit</Link>
 *                 )}
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
 * // Faculty dashboard statistics
 * function FacultyDashboard() {
 *   const { papers, count, isLoading } = useFPapers();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   const submittedCount = papers?.filter(p => p.status === 'Submitted').length || 0;
 *   const approvedCount = papers?.filter(p => p.status === 'Locked').length || 0;
 *
 *   return (
 *     <div>
 *       <h1>My Papers</h1>
 *       <div className="stats">
 *         <StatCard title="Total Papers" value={count} />
 *         <StatCard title="Under Review" value={submittedCount} />
 *         <StatCard title="Approved" value={approvedCount} />
 *       </div>
 *       <RecentPapersTable papers={papers?.slice(0, 5)} />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Papers list with empty state
 * function MyPapersList() {
 *   const { isLoading, error, papers, count } = useFPapers();
 *
 *   if (isLoading) return <Loader />;
 *   if (error) return <ErrorAlert message={error.message} />;
 *   if (!papers || papers.length === 0) {
 *     return (
 *       <EmptyState
 *         message="You haven't submitted any papers yet"
 *         action={<Link to="/faculty/papers/create">Submit Your First Paper</Link>}
 *       />
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       <h2>My Papers ({count})</h2>
 *       <PapersList papers={papers} />
 *     </div>
 *   );
 * }
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
