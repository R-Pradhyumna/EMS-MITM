/**
 * Current User Query Hook
 *
 * Custom React Query hook for fetching and managing the currently authenticated user's data.
 * Provides authentication status, user information, and loading states for protecting
 * routes and personalizing the UI.
 *
 * @module useUser
 */

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/apiAuth";

/**
 * Fetches the currently authenticated user from active session.
 *
 * Retrieves user data from Supabase Auth session and provides authentication status.
 * This hook is used throughout the application for:
 * - Protected route authentication checks
 * - User profile display
 * - Role-based access control
 * - Conditional UI rendering based on auth state
 *
 * Authentication check:
 * - Returns true if user has "authenticated" role in Supabase
 * - Returns false if no user or session expired
 * - Used by ProtectedRoute component to guard private pages
 *
 * React Query features:
 * - Automatic caching with "user" query key
 * - Background refetching on window focus
 * - Stale-while-revalidate pattern for instant UI
 * - Shared cache across all components using this hook
 *
 * Loading states:
 * - isLoading: True during initial data fetch (no cached data)
 * - isFetching: True during any fetch (including background refetch)
 *
 * @returns {Object} User query result object
 * @returns {boolean} returns.isLoading - True during initial fetch with no cached data
 * @returns {Object|null} returns.user - User object if authenticated, null otherwise
 * @returns {boolean} returns.isAuthenticated - True if user has valid authenticated session
 * @returns {boolean} returns.isFetching - True during any fetch operation (initial or background)
 *
 * @example
 * // Protected route check
 * function ProtectedRoute({ children }) {
 *   const { isLoading, isAuthenticated } = useUser();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <Navigate to="/login" />;
 *
 *   return children;
 * }
 *
 * @example
 * // Display user profile
 * function UserProfile() {
 *   const { user, isLoading } = useUser();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       <h2>Welcome, {user?.email}</h2>
 *       <p>User ID: {user?.id}</p>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Show loading indicator during background refetch
 * function Header() {
 *   const { user, isFetching } = useUser();
 *
 *   return (
 *     <header>
 *       <h1>ExamSuite</h1>
 *       {isFetching && <span className="sync-indicator">Syncing...</span>}
 *       <span>{user?.email}</span>
 *     </header>
 *   );
 * }
 */
export function useUser() {
  const {
    isLoading,
    data: user,
    isFetching,
  } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  const isAuthenticated = user?.role === "authenticated";

  return { isLoading, user, isAuthenticated, isFetching };
}
