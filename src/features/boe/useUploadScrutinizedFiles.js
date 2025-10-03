/**
 * Upload Scrutinized Files Mutation Hook
 *
 * Custom React Query mutation hook for uploading corrected (scrutinized)
 * Question Paper and Scheme of Valuation files by Board of Examiners.
 * Handles file upload, cache invalidation, and user feedback notifications.
 *
 * @module useUploadScrutinizedFiles
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { uploadScrutinizedFiles } from "../../services/apiBoE";

/**
 * Uploads scrutinized (corrected) QP and Scheme files after BoE review.
 *
 * Provides a mutation function for uploading corrected examination files
 * after Board of Examiners scrutiny. On successful upload:
 * - Uploads both QP and Scheme files to Supabase storage
 * - Displays success toast notification
 * - Invalidates exam_papers cache for immediate UI refresh
 * - Executes optional callback for parent component logic
 *
 * On upload failure:
 * - Displays error toast with specific error message
 * - Maintains current UI state
 * - Allows user to retry upload
 *
 * File upload behavior:
 * - Atomic operation (both files or none)
 * - Automatic rollback on failure (see apiBoE.js)
 * - Overwrites existing files with upsert
 *
 * React Query features:
 * - Automatic cache invalidation for data consistency
 * - Loading state management
 * - Error handling with toast notifications
 * - Optional success callback for custom post-upload logic
 *
 * @param {Object} options - Configuration options
 * @param {Function} [options.onSuccess] - Optional callback executed after successful upload
 * @returns {Object} Upload mutation object
 * @returns {Function} returns.mutate - Mutation function to trigger upload
 * @returns {boolean} returns.isLoading - True while upload is in progress
 *
 * @example
 * // Basic usage with file upload form
 * function ScrutinizedFilesUploadForm({ paper }) {
 *   const { mutate: uploadFiles, isLoading } = useUploadScrutinizedFiles();
 *   const [qpFile, setQpFile] = useState(null);
 *   const [schemaFile, setSchemaFile] = useState(null);
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     uploadFiles({ paper, qpFile, schemaFile });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         type="file"
 *         onChange={(e) => setQpFile(e.target.files[0])}
 *         accept=".docx"
 *       />
 *       <input
 *         type="file"
 *         onChange={(e) => setSchemaFile(e.target.files[0])}
 *         accept=".docx"
 *       />
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? 'Uploading...' : 'Upload Scrutinized Files'}
 *       </button>
 *     </form>
 *   );
 * }
 *
 * @example
 * // With custom success callback to reset form
 * function ScrutinizedFilesUploadModal({ paper, onClose }) {
 *   const { mutate: uploadFiles, isLoading } = useUploadScrutinizedFiles({
 *     onSuccess: () => {
 *       onClose(); // Close modal after successful upload
 *     }
 *   });
 *
 *   const handleUpload = (qpFile, schemaFile) => {
 *     uploadFiles({ paper, qpFile, schemaFile });
 *   };
 *
 *   return (
 *     <Modal>
 *       <h2>Upload Corrected Files</h2>
 *       <FileUploadForm onSubmit={handleUpload} isLoading={isLoading} />
 *     </Modal>
 *   );
 * }
 *
 * @example
 * // With callback to navigate after upload
 * function BoEScrutinyPage() {
 *   const navigate = useNavigate();
 *   const { mutate: uploadFiles, isLoading } = useUploadScrutinizedFiles({
 *     onSuccess: (data) => {
 *       console.log('Files uploaded:', data);
 *       navigate('/boe/papers'); // Navigate back to papers list
 *     }
 *   });
 *
 *   return <UploadForm uploadFiles={uploadFiles} isLoading={isLoading} />;
 * }
 */
export function useUploadScrutinizedFiles({ onSuccess: onSuccessProp } = {}) {
  // Gives us the React Query cache client (for cache invalidation after mutation)
  const queryClient = useQueryClient();

  // Setup the mutation hook for scrutinized file uploads
  const mutation = useMutation({
    // mutationFn receives the payload: { paper, qpFile, schemaFile }
    mutationFn: ({ paper, qpFile, schemaFile }) =>
      uploadScrutinizedFiles(paper, qpFile, schemaFile),

    // Called on successful upload
    onSuccess: (data, variables, context) => {
      toast.success("Scrutinized files uploaded successfully!");
      // Invalidate the exam_papers list/query so table/grid refreshes immediately
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
      // Call any provided parent onSuccess callback with API response, etc.
      if (onSuccessProp) onSuccessProp(data, variables, context);
    },

    // Called on upload/API error
    onError: (error) => {
      toast.error(error.message || "Failed to upload scrutinized files.");
    },
  });

  // Only return what the parent needs: mutate (to trigger), and loading state for UI
  return {
    mutate: mutation.mutate, // To call: mutate({ paper, qpFile, schemaFile })
    isLoading: mutation.isLoading, // Boolean: true while request is pending
  };
}
