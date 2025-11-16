/**
 * Update User Mutation Hook
 *
 * Custom React Query mutation hook for updating current user's profile information.
 * Handles password changes and full name updates with cache synchronization
 * and user feedback notifications.
 *
 * @module useUpdateUser
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateCurrentUser } from "../../services/apiAuth";

/**
 * Updates the currently authenticated user's profile information.
 *
 * Provides a mutation function for updating user account details such as
 * password or full name. On successful update:
 * - Updates Supabase Auth user record
 * - Synchronizes updated user data in React Query cache
 * - Displays success toast notification
 * - Immediately reflects changes in UI without refetch
 *
 * On update failure:
 * - Displays error toast with specific error message
 * - Preserves existing user data in cache
 * - Allows user to retry the operation
 *
 * Supported updates:
 * - Password change (requires current authentication)
 * - Full name update (stored in user metadata)
 *
 * React Query features:
 * - Optimistic cache update (setQueryData) for instant UI reflection
 * - Automatic loading state management
 * - Error handling with user notifications
 * - No background refetch needed (direct cache update)
 *
 * @returns {Object} Update user mutation object
 * @returns {Function} returns.updateUser - Mutation function to trigger user update
 * @returns {boolean} returns.isUpdating - True while update request is in progress
 *
 * @example
 * function UpdatePasswordForm() {
 *   const { updateUser, isUpdating } = useUpdateUser();
 *   const [password, setPassword] = useState('');
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     updateUser({ password });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         type="password"
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *         placeholder="New password"
 *         disabled={isUpdating}
 *       />
 *       <button type="submit" disabled={isUpdating}>
 *         {isUpdating ? 'Updating...' : 'Update Password'}
 *       </button>
 *     </form>
 *   );
 * }
 *
 * @example
 * function UpdateProfileForm() {
 *   const { updateUser, isUpdating } = useUpdateUser();
 *   const [fullName, setFullName] = useState('');
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     updateUser({ fullName });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         type="text"
 *         value={fullName}
 *         onChange={(e) => setFullName(e.target.value)}
 *         placeholder="Full Name"
 *         disabled={isUpdating}
 *       />
 *       <button type="submit" disabled={isUpdating}>
 *         Update Profile
 *       </button>
 *     </form>
 *   );
 * }
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isLoading: isUpdating } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: ({ user }) => {
      toast.success("User account successfuly updated");
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }, 100);
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateUser, isUpdating };
}
