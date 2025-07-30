import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPapers } from "../../services/apiCoE";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";

export function useCPapers() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // 1. Filter
  const dept = searchParams.get("department_name");
  const academicYear = searchParams.get("academic_year");
  const subjectCode = searchParams.get("subject_code") ?? "";

  const filters = [];
  if (dept && dept !== "all")
    filters.push({ field: "department_name", value: dept });
  if (academicYear && academicYear !== "all")
    filters.push({ field: "academic_year", value: academicYear });

  // 3. Pagination
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    data: { data: papers, count } = {},
    error,
  } = useQuery({
    queryKey: ["exam_papers", filters, subjectCode, page],
    queryFn: () => getPapers({ filters, search: subjectCode, page }),
  });

  // Prefetching
  const pageCount = Math.ceil(count / PAGE_SIZE);
  if (page < pageCount)
    queryClient.prefetchQuery({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ["exam_papers", filters, subjectCode, page + 1],
      queryFn: () => getPapers({ filters, subjectCode, page: page + 1 }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ["exam_papers", filters, subjectCode, page - 1],
      queryFn: () => getPapers({ filters, subjectCode, page: page - 1 }),
    });

  return { isLoading, error, papers: papers ?? [], count: count ?? 0 };
}
