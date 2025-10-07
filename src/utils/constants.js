/**
 * Application Constants
 *
 * Global configuration constants used throughout the ExamSuite application.
 * These values control pagination, UI layout, and data structure constraints.
 *
 * @module constants
 */

/**
 * Number of items displayed per page in all paginated lists.
 *
 * Used by:
 * - Faculty papers list
 * - BoE papers review list
 * - CoE institution-wide papers list
 * - Principal daily download table
 * - Dashboard SoV papers list
 * - User management lists (CoE, BoE, Faculty)
 *
 * Controls the range() parameter in Supabase queries and pagination UI.
 *
 * @constant {number}
 * @default 12
 *
 * @example
 * // In API pagination
 * const from = (page - 1) * PAGE_SIZE;
 * const to = from + PAGE_SIZE - 1;
 * query.range(from, to);
 *
 * @example
 * // In pagination component
 * const pageCount = Math.ceil(totalCount / PAGE_SIZE);
 */
export const PAGE_SIZE = 12;

/**
 * Maximum number of paper slots available per subject.
 *
 * Defines the fixed-length array size for grouped papers in Principal's download table.
 * Each subject can have up to 5 different paper variations/slots scheduled for the same
 * exam date. Empty slots are represented as null for consistent UI rendering.
 *
 * Used by:
 * - groupPapersBySubject utility function
 * - Principal papers table column structure
 * - Paper slot assignment logic
 *
 * This constraint ensures:
 * - Consistent table layout (5 columns for slots)
 * - Predictable array iteration in UI
 * - Fixed storage structure in database
 *
 * @constant {number}
 * @default 5
 *
 * @example
 * // In groupPapersBySubject
 * const slots = new Array(PAPER_SLOTS).fill(null);
 * papers.forEach((paper, index) => {
 *   if (index < PAPER_SLOTS) slots[index] = paper;
 * });
 *
 * @example
 * // In Principal table rendering
 * <tr>
 *   <td>{subjectName}</td>
 *   {Array.from({ length: PAPER_SLOTS }).map((_, idx) => (
 *     <td key={idx}>{papers[idx] || 'Empty'}</td>
 *   ))}
 * </tr>
 */
export const PAPER_SLOTS = 5;
