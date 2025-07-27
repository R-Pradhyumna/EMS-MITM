import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvePaper } from "../../services/apiCoE";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function useApproval() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // For maximum flexibility, no side-effects or status logic, just generic mutation.
  const { mutate, isLoading } = useMutation({
    mutationFn: ({ id, update }) => approvePaper(id, update),
    onSuccess: (data) => {
      toast.success("Action successfully completed!");
      queryClient.invalidateQueries({ active: true });
      navigate("/coe");
    },
    onError: () =>
      toast.error("There was an error while performing the action!"),
  });
  return { mutate, isLoading };
}
