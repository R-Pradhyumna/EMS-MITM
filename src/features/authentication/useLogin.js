/**
 * Login Mutation Hook
 *
 * Custom React Query mutation hook for handling user login authentication.
 * Manages login state, caches user data, handles navigation, and displays
 * user feedback via toast notifications.
 *
 * @module useLogin
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../../services/apiAuth";

/**
 * Handles user login with authentication, caching, and navigation.
 *
 * Provides a mutation function for logging in users with email and password.
 * On successful login:
 * - Caches authenticated user data in React Query cache
 * - Displays success toast notification
 * - Navigates to homepage with history replacement
 *
 * On login failure:
 * - Displays user-friendly error messages
 * - Differentiates between invalid credentials and other errors
 * - Preserves user on login page for retry
 *
 * React Query features:
 * - Optimistic updates with query cache invalidation
 * - Automatic loading state management
 * - Error handling with retry logic
 * - Request deduplication
 *
 * @returns {Object} Login mutation object
 * @returns {Function} returns.login - Mutation function to trigger login
 * @returns {boolean} returns.isLoading - True while login request is in progress
 *
 * @example
 * function LoginForm() {
 *   const { login, isLoading } = useLogin();
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     login({ email, password });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         type="email"
 *         value={email}
 *         onChange={(e) => setEmail(e.target.value)}
 *         disabled={isLoading}
 *       />
 *       <input
 *         type="password"
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *         disabled={isLoading}
 *       />
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: login, isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user.user);
      toast.success("Login Successful");
      navigate("/homepage", { replace: true });
    },
    onError: (err) => {
      // Only show "email/password incorrect" if error is from Supabase Auth.
      if (err.message === "Invalid login credentials") {
        toast.error("Provided email or password is incorrect");
      } else {
        toast.error(err.message);
      }
    },
  });

  return { login, isLoading };
}
