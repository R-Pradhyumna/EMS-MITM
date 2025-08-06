import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEditPapers } from "../../services/apiFaculty";

/**
 * useEditPaper
 * -----------------
 * Custom React hook for editing (updating) an exam paper entry, including file uploads.
 * - Provides an 'editPaper' function to call with { newPaperData, id }
 * - Tracks loading state with 'isEditing' for UI disabling/spinners
 * - Shows toast notifications on success/error
 * - Auto-invalidates 'exam_papers' queries on success so UI stays up-to-date
 *
 * Usage:
 *   const { editPaper, isEditing } = useEditPaper();
 *   editPaper({ newPaperData: payload, id: paperId });
 */
export function useEditPaper() {
  // Access the React Query cache client for refetching paper data after update
  const queryClient = useQueryClient();

  // Set up the mutation for editing a paper
  const { mutate: editPaper, isLoading: isEditing } = useMutation({
    // mutationFn: takes a destructured object { newPaperData, id }
    // Calls your API utility to handle the edit (with the specific paper ID)
    mutationFn: ({ newPaperData, id }) => createEditPapers(newPaperData, id),

    // On successful edit:
    onSuccess: () => {
      toast.success("Paper successfully edited!");
      // Invalidate (refetch) all paper queries so components rerender with new data
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
      // NOTE: `reset()` here should be handled inside your form, not here!
      // reset();
    },

    // On error (file fails to upload, network/database error, etc):
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Expose editing state and the function to trigger the edit mutation
  return { isEditing, editPaper };
}
