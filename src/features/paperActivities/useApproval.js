/**
 * Paper Approval Mutation Hook
 *
 * Custom React Query mutation hook for approving and locking examination papers
 * by CoE and BoE roles. Handles status updates, cache invalidation, role-based
 * navigation, and user feedback notifications.
 *
 * @module useApproval
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvePaper } from "../../services/apiCoE";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * Approves and locks examination papers with role-based navigation.
 *
 * Provides a mutation function for CoE and BoE users to approve examination papers.
 * The approval process typically updates the paper status to "Locked" and records
 * approval metadata (timestamp, approver, etc.). After successful approval:
 * - Displays success toast notification
 * - Invalidates all active queries for complete UI refresh
 * - Navigates to role-appropriate dashboard
 *
 * Approval workflow:
 * 1. Receives paper ID and update object (status, timestamps, approver info)
 * 2. Calls approvePaper API to update database
 * 3. On success: shows toast, refreshes all cached data, redirects to dashboard
 * 4. On error: shows error toast, maintains current page state
 *
 * Role-based navigation:
 * - CoE role → navigates to /coe
 * - BoE role → navigates to /boe
 * - Other roles → navigates to /papers (fallback)
 *
 * Cache invalidation strategy:
 * - Invalidates ALL active queries (not just exam_papers)
 * - Ensures all dashboards, tables, and statistics are refreshed
 * - Prevents stale data across the application
 *
 * React Query features:
 * - Global cache invalidation for comprehensive updates
 * - Loading state management
 * - Error handling with toast notifications
 * - Automatic UI refresh across all components
 *
 * @param {Object} options - Configuration options
 * @param {string} options.role - Current user role ('CoE', 'BoE', etc.) for navigation routing
 * @returns {Object} Approval mutation object
 * @returns {Function} returns.mutate - Mutation function to trigger approval
 * @returns {boolean} returns.isLoading - True while approval request is in progress
 *
 * @example
 * // CoE paper approval
 * function CoEApprovalButton({ paper }) {
 *   const { mutate: approve, isLoading } = useApproval({ role: 'CoE' });
 *   const { username } = useUserData();
 *
 *   const handleApprove = () => {
 *     approve({
 *       id: paper.id,
 *       update: {
 *         status: 'Locked',
 *         approved_at: new Date().toISOString(),
 *         approved_by: username
 *       }
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleApprove} disabled={isLoading}>
 *       {isLoading ? 'Approving...' : 'Approve & Lock Paper'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // BoE approval with confirmation dialog
 * function BoEApprovalForm({ paper }) {
 *   const { mutate: approve, isLoading } = useApproval({ role: 'BoE' });
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *
 *     if (window.confirm('Are you sure you want to approve this paper?')) {
 *       approve({
 *         id: paper.id,
 *         update: {
 *           status: 'Locked',
 *           locked_at: new Date().toISOString(),
 *           locked_by: 'BoE Committee'
 *         }
 *       });
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <PaperPreview paper={paper} />
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading && <Spinner />}
 *         Lock Paper
 *       </button>
 *     </form>
 *   );
 * }
 *
 * @example
 * // Bulk approval with comments
 * function BulkApprovalTool({ paperIds }) {
 *   const { mutate: approve, isLoading } = useApproval({ role: 'CoE' });
 *   const [comments, setComments] = useState('');
 *
 *   const handleBulkApprove = () => {
 *     paperIds.forEach(id => {
 *       approve({
 *         id,
 *         update: {
 *           status: 'Locked',
 *           comments: comments,
 *           approved_at: new Date().toISOString()
 *         }
 *       });
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <textarea
 *         value={comments}
 *         onChange={(e) => setComments(e.target.value)}
 *         placeholder="Approval comments (optional)"
 *       />
 *       <button onClick={handleBulkApprove} disabled={isLoading}>
 *         Approve {paperIds.length} Papers
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useApproval({ role }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Helper to decide where to navigate after success, based on role
  function getLanding(role) {
    if (role === "CoE") return "/coe";
    if (role === "BoE") return "/boe";
    return "/papers";
  }

  // Mutation for paper approval/lock workflow, with notifications and navigation
  const { mutate, isLoading } = useMutation({
    // mutationFn expects { id, update } payload
    mutationFn: ({ id, update }) => approvePaper(id, update),

    // On successful mutation:
    onSuccess: (data) => {
      toast.success("Action successfully completed!");
      queryClient.invalidateQueries({ active: true }); // refresh all active queries (all tables/views update)
      navigate(getLanding(role)); // redirect user to correct dashboard
    },

    // On API/server error:
    onError: () =>
      toast.error("There was an error while performing the action!"),
  });

  // Expose mutate (to trigger submission) and isLoading (for UI disabling/spinner)
  return { mutate, isLoading };
}
