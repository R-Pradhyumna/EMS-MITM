/**
 * BoE Single Paper Query Hook
 *
 * Custom React Query hook for fetching a single examination paper by ID
 * in the Board of Examiners (BoE) workflow. Extracts paper ID from URL
 * parameters and retrieves detailed paper information for review and approval.
 *
 * @module useBPaper
 */

import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPaper } from "../../services/apiBoE";

/**
 * Fetches a single BoE paper record by ID from URL parameters.
 *
 * Retrieves detailed examination paper information for Board of Examiners
 * review, scrutiny, and approval workflows. The paper ID is automatically
 * extracted from the route parameter.
 *
 * Route structure:
 * - Expected route pattern: /papers/:id or /boe/papers/:id
 * - Automatically reads :id parameter from current URL
 *
 * React Query configuration:
 * - Unique cache key per paper ID (["exam_papers", id])
 * - No retry on error for fast-fail behavior (404 should not retry)
 * - Cached data prevents redundant API calls for same paper
 *
 * Use cases:
 * - Paper detail view for BoE review
 * - Scrutiny workflow with file preview
 * - Approval/rejection decision interface
 * - Paper metadata display
 *
 * @returns {Object} Paper query result object
 * @returns {boolean} returns.isLoading - True while paper data is being fetched
 * @returns {Error|null} returns.error - Error object if fetch fails (404, network error, etc.)
 * @returns {Object|undefined} returns.paper - Exam paper object with all fields, undefined if not yet loaded
 *
 * @example
 * // Paper detail page for BoE review
 * function BoEPaperDetail() {
 *   const { isLoading, error, paper } = useBPaper();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage>Paper not found: {error.message}</ErrorMessage>;
 *
 *   return (
 *     <div>
 *       <h1>{paper.subject_name}</h1>
 *       <p>Subject Code: {paper.subject_code}</p>
 *       <p>Status: {paper.status}</p>
 *       <a href={paper.qp_file_url} target="_blank">View Question Paper</a>
 *       <a href={paper.scheme_file_url} target="_blank">View Scheme</a>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Scrutiny and approval form
 * function BoEApprovalForm() {
 *   const { paper, isLoading } = useBPaper();
 *   const { approvePaper } = useApprovePaper();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   const handleApprove = () => {
 *     approvePaper({
 *       id: paper.id,
 *       status: 'Locked',
 *       approved_at: new Date().toISOString()
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <PaperPreview paper={paper} />
 *       <button onClick={handleApprove}>Approve & Lock Paper</button>
 *     </div>
 *   );
 * }
 */
export function useBPaper() {
  // Extract the :id param from the route (e.g., /papers/:id)
  const { id } = useParams();

  // React Query:
  //   - Uses unique cache key per paper ID
  //   - Calls getPaper(id) from your BoE API utilities
  //   - No retry on error (for user-friendly/fail-fast experience)
  const {
    isLoading, // true while loading
    data: paper, // the fetched paper object (or undefined)
    error, // error object, if any (network/404/server)
  } = useQuery({
    queryKey: ["exam_papers", id],
    queryFn: () => getPaper(id),
    retry: false,
  });

  // Make all state/data available for the calling component
  return { isLoading, error, paper };
}
