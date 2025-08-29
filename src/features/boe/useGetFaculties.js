import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFaculties } from "../../services/apiBoE";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
import { useUserData } from "../authentication/useUserData";

export function useGetFaculties() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { department_name } = useUserData();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    data: { data: users, count } = {},
    error,
  } = useQuery({
    queryKey: ["users", department_name, page],
    queryFn: () => getFaculties({ page, department_name }),
  });

  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["users", department_name, page + 1],
      queryFn: () => getFaculties({ page: page + 1, department_name }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["users", department_name, page - 1],
      queryFn: () => getFaculties({ page: page - 1, department_name }),
    });

  return { isLoading, error, users: users ?? [], count: count ?? 0 };
}
