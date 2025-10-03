/**
 * Academic Year Query Hook
 *
 * Custom React Query hook for fetching distinct academic years from exam papers.
 * Uses TanStack Query (React Query) for caching, background updates, and error handling.
 *
 * @module useAcademicYear
 */

import { useQuery } from "@tanstack/react-query";
import { getAcademicYear } from "../services/apiCoE";

/**
 * Fetches all distinct academic years available in the exam papers database.
 *
 * Retrieves a list of academic years for dropdown filters and year-based queries.
 * Data is cached and automatically refetched based on React Query's default stale time.
 *
 * React Query features:
 * - Automatic caching with 'exam_papers' query key
 * - Background refetching on window focus
 * - Automatic retry on failure
 * - Loading and error state management
 *
 * @returns {Object} Query result object
 * @returns {boolean} returns.isLoading - True while initial data is being fetched
 * @returns {Array<Object>} returns.ay - Array of objects containing academic_year values (may contain duplicates)
 * @returns {Error|null} returns.error - Error object if query fails, null otherwise
 *
 * @example
 * function AcademicYearFilter() {
 *   const { isLoading, ay, error } = useAcademicYear();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   // Extract unique years
 *   const uniqueYears = [...new Set(ay.map(item => item.academic_year))];
 *
 *   return (
 *     <select>
 *       {uniqueYears.map(year => (
 *         <option key={year} value={year}>{year}</option>
 *       ))}
 *     </select>
 *   );
 * }
 */
export function useAcademicYear() {
  const {
    isLoading,
    data: ay,
    error,
  } = useQuery({
    queryKey: ["exam_papers"],
    queryFn: getAcademicYear,
  });

  return { isLoading, ay, error };
}
