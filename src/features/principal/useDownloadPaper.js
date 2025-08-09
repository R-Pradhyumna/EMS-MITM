import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { downloadPaper } from "../../services/apiPrincipal";

/**
 * useDownloadPaper
 * -----------------
 * Custom React Query mutation hook for handling Principal's
 * download-paper (with lockout) flow, to ensure only one download per subject/exam/employee per day.
 *
 * Features:
 *   - Calls downloadPaper backend api (records/locks download in principal_paper_downloads table)
 *   - Shows success or error toasts
 *   - Invalidates related queries for refresh
 *   - Exposes isLoading and mutate for UI and logic control
 *   - Supports parent-level onSuccess/onError hooks for extra UI or integration logic
 *
 * Usage:
 *   const { mutate, isLoading } = useDownloadPaper({ onSuccess, onError });
 *   mutate({
 *     principal_employee_id, subject_id, exam_date, downloaded_paper_id,
 *     subject_code, qp_file_url
 *   });
 */

export function useDownloadPaper({ onSuccess, onError } = {}) {
  // Hook to get React Query's cache control
  const queryClient = useQueryClient();

  // Setup mutation hook for downloading a paper
  // - mutationFn: backend API call to record the download and lock this paper
  // - onSuccess: called after backend response, shows toast, invalidates cache, triggers parent success callback
  // - onError: handles API error, shows toast, triggers parent error callback
  const mutation = useMutation({
    // Calls the backend API/service
    mutationFn: ({ downloaded_paper_id }) => downloadPaper(downloaded_paper_id),

    onSuccess: (data, variables, context) => {
      // Show success toast to user
      toast.success("Download recorded successfully!");
      // Invalidate the 'exam_papers' query so the UI fetches new status/data
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
      // If parent provides extra onSuccess logic (UI integration, session lockout etc), run it
      if (onSuccess) onSuccess({ ...variables, ...data }, context);
    },

    onError: (error, variables, context) => {
      // Show error to user if download or lockout fails
      toast.error(error.message || "Could not record or mark download.");
      // If parent provides extra onError logic, run it (e.g., local UI/session lockout even on failure)
      if (onError) onError(error, variables, context);
    },
  });

  // Return mutate function for triggering download and loading state for UI
  return {
    mutate: mutation.mutate,
    isLoading: mutation.isLoading,
  };
}
