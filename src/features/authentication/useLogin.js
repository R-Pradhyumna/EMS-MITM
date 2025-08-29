import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: login, isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user.user);
      toast.success("Login Successful");
      navigate("/homepage", { replace: true });
    },
    onError: (err) => {
      // Only show "email/password incorrect" if error is from Supabase Auth.
      if (err.message === "Invalid login credentials") {
        toast.error("Provided email or password is incorrect");
      } else {
        toast.error(err.message);
      }
    },
  });

  return { login, isLoading };
}
