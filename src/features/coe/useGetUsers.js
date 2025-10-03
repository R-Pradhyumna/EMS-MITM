/**
 * Users Query Hook (CoE)
 *
 * Custom React Query hook for fetching paginated BoE and Principal users
 * for Controller of Examinations (CoE) user management. Implements smart
 * prefetching for instant pagination navigation.
 *
 * @module useGetUsers
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getUsers } from "../../services/apiCoE";
import { PAGE_SIZE } from "../../utils/constants";

/**
 * Fetches paginated BoE and Principal users with smart prefetching.
 *
 * Retrieves active (non-deleted) users with BoE or Principal roles for
 * Controller of Examinations user management and oversight interfaces.
 * Automatically prefetches adjacent pages for instant navigation.
 *
 * User filtering:
 * - Only fetches users with role = "BoE" OR role = "Principal"
 * - Excludes soft-deleted users (deleted_at IS NULL)
 * - CoE uses this to manage senior examination staff
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
 * - Shared cache across components using same hook
 *
 * @returns {Object} Users query result object
 * @returns {boolean} returns.isLoading - True while initial data is being fetched
 * @returns {Error|null} returns.error - Error object if query fails
 * @returns {Array<Object>} returns.users - Array of user objects with employee_id, username, department_name, role (empty array if loading/error)
 * @returns {number} returns.count - Total count of BoE/Principal users (0 if loading/error)
 *
 * @example
 * // User management table with pagination
 * function CoEUserManagement() {
 *   const { isLoading, error, users, count } = useGetUsers();
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
 *       <h2>BoE and Principal Users ({count} total)</h2>
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
 *               <td><Badge>{user.role}</Badge></td>
 *               <td>
 *                 <button>Edit</button>
 *                 <button>Delete</button>
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
 * // User statistics dashboard
 * function CoEDashboard() {
 *   const { users, count, isLoading } = useGetUsers();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   const boeCount = users.filter(u => u.role === 'BoE').length;
 *   const principalCount = users.filter(u => u.role === 'Principal').length;
 *
 *   return (
 *     <div>
 *       <h1>Senior Staff Management</h1>
 *       <div className="stats">
 *         <StatCard title="Total Users" value={count} />
 *         <StatCard title="BoE Members" value={boeCount} />
 *         <StatCard title="Principals" value={principalCount} />
 *       </div>
 *       <RecentUsersTable users={users.slice(0, 5)} />
 *     </div>
 *   );
 * }
 *
 * @example
 * // User role filter with selection
 * function UserRoleSelector() {
 *   const { users, isLoading } = useGetUsers();
 *   const [selectedRole, setSelectedRole] = useState('all');
 *
 *   if (isLoading) return <Spinner />;
 *
 *   const filteredUsers = selectedRole === 'all'
 *     ? users
 *     : users.filter(u => u.role === selectedRole);
 *
 *   return (
 *     <div>
 *       <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
 *         <option value="all">All Roles</option>
 *         <option value="BoE">Board of Examiners</option>
 *         <option value="Principal">Principal</option>
 *       </select>
 *       <UserList users={filteredUsers} />
 *     </div>
 *   );
 * }
 */
export function useGetUsers() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    data: { data: users, count } = {},
    error,
  } = useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsers({ page }),
  });

  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["users", page + 1],
      queryFn: () => getUsers({ page: page + 1 }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["users", page - 1],
      queryFn: () => getUsers({ page: page - 1 }),
    });

  return { isLoading, error, users: users ?? [], count: count ?? 0 };
}
