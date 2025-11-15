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
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { approvePaper as approveBoEPaper } from "../../services/apiBoE"; // BoE API
import { approvePaper as approveCoEPaper } from "../../services/apiCoE"; // CoE API

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
 * 1. Receives paper ID and update object (status, approved_by, etc.)
 * 2. Calls appropriate API based on role
 * 3. On success: shows toast, invalidates cache, redirects
 * 4. On error: displays error toast with message
 *
 * @param {Object} options - Configuration options
 * @param {string} options.role - User role ("CoE" or "BoE")
 * @returns {Object} React Query mutation object
 * @returns {Function} returns.mutate - Mutation function to approve paper
 * @returns {boolean} returns.isLoading - Loading state during approval
 *
 * @example
 * // In CoE approval component
 * const { mutate, isLoading } = useApproval({ role: "CoE" });
 * mutate({ id: 123, update: { status: "CoE-approved" } });
 *
 * @example
 * // In BoE approval component
 * const { mutate, isLoading } = useApproval({ role: "BoE" });
 * mutate({ id: 123, update: { status: "BoE-approved" } });
 */
export function useApproval({ role }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Select the correct API function based on role
  const approvePaperFn = role === "CoE" ? approveCoEPaper : approveBoEPaper;

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ id, update }) => approvePaperFn(id, update),
    onSuccess: () => {
      toast.success("Paper approved successfully!");
      // Invalidate all queries to refresh data across the app
      queryClient.invalidateQueries();
      // Navigate back to role-specific dashboard
      navigate(role === "CoE" ? "/coe" : "/boe");
    },
    onError: (err) => {
      console.error("Approval error:", err);
      toast.error(err.message || "Failed to approve paper");
    },
  });

  return { mutate, isLoading };
}
