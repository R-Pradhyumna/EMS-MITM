/**
 * Departments Query Hook
 *
 * Custom React Query hook for fetching all departments in the institution.
 * Uses TanStack Query (React Query) for caching, background updates, and error handling.
 *
 * @module useDepartments
 */

import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../services/apiCoE";

/**
 * Fetches all departments from the database.
 *
 * Retrieves complete department list for dropdown menus, filtering options,
 * and department-based workflows across all roles (CoE, BoE, Faculty, Principal).
 * Data is cached indefinitely until manually invalidated or app refresh.
 *
 * React Query features:
 * - Automatic caching with 'departments' query key
 * - Background refetching on window focus
 * - Automatic retry on failure (3 attempts by default)
 * - Shared cache across components (single request for multiple uses)
 *
 * @returns {Object} Query result object
 * @returns {boolean} returns.isLoading - True while initial data is being fetched
 * @returns {Array<Object>} returns.data - Array of department objects with id and name properties
 * @returns {Error|null} returns.error - Error object if query fails, null otherwise
 *
 * @example
 * function DepartmentFilter() {
 *   const { isLoading, data: departments, error } = useDepartments();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage>{error.message}</ErrorMessage>;
 *
 *   return (
 *     <select name="department">
 *       <option value="">All Departments</option>
 *       {departments.map(dept => (
 *         <option key={dept.id} value={dept.name}>
 *           {dept.name}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 */
export function useDepartments() {
  const { isLoading, data, error } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  return { isLoading, data, error };
}
