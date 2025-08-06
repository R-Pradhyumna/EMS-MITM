import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { downloadPaper } from "../../services/apiPrincipal";

// Custom React Query hook to handle the paper download "locking" logic.
// - Encapsulates all mutation and toast logic, so components only need to call mutate().
// - Handles query cache refresh and success/error UI feedback.
export function useDownloadPaper({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      principal_employee_id,
      subject_id,
      exam_date,
      downloaded_paper_id,
      subject_code,
      qp_file_url,
    }) =>
      downloadPaper(
        principal_employee_id,
        subject_id,
        exam_date,
        downloaded_paper_id
      ),
    onSuccess: (data, variables, context) => {
      toast.success("Download recorded successfully!");
      queryClient.invalidateQueries({
        queryKey: ["principal_paper_downloads"],
      });
      if (onSuccess) onSuccess({ ...variables, ...data }, context);
    },
    onError: (error, variables, context) => {
      toast.error(
        error.message ||
          "You have already downloaded a paper for this subject/exam."
      );
      if (onError) onError(error, variables, context); // Call parent onError if provided!
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isLoading,
  };
}
