/**
 * User Business Data Query Hook
 *
 * Custom React Query hook for fetching business-specific user data from the users table.
 * Retrieves employee information, role, and department for role-based access control
 * and user identification throughout the application.
 *
 * @module useUserData
 */

import { useQuery } from "@tanstack/react-query";
import { fetchUserData } from "../../services/apiAuth";

/**
 * Fetches business-specific data for the currently authenticated user.
 *
 * Retrieves user information from the custom users table (not Supabase Auth)
 * including employee ID, username, department, and role. This data is essential for:
 * - Role-based access control (Faculty, CoE, BoE, Principal)
 * - Department-specific filtering and permissions
 * - User identification in forms and submissions
 * - Personalized dashboards and navigation
 *
 * Data structure returned:
 * - employee_id: Unique employee identifier
 * - username: Display name of the user
 * - department_name: User's department (e.g., "Computer Science")
 * - role: User's role (Faculty, CoE, BoE, Principal)
 *
 * Default values:
 * - All fields default to empty string ("") if data is not yet loaded
 * - Prevents undefined errors in components during initial load
 *
 * React Query configuration:
 * - Cached with "users" query key
 * - refetchOnWindowFocus disabled (data rarely changes during session)
 * - Single fetch per session for better performance
 *
 * @returns {Object} User business data with loading state
 * @returns {string} returns.employee_id - Employee identifier (empty string if loading)
 * @returns {string} returns.username - Username/display name (empty string if loading)
 * @returns {string} returns.department_name - Department name (empty string if loading)
 * @returns {string} returns.role - User role: Faculty, CoE, BoE, or Principal (empty string if loading)
 * @returns {boolean} returns.isLoading - True while initial data is being fetched
 *
 * @example
 * // Display user info in header
 * function UserHeader() {
 *   const { username, role, department_name, isLoading } = useUserData();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div className="user-header">
 *       <h2>{username}</h2>
 *       <p>{role} - {department_name}</p>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Role-based rendering
 * function Dashboard() {
 *   const { role, isLoading } = useUserData();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       {role === 'Faculty' && <FacultyDashboard />}
 *       {role === 'CoE' && <CoEDashboard />}
 *       {role === 'BoE' && <BoEDashboard />}
 *       {role === 'Principal' && <PrincipalDashboard />}
 *     </div>
 *   );
 * }
 *
 * @example
 * // Use employee_id in form submission
 * function CreatePaperForm() {
 *   const { employee_id, department_name } = useUserData();
 *
 *   const handleSubmit = (formData) => {
 *     createPaper({
 *       ...formData,
 *       uploaded_by: employee_id,
 *       department_name: department_name
 *     });
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 */
export function useUserData() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUserData,
    refetchOnWindowFocus: false,
  });

  return {
    employee_id: data?.employee_id || "",
    username: data?.username || "",
    department_name: data?.department_name || "",
    role: data?.role || "",
    isLoading,
  };
}
