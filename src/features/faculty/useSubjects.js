/**
 * Subjects Query Hook
 *
 * Custom React Query hook for fetching subjects for a specific department.
 * Used to populate subject dropdowns and validate subject selections in
 * paper submission forms.
 *
 * @module useSubjects
 */

import { useQuery } from "@tanstack/react-query";
import { getSubjectsForDepartment } from "../../services/apiFaculty";

/**
 * Fetches subjects for a specific department with caching.
 *
 * Retrieves all subjects available in a department for paper submission forms
 * and subject selection dropdowns. Currently hardcoded to department_id = 1,
 * but can be enhanced to accept dynamic department IDs.
 *
 * Subject data includes:
 * - subject_code: Unique subject identifier
 * - subject_name: Full name of the subject
 * - subject_type: Type/category of subject
 * - department_id: Associated department
 * - Document URLs: instructions, syllabus, model_paper, declaration, templates
 *
 * React Query features:
 * - Cached with ["subjects", 1] query key
 * - Data persists across component remounts
 * - Automatic background refetching on window focus
 * - Prevents redundant API calls
 *
 * Note: Currently hardcoded to department_id = 1. Consider enhancing to:
 * - Accept department_id as parameter
 * - Use current user's department from useUserData()
 * - Support multiple department filtering
 *
 * @returns {Object} React Query result object
 * @returns {boolean} returns.isLoading - True while subjects are being fetched
 * @returns {Array<Object>} returns.data - Array of subject objects
 * @returns {Error|null} returns.error - Error object if query fails
 * @returns {boolean} returns.isSuccess - True when data is successfully loaded
 * @returns {boolean} returns.isError - True if query encountered an error
 *
 * @example
 * // Subject dropdown in paper submission form
 * function SubjectSelector() {
 *   const { data: subjects, isLoading, error } = useSubjects();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage>Failed to load subjects</ErrorMessage>;
 *
 *   return (
 *     <select name="subject_code" required>
 *       <option value="">Select Subject</option>
 *       {subjects.map(subject => (
 *         <option key={subject.subject_code} value={subject.subject_code}>
 *           {subject.subject_code} - {subject.subject_name}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 *
 * @example
 * // Subject list with type badges
 * function SubjectList() {
 *   const { data: subjects, isLoading } = useSubjects();
 *
 *   if (isLoading) return <Loader />;
 *
 *   return (
 *     <ul className="subjects-list">
 *       {subjects?.map(subject => (
 *         <li key={subject.subject_code}>
 *           <span>{subject.subject_name}</span>
 *           <Badge>{subject.subject_type}</Badge>
 *           <a href={subject.syllabus_url} target="_blank">View Syllabus</a>
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 *
 * @example
 * // Enhanced version with dynamic department (future improvement)
 * // function useSubjects(department_id) {
 * //   return useQuery({
 * //     queryKey: ["subjects", department_id],
 * //     queryFn: () => getSubjectsForDepartment(department_id),
 * //     enabled: !!department_id, // Only fetch if department_id exists
 * //   });
 * // }
 *
 * @example
 * // With useUserData for current user's department
 * // function useSubjects() {
 * //   const { department_name } = useUserData();
 * //   return useQuery({
 * //     queryKey: ["subjects", department_name],
 * //     queryFn: () => getSubjectsForDepartment(department_name),
 * //     enabled: !!department_name,
 * //   });
 * // }
 */
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects", 1], // 1 = department_id
    queryFn: getSubjectsForDepartment, // Your API fetch, returns array
  });
}
