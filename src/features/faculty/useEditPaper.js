/**
 * Edit Paper Mutation Hook
 *
 * Custom React Query mutation hook for editing existing examination paper submissions
 * by faculty members. Handles partial file updates (QP and/or Scheme), metadata changes,
 * cache invalidation, and user feedback notifications.
 *
 * @module useEditPaper
 */

import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEditPapers } from "../../services/apiFaculty";

/**
 * Edits an existing exam paper submission with optional file updates.
 *
 * Provides a mutation function for faculty to update their submitted papers.
 * Supports partial updates where only changed fields/files are uploaded:
 * - Update metadata only (no new files)
 * - Replace QP file only (keeps existing Scheme)
 * - Replace Scheme file only (keeps existing QP)
 * - Replace both files and update metadata
 *
 * Update process:
 * 1. Checks if new QP file provided, uploads if present (upserts existing)
 * 2. Checks if new Scheme file provided, uploads if present (upserts existing)
 * 3. Updates database record with new metadata and/or file URLs
 * 4. Preserves existing file URLs if no new files uploaded
 * 5. Returns updated paper object on success
 *
 * Error handling:
 * - File upload failures trigger automatic cleanup of newly uploaded files
 * - Database errors preserve existing data
 * - User-friendly error messages via toast notifications
 *
 * React Query features:
 * - Automatic cache invalidation for data consistency
 * - Loading state management
 * - Error handling with toast notifications
 * - Optimistic updates possible (not implemented by default)
 *
 * @returns {Object} Edit paper mutation object
 * @returns {Function} returns.editPaper - Mutation function to trigger paper edit
 * @returns {boolean} returns.isEditing - True while edit request is in progress
 *
 * @example
 * // Basic usage in edit form with all fields
 * function EditPaperForm({ paper }) {
 *   const { editPaper, isEditing } = useEditPaper();
 *   const { register, handleSubmit } = useForm({
 *     defaultValues: paper
 *   });
 *
 *   const onSubmit = (data) => {
 *     editPaper({
 *       newPaper: {
 *         subject_code: data.subject_code,
 *         subject_name: data.subject_name,
 *         semester: data.semester,
 *         academic_year: data.academic_year,
 *         department_name: data.department_name,
 *         qp_file: data.qp_file, // Only uploads if file selected
 *         scheme_file: data.scheme_file, // Only uploads if file selected
 *         qp_file_url: paper.qp_file_url, // Preserve existing URL
 *         scheme_file_url: paper.scheme_file_url, // Preserve existing URL
 *         uploaded_by: paper.uploaded_by
 *       },
 *       id: paper.id
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input {...register('subject_code')} required />
 *       <input {...register('subject_name')} required />
 *       <input {...register('semester')} required />
 *       <input {...register('academic_year')} type="number" required />
 *       <div>
 *         <label>Replace QP (optional)</label>
 *         <input {...register('qp_file')} type="file" accept=".docx" />
 *       </div>
 *       <div>
 *         <label>Replace Scheme (optional)</label>
 *         <input {...register('scheme_file')} type="file" accept=".docx" />
 *       </div>
 *       <button type="submit" disabled={isEditing}>
 *         {isEditing ? 'Saving...' : 'Update Paper'}
 *       </button>
 *     </form>
 *   );
 * }
 *
 * @example
 * // Update metadata only (no file changes)
 * function QuickEditModal({ paper, onClose }) {
 *   const { editPaper, isEditing } = useEditPaper();
 *
 *   const handleQuickUpdate = (newData) => {
 *     editPaper(
 *       {
 *         newPaper: {
 *           ...paper,
 *           subject_name: newData.subject_name,
 *           semester: newData.semester
 *         },
 *         id: paper.id
 *       },
 *       {
 *         onSuccess: () => onClose()
 *       }
 *     );
 *   };
 *
 *   return (
 *     <Modal>
 *       <QuickEditForm
 *         initialData={paper}
 *         onSubmit={handleQuickUpdate}
 *         isSubmitting={isEditing}
 *       />
 *     </Modal>
 *   );
 * }
 *
 * @example
 * // Replace only QP file, keep existing scheme
 * function ReplaceQPForm({ paper }) {
 *   const { editPaper, isEditing } = useEditPaper();
 *   const [qpFile, setQpFile] = useState(null);
 *
 *   const handleReplaceQP = () => {
 *     if (!qpFile) {
 *       toast.error('Please select a QP file');
 *       return;
 *     }
 *
 *     editPaper({
 *       newPaper: {
 *         ...paper,
 *         qp_file: [qpFile], // New QP file
 *         // scheme_file not provided, so existing scheme is preserved
 *       },
 *       id: paper.id
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <h3>Replace Question Paper</h3>
 *       <input
 *         type="file"
 *         accept=".docx"
 *         onChange={(e) => setQpFile(e.target.files[0])}
 *       />
 *       <button onClick={handleReplaceQP} disabled={isEditing || !qpFile}>
 *         {isEditing ? 'Uploading...' : 'Replace QP'}
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useEditPaper() {
  // Access the React Query cache client for refetching paper data after update
  const queryClient = useQueryClient();

  // Set up the mutation for editing a paper
  const { mutate: editPaper, isLoading: isEditing } = useMutation({
    // mutationFn: takes a destructured object { newPaper, id }
    // Calls your API utility to handle the edit (with the specific paper ID)
    mutationFn: ({ newPaper, id }) => createEditPapers(newPaper, id),

    // On successful edit:
    onSuccess: () => {
      toast.success("Paper successfully edited!");
      // Invalidate (refetch) all paper queries so components rerender with new data
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
      // NOTE: `reset()` here should be handled inside your form, not here!
      // reset();
    },

    // On error (file fails to upload, network/database error, etc):
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Expose editing state and the function to trigger the edit mutation
  return { isEditing, editPaper };
}
