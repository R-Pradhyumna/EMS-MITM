import { useMutation } from "@tanstack/react-query";
import { signUp as signupApi } from "../../services/apiAuth";
import { toast } from "react-hot-toast";

export function useSignup() {
  const { mutate: signup, isLoading } = useMutation({
    mutationFn: signupApi,
    onSuccess: (user) => {
      toast.success(
        "Account successfuly created! Please verify the new account from the user's email address"
      );
    },
    onError: (error) => {
      toast.error(error.message || "Signup failed. Please try again.");
    },
  });

  return { signup, isLoading };
}
