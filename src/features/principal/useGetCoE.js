/**
 * CoE Users Query Hook (Principal)
 *
 * Custom React Query hook for fetching paginated Controller of Examinations (CoE)
 * users for Principal's user management interface. Implements smart prefetching
 * for instant pagination navigation.
 *
 * @module useGetCoE
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
import { getCoE } from "../../services/apiPrincipal";

/**
 * Fetches paginated CoE users with smart prefetching for Principal dashboard.
 *
 * Retrieves active (non-deleted) users with Controller of Examinations role
 * for Principal's user management and oversight interfaces. Shows CoE users
 * across the institution with their department assignments.
 *
 * User filtering:
 * - Only fetches users with role = "CoE"
 * - Excludes soft-deleted users (deleted_at IS NULL)
 * - Principal uses this to view and manage CoE staff
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
 * - Shared cache across Principal dashboard components
 *
 * @returns {Object} Users query result object
 * @returns {boolean} returns.isLoading - True while initial data is being fetched
 * @returns {Error|null} returns.error - Error object if query fails
 * @returns {Array<Object>} returns.users - Array of CoE user objects with employee_id, username, department_name, role (empty array if loading/error)
 * @returns {number} returns.count - Total count of active CoE users (0 if loading/error)
 *
 * @example
 * // Principal's CoE management table with pagination
 * function PrincipalCoEManagement() {
 *   const { isLoading, error, users, count } = useGetCoE();
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
 *       <h2>Controller of Examinations Staff ({count} total)</h2>
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>Employee ID</th>
 *             <th>Name</th>
 *             <th>Department</th>
 *             <th>Role</th>
 *             <th>Actions</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {users.map(user => (
 *             <tr key={user.employee_id}>
 *               <td>{user.employee_id}</td>
 *               <td>{user.username}</td>
 *               <td>{user.department_name}</td>
 *               <td><Badge variant="primary">CoE</Badge></td>
 *               <td>
 *                 <button>View Details</button>
 *                 <button>Edit</button>
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
 * // CoE statistics dashboard
 * function PrincipalDashboard() {
 *   const { users, count, isLoading } = useGetCoE();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   // Group by department
 *   const byDepartment = users.reduce((acc, user) => {
 *     acc[user.department_name] = (acc[user.department_name] || 0) + 1;
 *     return acc;
 *   }, {});
 *
 *   return (
 *     <div>
 *       <h1>CoE Staff Overview</h1>
 *       <StatCard title="Total CoE Staff" value={count} />
 *       <h2>By Department</h2>
 *       <ul>
 *         {Object.entries(byDepartment).map(([dept, count]) => (
 *           <li key={dept}>{dept}: {count} CoE staff</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 *
 * @example
 * // CoE list with empty state
 * function CoEList() {
 *   const { isLoading, error, users, count } = useGetCoE();
 *
 *   if (isLoading) return <Loader />;
 *   if (error) return <ErrorAlert message={error.message} />;
 *   if (users.length === 0) {
 *     return (
 *       <EmptyState
 *         message="No CoE users found"
 *         action={<Link to="/principal/users/add">Add CoE User</Link>}
 *       />
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       <h2>CoE Users ({count})</h2>
 *       <UserGrid users={users} />
 *     </div>
 *   );
 * }
 */
export function useGetCoE() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    data: { data: users, count } = {},
    error,
  } = useQuery({
    queryKey: ["users", page],
    queryFn: () => getCoE({ page }),
  });

  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["users", page + 1],
      queryFn: () => getCoE({ page: page + 1 }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["users", page - 1],
      queryFn: () => getCoE({ page: page - 1 }),
    });

  return { isLoading, error, users: users ?? [], count: count ?? 0 };
}
