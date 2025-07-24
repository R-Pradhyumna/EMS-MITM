import { useQuery } from "@tanstack/react-query";
import { getPapers } from "../../services/apiCoE";
import { useSearchParams } from "react-router-dom";

export function useCPapers() {
  const [searchParams] = useSearchParams();

  // // 1. Filter
  // const filterValue = searchParams.get("status");
  // const filter =
  //   !filterValue || filterValue === "all"
  //     ? null
  //     : { field: "status", value: filterValue };

  // // 2. Sort
  // const sortByRaw = searchParams.get("sortBy") || "academic_year";
  // const { field, direction } = sortByRaw.split("-");
  // const sortBy = { field, direction };

  const {
    isLoading,
    data: papers,
    error,
  } = useQuery({
    queryKey: ["exam_papers", filter, sortBy],
    queryFn: () => getPapers({ filter, sortBy }),
  });

  return { isLoading, error, papers };
}
