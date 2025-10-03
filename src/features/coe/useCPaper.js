/**
 * CoE Single Paper Query Hook
 *
 * Custom React Query hook for fetching a single examination paper by ID
 * in the Controller of Examinations (CoE) workflow. Extracts paper ID from
 * URL parameters and retrieves detailed paper information for review and management.
 *
 * @module useCPaper
 */

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPaper } from "../../services/apiCoE";

/**
 * Fetches a single CoE paper record by ID from URL parameters.
 *
 * Retrieves detailed examination paper information for Controller of Examinations
 * review, approval, and management workflows. The paper ID is automatically
 * extracted from the route parameter.
 *
 * Route structure:
 * - Expected route pattern: /papers/:id or /coe/papers/:id
 * - Automatically reads :id parameter from current URL
 *
 * React Query configuration:
 * - Unique cache key per paper ID (["exam_papers", id])
 * - No retry on error for fast-fail behavior (404 should not retry)
 * - Cached data prevents redundant API calls for same paper
 * - Shared cache with other paper queries using same key
 *
 * Use cases:
 * - Paper detail view for CoE oversight
 * - Institution-wide paper verification
 * - Status tracking and approval workflows
 * - Paper metadata review across departments
 *
 * @returns {Object} Paper query result object
 * @returns {boolean} returns.isLoading - True while paper data is being fetched
 * @returns {Error|null} returns.error - Error object if fetch fails (404, network error, etc.)
 * @returns {Object|undefined} returns.paper - Exam paper object with all fields, undefined if not yet loaded
 *
 * @example
 * // CoE paper detail page with full information
 * function CoEPaperDetail() {
 *   const { isLoading, error, paper } = useCPaper();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage>Paper not found: {error.message}</ErrorMessage>;
 *
 *   return (
 *     <div>
 *       <h1>{paper.subject_name}</h1>
 *       <div className="paper-info">
 *         <p>Subject Code: {paper.subject_code}</p>
 *         <p>Department: {paper.department_name}</p>
 *         <p>Academic Year: {paper.academic_year}</p>
 *         <p>Semester: {paper.semester}</p>
 *         <p>Status: {paper.status}</p>
 *         <p>Uploaded By: {paper.uploaded_by}</p>
 *       </div>
 *       <div className="paper-files">
 *         <a href={paper.qp_file_url} target="_blank">
 *           View Question Paper
 *         </a>
 *         <a href={paper.scheme_file_url} target="_blank">
 *           View Scheme of Valuation
 *         </a>
 *       </div>
 *     </div>
 *   );
 * }
 *
 * @example
 * // CoE approval workflow
 * function CoEApprovalPage() {
 *   const { paper, isLoading } = useCPaper();
 *   const { approvePaper } = useApprovePaper();
 *   const navigate = useNavigate();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   const handleLockPaper = () => {
 *     approvePaper(
 *       {
 *         id: paper.id,
 *         status: 'Locked',
 *         locked_at: new Date().toISOString(),
 *         locked_by: 'CoE Admin'
 *       },
 *       {
 *         onSuccess: () => navigate('/coe/papers')
 *       }
 *     );
 *   };
 *
 *   return (
 *     <div>
 *       <PaperPreview paper={paper} />
 *       <button onClick={handleLockPaper}>Lock & Approve Paper</button>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Error handling with custom message
 * function CoEPaperPage() {
 *   const { isLoading, error, paper } = useCPaper();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   if (error) {
 *     return (
 *       <ErrorPage>
 *         <h2>Unable to Load Paper</h2>
 *         <p>{error.message}</p>
 *         <Link to="/coe/papers">Back to Papers List</Link>
 *       </ErrorPage>
 *     );
 *   }
 *
 *   return <PaperDetailView paper={paper} />;
 * }
 */
export function useCPaper() {
  // Extract paper ID from current route URL (e.g. /papers/:id)
  const { id } = useParams();

  // Fetch the paper using React Query, keyed by its ID for cache management
  const {
    isLoading, // True while loading data from API/server
    data: paper, // The actual paper object (or undefined if not loaded)
    error, // Any fetch/network/server error
  } = useQuery({
    queryKey: ["exam_papers", id], // Unique cache key per paper
    queryFn: () => getPaper(id), // Fetch function using API util
    retry: false, // No retries, fail early on missing/deleted records
  });

  // Return all relevant states/data for the component
  return { isLoading, error, paper };
}
