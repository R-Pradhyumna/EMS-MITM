import toast from "react-hot-toast";
import { createEditPapers } from "../../services/apiFaculty";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePaper() {
  const queryClient = useQueryClient();

  const { mutate: createPaper, isLoading: isCreating } = useMutation({
    mutationFn: createEditPapers,
    onSuccess: () => {
      toast.success("New paper successfully created!");
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isCreating, createPaper };
}
