import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvePaper } from "../../services/apiCoE";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function useApproval({ role }) {
  // console.log(role);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  function getLanding(role) {
    if (role === "coe") return "/coe";
    if (role === "boe") return "/boe";
    return "/papers";
  }

  // For maximum flexibility, no side-effects or status logic, just generic mutation.
  const { mutate, isLoading } = useMutation({
    mutationFn: ({ id, update }) => approvePaper(id, update),
    onSuccess: (data) => {
      toast.success("Action successfully completed!");
      queryClient.invalidateQueries({ active: true });
      navigate(getLanding(role));
    },
    onError: () =>
      toast.error("There was an error while performing the action!"),
  });
  return { mutate, isLoading };
}
