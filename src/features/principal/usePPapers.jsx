import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getPapers } from "../../services/apiPrincipal";
import { PAGE_SIZE } from "../../utils/constants";
import { format } from "date-fns";

export function usePPapers() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // 1. Filter from URL/params
  const dept = searchParams.get("department_name");
  const academicYear = searchParams.get("academic_year");
  const subjectCode = searchParams.get("subject_code") ?? "";
  const today = format(new Date(), "yyyy-MM-dd");

  const filters = [{ field: "status", value: "Locked" }];

  if (dept && dept !== "all")
    filters.push({ field: "department_name", value: dept });
  if (academicYear && academicYear !== "all")
    filters.push({ field: "academic_year", value: academicYear });

  // Pagination
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    data: { data: papers, count } = {},
    error,
  } = useQuery({
    queryKey: ["exam_papers", filters, subjectCode, page, today],
    queryFn: () =>
      getPapers({
        filters,
        search: subjectCode,
        page,
        date: today,
      }),
  });

  // Prefetching
  const pageCount = Math.ceil(count / PAGE_SIZE);
  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: ["exam_papers", filters, subjectCode, page + 1],
      queryFn: () =>
        getPapers({ filters, search: subjectCode, page: page + 1 }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["exam_papers", filters, subjectCode, page - 1],
      queryFn: () =>
        getPapers({ filters, search: subjectCode, page: page - 1 }),
    });

  return { isLoading, error, papers: papers ?? [], count: count ?? 0 };
}
