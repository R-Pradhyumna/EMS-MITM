import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { uploadScrutinizedFiles } from "../../services/apiBoE";

/**
 * useUploadScrutinizedFiles
 * --------------------------
 * Custom React Query mutation hook for uploading scrutinized (corrected) QP and Schema files.
 *
 * Usage:
 *   const { mutate, isLoading } = useUploadScrutinizedFiles({ onSuccess });
 *   mutate({ paper, qpFile, schemaFile });
 *
 * - Calls the API to upload corrected files to Supabase/storage.
 * - Shows success or error toast messages automatically.
 * - Invalidates 'exam_papers' queries for live table refresh on upload completion.
 * - Accepts an onSuccess callback for parent-level UI reset or other post-upload logic.
 */
export function useUploadScrutinizedFiles({ onSuccess: onSuccessProp } = {}) {
  // Gives us the React Query cache client (for cache invalidation after mutation)
  const queryClient = useQueryClient();

  // Setup the mutation hook for scrutinized file uploads
  const mutation = useMutation({
    // mutationFn receives the payload: { paper, qpFile, schemaFile }
    mutationFn: ({ paper, qpFile, schemaFile }) =>
      uploadScrutinizedFiles(paper, qpFile, schemaFile),

    // Called on successful upload
    onSuccess: (data, variables, context) => {
      toast.success("Scrutinized files uploaded successfully!");
      // Invalidate the exam_papers list/query so table/grid refreshes immediately
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
      // Call any provided parent onSuccess callback with API response, etc.
      if (onSuccessProp) onSuccessProp(data, variables, context);
    },

    // Called on upload/API error
    onError: (error) => {
      toast.error(error.message || "Failed to upload scrutinized files.");
    },
  });

  // Only return what the parent needs: mutate (to trigger), and loading state for UI
  return {
    mutate: mutation.mutate, // To call: mutate({ paper, qpFile, schemaFile })
    isLoading: mutation.isLoading, // Boolean: true while request is pending
  };
}
