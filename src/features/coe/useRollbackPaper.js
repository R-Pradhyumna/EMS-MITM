import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { rollbackPaperStatus } from "../../services/apiCoE";

export default function useRollbackPaper() {
  const queryClient = useQueryClient();

  const { mutate: rollbackPaper, isPending } = useMutation({
    mutationFn: ({ paperId, targetStatus }) =>
      rollbackPaperStatus(paperId, targetStatus),
    onSuccess: () => {
      toast.success("Paper status rolled back successfully");
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { rollbackPaper, isPending };
}
