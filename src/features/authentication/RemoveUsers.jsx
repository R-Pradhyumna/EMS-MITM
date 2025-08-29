import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import supabase from "../../services/supabase";

function RemoveUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (employee_id) => {
      const { data, error } = await supabase.functions.invoke("removeUsers", {
        body: JSON.stringify({ employee_id }),
      });
      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "users" &&
            query.queryKey.length === 2 &&
            typeof query.queryKey[1] === "number", // page
        });
        toast.success("User successfully deleted");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete user");
      },
    }
  );

  return mutation;
}

export default RemoveUser;
