/**
 * Create Paper Mutation Hook
 *
 * Custom React Query mutation hook for creating new examination paper submissions
 * by faculty members. Handles file uploads (QP and Scheme), metadata storage,
 * cache invalidation, and user feedback notifications.
 *
 * @module useCreatePaper
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createEditPapers } from "../../services/apiFaculty";

/**
 * Creates a new exam paper submission with file uploads and metadata.
 *
 * Provides a mutation function for faculty to submit new examination papers.
 * Handles the complete submission workflow:
 * - Uploads Question Paper and Scheme of Valuation files to storage
 * - Creates database record with paper metadata
 * - Displays success/error toast notifications
 * - Invalidates exam_papers cache for immediate UI refresh
 *
 * Submission process:
 * 1. Validates and uploads QP file to Supabase storage
 * 2. Validates and uploads Scheme file to Supabase storage
 * 3. Creates database record with file URLs and metadata
 * 4. Sets initial status to "Submitted"
 * 5. Returns created paper object on success
 *
 * Error handling:
 * - File upload failures trigger automatic rollback
 * - Database errors result in uploaded file cleanup
 * - User-friendly error messages via toast notifications
 *
 * React Query features:
 * - Automatic cache invalidation for data consistency
 * - Loading state management
 * - Error handling with toast notifications
 * - Optimistic updates possible (not implemented by default)
 *
 * @returns {Object} Create paper mutation object
 * @returns {Function} returns.createPaper - Mutation function to trigger paper creation
 * @returns {boolean} returns.isCreating - True while creation request is in progress
 *
 * @example
 * // Basic usage in paper creation form
 * function CreatePaperForm() {
 *   const { createPaper, isCreating } = useCreatePaper();
 *   const { register, handleSubmit } = useForm();
 *
 *   const onSubmit = (data) => {
 *     createPaper({
 *       subject_code: data.subject_code,
 *       subject_name: data.subject_name,
 *       semester: data.semester,
 *       academic_year: data.academic_year,
 *       department_name: data.department_name,
 *       qp_file: data.qp_file,
 *       scheme_file: data.scheme_file,
 *       uploaded_by: currentUser.employee_id
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input {...register('subject_code')} required />
 *       <input {...register('subject_name')} required />
 *       <input {...register('semester')} required />
 *       <input {...register('academic_year')} type="number" required />
 *       <input {...register('qp_file')} type="file" accept=".docx" required />
 *       <input {...register('scheme_file')} type="file" accept=".docx" required />
 *       <button type="submit" disabled={isCreating}>
 *         {isCreating ? 'Creating...' : 'Submit Paper'}
 *       </button>
 *     </form>
 *   );
 * }
 *
 * @example
 * // With navigation after successful creation
 * function CreatePaperPage() {
 *   const navigate = useNavigate();
 *   const { createPaper, isCreating } = useCreatePaper();
 *
 *   const handleCreate = (paperData) => {
 *     createPaper(paperData, {
 *       onSuccess: () => {
 *         navigate('/faculty/papers');
 *       }
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <h1>Create New Paper</h1>
 *       <PaperForm onSubmit={handleCreate} isSubmitting={isCreating} />
 *     </div>
 *   );
 * }
 *
 * @example
 * // With form reset after creation
 * function CreatePaperModal({ onClose }) {
 *   const { createPaper, isCreating } = useCreatePaper();
 *   const [formData, setFormData] = useState(initialFormState);
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     createPaper(formData, {
 *       onSuccess: () => {
 *         setFormData(initialFormState);
 *         onClose();
 *       }
 *     });
 *   };
 *
 *   return (
 *     <Modal>
 *       <form onSubmit={handleSubmit}>
 *         <FormFields data={formData} onChange={setFormData} />
 *         <button type="submit" disabled={isCreating}>
 *           {isCreating && <Spinner />}
 *           Create Paper
 *         </button>
 *       </form>
 *     </Modal>
 *   );
 * }
 */
export function useCreatePaper() {
  // Get React Query's query client, for cache updates after mutation
  const queryClient = useQueryClient();

  // Set up the create-paper mutation hook
  const { mutate: createPaper, isLoading: isCreating } = useMutation({
    // This function will be called by mutate() with the user's payload
    mutationFn: createEditPapers,

    // After a successful creation:
    onSuccess: () => {
      toast.success("New paper successfully created!");
      // Refresh all cached paper lists (forces refetch, so users see the new paper)
      queryClient.invalidateQueries({ queryKey: ["exam_papers"] });
    },

    // On error (could be file upload, network, DB error, etc):
    onError: (err) => {
      toast.error(err.message); // Show error as toast to user
    },
  });

  // Expose the main function and loading state for the component/form to use
  return { isCreating, createPaper };
}
