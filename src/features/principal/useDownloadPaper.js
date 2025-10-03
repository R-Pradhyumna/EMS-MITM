/**
 * Download Paper Mutation Hook (Principal)
 *
 * Custom React Query mutation hook for Principal's paper download workflow
 * with one-per-day lockout mechanism. Records download events and prevents
 * duplicate downloads of the same paper on the same day.
 *
 * @module useDownloadPaper
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { downloadPaper } from "../../services/apiPrincipal";

/**
 * Records paper download and enforces one-per-day lockout for Principal.
 *
 * Provides a mutation function for Principal to download examination papers
 * with built-in download tracking and lockout mechanism. The system ensures
 * that each paper can only be downloaded once per day per Principal to maintain
 * security and audit trail.
 *
 * Download workflow:
 * 1. Receives paper ID to download
 * 2. Calls backend API to record download event
 * 3. Updates paper status to "Downloaded" in database
 * 4. Sets is_downloaded flag and downloaded_at timestamp
 * 5. Returns updated paper data
 *
 * Lockout mechanism:
 * - Records download in principal_paper_downloads table (assumed)
 * - Prevents duplicate downloads via is_downloaded flag
 * - Downloaded papers appear disabled in UI but remain visible
 * - Ensures accountability and audit trail
 *
 * Cache management:
 * - Invalidates exam_papers queries for immediate UI refresh
 * - Updated papers automatically show as downloaded
 * - Other Principals see real-time download status
 *
 * Callback support:
 * - onSuccess: Custom logic after successful download (UI updates, logging)
 * - onError: Custom error handling (fallback UI, local state updates)
 * - Both callbacks receive full context from mutation
 *
 * React Query features:
 * - Automatic cache invalidation
 * - Loading state management
 * - Error handling with toast notifications
 * - Parent-level callback integration
 *
 * @param {Object} [options] - Configuration options
 * @param {Function} [options.onSuccess] - Callback executed after successful download
 * @param {Function} [options.onError] - Callback executed on download failure
 * @returns {Object} Download mutation object
 * @returns {Function} returns.mutate - Mutation function to trigger download
 * @returns {boolean} returns.isLoading - True while download is in progress
 *
 * @example
 * // Basic usage in Principal download button
 * function DownloadButton({ paper }) {
 *   const { mutate: download, isLoading } = useDownloadPaper();
 *
 *   const handleDownload = () => {
 *     download({ downloaded_paper_id: paper.id });
 *     // Optionally trigger actual file download
 *     window.open(paper.qp_file_url, '_blank');
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleDownload}
 *       disabled={isLoading || paper.is_downloaded}
 *     >
 *       {isLoading ? 'Recording...' : 'Download'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // With success callback for local state management
 * function PrincipalPapersTable() {
 *   const [downloadedIds, setDownloadedIds] = useState(new Set());
 *
 *   const { mutate: download, isLoading } = useDownloadPaper({
 *     onSuccess: (data) => {
 *       // Update local state for immediate UI feedback
 *       setDownloadedIds(prev => new Set(prev).add(data.downloaded_paper_id));
 *       console.log('Download recorded:', data);
 *     }
 *   });
 *
 *   return (
 *     <table>
 *       {papers.map(paper => (
 *         <tr key={paper.id}>
 *           <td>{paper.subject_name}</td>
 *           <td>
 *             <button
 *               onClick={() => download({ downloaded_paper_id: paper.id })}
 *               disabled={downloadedIds.has(paper.id)}
 *             >
 *               Download
 *             </button>
 *           </td>
 *         </tr>
 *       ))}
 *     </table>
 *   );
 * }
 *
 * @example
 * // With error handling and retry logic
 * function DownloadWithRetry({ paper }) {
 *   const [retryCount, setRetryCount] = useState(0);
 *
 *   const { mutate: download, isLoading } = useDownloadPaper({
 *     onSuccess: () => {
 *       setRetryCount(0);
 *       // Trigger actual file download
 *       window.open(paper.qp_file_url, '_blank');
 *     },
 *     onError: (error) => {
 *       if (retryCount < 3) {
 *         toast.error(`Download failed. Retrying... (${retryCount + 1}/3)`);
 *         setRetryCount(prev => prev + 1);
 *         // Retry after delay
 *         setTimeout(() => {
 *           download({ downloaded_paper_id: paper.id });
 *         }, 2000);
 *       } else {
 *         toast.error('Download failed after 3 attempts. Please contact support.');
 *       }
 *     }
 *   });
 *
 *   return (
 *     <button onClick={() => download({ downloaded_paper_id: paper.id })}>
 *       {isLoading ? `Downloading... ${retryCount > 0 ? `(Retry ${retryCount})` : ''}` : 'Download'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // With download tracking and analytics
 * function DownloadWithAnalytics({ paper, principalId }) {
 *   const { mutate: download, isLoading } = useDownloadPaper({
 *     onSuccess: (data, context) => {
 *       // Log download event for analytics
 *       analytics.track('paper_downloaded', {
 *         paper_id: paper.id,
 *         subject_code: paper.subject_code,
 *         principal_id: principalId,
 *         timestamp: new Date().toISOString()
 *       });
 *
 *       // Trigger file download
 *       const link = document.createElement('a');
 *       link.href = paper.qp_file_url;
 *       link.download = `${paper.subject_code}_QP.docx`;
 *       link.click();
 *     }
 *   });
 *
 *   return (
 *     <button onClick={() => download({ downloaded_paper_id: paper.id })}>
 *       Download QP
 *     </button>
 *   );
 * }
 */
export function useDownloadPaper({ onSuccess, onError } = {}) {
  // Hook to get React Query's cache control
  const queryClient = useQueryClient();

  // Setup mutation hook for downloading a paper
  // - mutationFn: backend API call to record the download and lock this paper
  // - onSuccess: called after backend response, shows toast, invalidates cache, triggers parent success callback
  // - onError: handles API error, shows toast, triggers parent error callback
  const mutation = useMutation({
    // Calls the backend API/service
    mutationFn: ({ downloaded_paper_id }) => downloadPaper(downloaded_paper_id),

    onSuccess: (data, variables, context) => {
      // Show success toast to user
      toast.success("Download recorded successfully!");
      // Invalidate the 'exam_papers' query so the UI fetches new status/data
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
      // If parent provides extra onSuccess logic (UI integration, session lockout etc), run it
      if (onSuccess) onSuccess({ ...variables, ...data }, context);
    },

    onError: (error, variables, context) => {
      // Show error to user if download or lockout fails
      toast.error(error.message || "Could not record or mark download.");
      // If parent provides extra onError logic, run it (e.g., local UI/session lockout even on failure)
      if (onError) onError(error, variables, context);
    },
  });

  // Return mutate function for triggering download and loading state for UI
  return {
    mutate: mutation.mutate,
    isLoading: mutation.isLoading,
  };
}
