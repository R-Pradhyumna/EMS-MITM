import { useQuery } from "@tanstack/react-query";
import { getSubjectsForDepartment } from "../../services/apiFaculty"; // should fetch the subjects

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects", 1], // 1 = department_id
    queryFn: getSubjectsForDepartment, // Your API fetch, returns array
  });
}
