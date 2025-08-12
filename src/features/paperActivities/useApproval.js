import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvePaper } from "../../services/apiCoE";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * useApproval
 * -----------
 * Hook to handle the paper approval/locking mutation logic for CoE and BoE roles.
 *
 * - Triggers an approval (or lock) update for a given paper using approvePaper API.
 * - Shows success/error toast notifications.
 * - Invalidates all queries (for up-to-date tables, dashboards, etc).
 * - On success, navigates to user-appropriate landing page (depending on role: /coe, /boe, or default /papers).
 *
 * Usage:
 *   const { mutate, isLoading } = useApproval({ role });
 *   mutate({ id, update });
 *
 * @param {Object} opts
 * @param {'coe'|'boe'|string} opts.role - The current user role to customize navigation.
 * @returns {Object} { mutate, isLoading }
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
