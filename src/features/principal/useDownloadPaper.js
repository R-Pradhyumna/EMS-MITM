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
  // React Query client for invalidating/refreshing cached queries after action
  const queryClient = useQueryClient();

  // Set up mutation for the "record download + lock row" backend call
  const mutation = useMutation({
    // mutationFn: takes data describing principal/subject/paper, only sends what backend needs
    mutationFn: ({
      principal_employee_id,
      subject_id,
      exam_date,
      downloaded_paper_id,
      subject_code, // (passed for UI only)
      qp_file_url, // (passed for UI only)
    }) =>
      // Only send what's needed by backend insert function (does not use subject_code/qp_file_url)
      downloadPaper(
        principal_employee_id,
        subject_id,
        exam_date,
        downloaded_paper_id
      ),

    // On successful download/lock: toast, cache refresh, parent callback
    onSuccess: (data, variables, context) => {
      toast.success("Download recorded successfully!");
      queryClient.invalidateQueries({
        queryKey: ["principal_paper_downloads"],
      });
      // Call parent onSuccess with all response/variables merged for easy UI (e.g. file URL, subject_code)
      if (onSuccess) onSuccess({ ...variables, ...data }, context);
    },

    // On backend error (unique-constraint or otherwise): show toast, parent handler
    onError: (error, variables, context) => {
      toast.error(
        error.message ||
          "You have already downloaded a paper for this subject/exam."
      );
      if (onError) onError(error, variables, context); // call parent if provided
    },
  });

  // Expose only the mutate func and loading flag needed for triggering and disabling UI
  return {
    mutate: mutation.mutate, // To use: mutate({ ...params })
    isLoading: mutation.isLoading,
  };
}
