import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
import { getCoE } from "../../services/apiPrincipal";

export function useGetCoE() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    data: { data: users, count } = {},
    error,
  } = useQuery({
    queryKey: ["users", page],
    queryFn: () => getCoE({ page }),
  });

  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["users", page + 1],
      queryFn: () => getCoE({ page: page + 1 }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["users", page - 1],
      queryFn: () => getCoE({ page: page - 1 }),
    });

  return { isLoading, error, users: users ?? [], count: count ?? 0 };
}
