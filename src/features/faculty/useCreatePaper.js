import toast from "react-hot-toast";
import { createEditPapers } from "../../services/apiFaculty";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * useCreatePaper
 * -----------------
 * Custom React hook for creating a new exam paper entry (with file upload and metadata).
 * Provides a 'createPaper' function you can call from your form, and an 'isCreating' state
 * to indicate loading/progress in UI.
 *
 * - Triggers the createEditPapers API call (defined in your data layer)
 * - On success: shows a toast and invalidates the 'exam_papers' query so UI refreshes
 * - On error: displays error toast
 *
 * Usage:
 *   const { createPaper, isCreating } = useCreatePaper();
 *   createPaper(formData);
 *
 *   <Button disabled={isCreating}>Add Paper</Button>
 */
export function useCreatePaper() {
  // Get React Query's query client, for cache updates after mutation
  const queryClient = useQueryClient();

  // Set up the create-paper mutation hook
  const { mutate: createPaper, isLoading: isCreating } = useMutation({
    // This function will be called by mutate() with the user's payload
    mutationFn: createEditPapers,

    // After a successful creation:
    onSuccess: () => {
      toast.success("New paper successfully created!");
      // Refresh all cached paper lists (forces refetch, so users see the new paper)
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
    },

    // On error (could be file upload, network, DB error, etc):
    onError: (err) => {
      toast.error(err.message); // Show error as toast to user
    },
  });

  // Expose the main function and loading state for the component/form to use
  return { isCreating, createPaper };
}
