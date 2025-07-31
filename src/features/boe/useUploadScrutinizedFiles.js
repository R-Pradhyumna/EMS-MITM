import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { uploadScrutinizedFiles } from "../../services/apiBoE";

export function useUploadScrutinizedFiles({ onSuccess: onSuccessProp } = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ paper, qpFile, schemaFile }) =>
      uploadScrutinizedFiles(paper, qpFile, schemaFile),
    onSuccess: (data, variables, context) => {
      toast.success("Scrutinized files uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
      if (onSuccessProp) onSuccessProp(data, variables, context);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload scrutinized files.");
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isLoading,
  };
}
