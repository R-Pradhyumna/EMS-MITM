import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEditPapers } from "../../services/apiFaculty";

export function useEditPaper() {
  const queryClient = useQueryClient();

  const { mutate: editPaper, isLoading: isEditing } = useMutation({
    mutationFn: ({ newPaperData, id }) => createEditPapers(newPaperData, id),
    onSuccess: () => {
      toast.success("Paper successfully edited!");
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
      reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isEditing, editPaper };
}
