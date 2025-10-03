/**
 * Faculty List Query Hook
 *
 * Custom React Query hook for fetching paginated faculty members within
 * a specific department for Board of Examiners (BoE) management interfaces.
 * Implements prefetching for adjacent pages to provide instant navigation.
 *
 * @module useGetFaculties
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFaculties } from "../../services/apiBoE";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
import { useUserData } from "../authentication/useUserData";

/**
 * Fetches paginated faculty list filtered by BoE's department with smart prefetching.
 *
 * Retrieves active faculty members in the current BoE user's department with
 * pagination support. Automatically prefetches adjacent pages (previous and next)
 * for instant navigation and improved user experience.
 *
 * Page number handling:
 * - Reads page number from URL search params (?page=2)
 * - Defaults to page 1 if no page parameter exists
 * - Updates automatically when URL changes
 *
 * Department filtering:
 * - Automatically filters by current user's department
 * - BoE users only see faculty from their own department
 * - Uses useUserData() to get department_name
 *
 * Prefetching strategy:
 * - Prefetches next page when not on last page (instant forward navigation)
 * - Prefetches previous page when not on first page (instant back navigation)
 * - Reduces perceived loading time
 * - Improves pagination UX
 *
 * React Query features:
 * - Cache key includes department and page for isolation
 * - Automatic background refetching
 * - Smart prefetching for adjacent pages
 * - Optimistic pagination rendering
 *
 * @returns {Object} Faculty query result object
 * @returns {boolean} returns.isLoading - True while initial data is being fetched
 * @returns {Error|null} returns.error - Error object if query fails
 * @returns {Array<Object>} returns.users - Array of faculty user objects (empty array if loading/error)
 * @returns {number} returns.count - Total count of faculty in department (0 if loading/error)
 *
 * @example
 * // Faculty list table with pagination
 * function BoEFacultyList() {
 *   const { isLoading, error, users, count } = useGetFaculties();
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
 *       <h2>Faculty in My Department ({count} total)</h2>
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>Employee ID</th>
 *             <th>Name</th>
 *             <th>Department</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {users.map(faculty => (
 *             <tr key={faculty.employee_id}>
 *               <td>{faculty.employee_id}</td>
 *               <td>{faculty.username}</td>
 *               <td>{faculty.department_name}</td>
 *             </tr>
 *           ))}
 *         </tbody>
 *       </table>
 *       <Pagination
 *         currentPage={currentPage}
 *         pageCount={pageCount}
 *         onPageChange={(page) => setSearchParams({ page })}
 *       />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Faculty selection dropdown with all pages
 * function FacultySelector() {
 *   const { users, isLoading } = useGetFaculties();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <select name="faculty">
 *       <option value="">Select Faculty</option>
 *       {users.map(faculty => (
 *         <option key={faculty.employee_id} value={faculty.employee_id}>
 *           {faculty.username} ({faculty.employee_id})
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 */
export function useGetFaculties() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { department_name } = useUserData();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    data: { data: users, count } = {},
    error,
  } = useQuery({
    queryKey: ["users", department_name, page],
    queryFn: () => getFaculties({ page, department_name }),
  });

  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["users", department_name, page + 1],
      queryFn: () => getFaculties({ page: page + 1, department_name }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["users", department_name, page - 1],
      queryFn: () => getFaculties({ page: page - 1, department_name }),
    });

  return { isLoading, error, users: users ?? [], count: count ?? 0 };
}
