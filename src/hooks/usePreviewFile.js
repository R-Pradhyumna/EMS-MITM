/**
 * Preview File Hook
 *
 * Custom hook for generating signed URLs and opening Office Online Viewer
 * for previewing DOCX/DOC examination papers without downloading. Provides
 * a simple interface for components to trigger file previews with proper
 * error handling and user feedback.
 *
 * Security: Respects existing RLS policies - only authenticated BoE members
 * with proper permissions can generate preview URLs for their department's papers.
 *
 * @module usePreviewFile
 */

import { useState } from "react";
import toast from "react-hot-toast";
import { getFilePreviewUrl } from "../services/apiBoE";

/**
 * Provides file preview functionality with Office Online Viewer.
 *
 * Returns a handler function that generates a temporary signed URL (valid 30 minutes),
 * constructs the Office Online Viewer URL, and opens it in a new tab.
 * Handles loading states and error notifications automatically via toast.
 *
 * URL Generation Process:
 * 1. Calls Supabase Storage API to generate signed URL (respects RLS)
 * 2. Constructs Microsoft Office Online Viewer embed URL
 * 3. Opens preview in new browser tab
 * 4. Shows error toast if generation fails
 *
 * Preview behavior:
 * - Opens documents in read-only mode via Microsoft Office Online
 * - Signed URLs expire after 30 minutes for security
 * - No file downloads or modifications possible
 * - Works with .doc and .docx formats
 *
 * Error handling:
 * - Displays user-friendly toast error messages
 * - Logs detailed errors to console for debugging
 * - Suggests downloading as fallback option
 * - Maintains UI state on failure
 *
 * @returns {Object} Preview state and handler function
 * @returns {Function} returns.previewFile - Function to trigger file preview in new tab
 * @returns {boolean} returns.isGeneratingUrl - Loading state during URL generation
 *
 * @example
 * // Basic usage in component
 * function BPaperDetail() {
 *   const { paper } = useBPaper();
 *   const { previewFile, isGeneratingUrl } = usePreviewFile();
 *
 *   return (
 *     <Button
 *       onClick={() => previewFile(paper.qp_file_url)}
 *       disabled={isGeneratingUrl}
 *     >
 *       Preview Question Paper
 *     </Button>
 *   );
 * }
 *
 * @example
 * // With custom loading indicator
 * function FilePreviewButton({ fileUrl, fileName }) {
 *   const { previewFile, isGeneratingUrl } = usePreviewFile();
 *
 *   return (
 *     <Button onClick={() => previewFile(fileUrl)}>
 *       {isGeneratingUrl ? 'Generating preview...' : `Preview ${fileName}`}
 *     </Button>
 *   );
 * }
 *
 * @example
 * // Multiple file previews
 * function PaperPreviewControls({ paper }) {
 *   const { previewFile, isGeneratingUrl } = usePreviewFile();
 *
 *   return (
 *     <>
 *       <Button
 *         onClick={() => previewFile(paper.qp_file_url)}
 *         disabled={isGeneratingUrl}
 *       >
 *         Preview QP
 *       </Button>
 *       <Button
 *         onClick={() => previewFile(paper.scheme_file_url)}
 *         disabled={isGeneratingUrl}
 *       >
 *         Preview Scheme
 *       </Button>
 *     </>
 *   );
 * }
 */
export function usePreviewFile() {
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

  const previewFile = async (filePath) => {
    try {
      setIsGeneratingUrl(true);

      // Generate temporary signed URL (30 min expiry, respects RLS)
      const signedUrl = await getFilePreviewUrl(filePath);

      // Construct Office Online Viewer URL
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        signedUrl
      )}`;

      // Open in new tab
      window.open(viewerUrl, "_blank");
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to preview file. Please try downloading instead.");
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  return { previewFile, isGeneratingUrl };
}
