/**
 * Logout Mutation Hook
 *
 * Custom React Query mutation hook for handling user logout.
 * Manages logout state, clears all cached data, and navigates
 * to the login page.
 *
 * @module useLogout
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../../services/apiAuth";

/**
 * Handles user logout with cache cleanup and navigation.
 *
 * Provides a mutation function for logging out users. On successful logout:
 * - Terminates user session with Supabase Auth
 * - Removes all cached queries from React Query cache (user data, papers, etc.)
 * - Navigates to login page with history replacement
 * - Prevents navigation back to protected routes
 *
 * Cache cleanup ensures:
 * - No stale user data persists after logout
 * - Fresh data fetch when next user logs in
 * - Privacy protection by removing sensitive cached information
 *
 * React Query features:
 * - Complete cache invalidation on logout
 * - Automatic loading state management
 * - Silent error handling (no error notifications needed for logout)
 *
 * @returns {Object} Logout mutation object
 * @returns {Function} returns.logout - Mutation function to trigger logout
 * @returns {boolean} returns.isLoading - True while logout request is in progress
 *
 * @example
 * function Header() {
 *   const { logout, isLoading } = useLogout();
 *
 *   return (
 *     <header>
 *       <h1>ExamSuite</h1>
 *       <button onClick={() => logout()} disabled={isLoading}>
 *         {isLoading ? 'Logging out...' : 'Logout'}
 *       </button>
 *     </header>
 *   );
 * }
 *
 * @example
 * // With confirmation dialog
 * function LogoutButton() {
 *   const { logout, isLoading } = useLogout();
 *
 *   const handleLogout = () => {
 *     if (window.confirm('Are you sure you want to logout?')) {
 *       logout();
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleLogout} disabled={isLoading}>
 *       Logout
 *     </button>
 *   );
 * }
 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: logout, isLoading } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.removeQueries();
      navigate("/login", { replace: true });
    },
  });

  return { logout, isLoading };
}
