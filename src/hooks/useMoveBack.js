/**
 * Navigation Back Hook
 *
 * Custom React hook that provides a reusable function to navigate back
 * to the previous page in browser history using React Router.
 *
 * @module useMoveBack
 */

import { useNavigate } from "react-router-dom";

/**
 * Returns a function that navigates back to the previous page in browser history.
 *
 * Provides a convenient wrapper around React Router's navigate(-1) for
 * implementing "Back" or "Cancel" buttons throughout the application.
 * Uses browser's history stack to determine the previous route.
 *
 * Behavior:
 * - Navigates to previous entry in browser history
 * - Works like the browser's back button
 * - If no previous history exists (e.g., direct link), may navigate outside the app
 *
 * Common use cases:
 * - Cancel buttons in forms
 * - Back navigation in detail views
 * - Close/dismiss actions in modal-like pages
 *
 * @returns {Function} Navigation function that moves back one step in history when called
 *
 * @example
 * // In a form with Cancel button
 * function CreatePaperForm() {
 *   const moveBack = useMoveBack();
 *
 *   return (
 *     <form>
 *       <input name="subject" />
 *       <button type="submit">Submit</button>
 *       <button type="button" onClick={moveBack}>
 *         Cancel
 *       </button>
 *     </form>
 *   );
 * }
 *
 * @example
 * // In a detail page header
 * function PaperDetailPage() {
 *   const moveBack = useMoveBack();
 *
 *   return (
 *     <div>
 *       <header>
 *         <button onClick={moveBack}>← Back</button>
 *         <h1>Paper Details</h1>
 *       </header>
 *       <main>Content here</main>
 *     </div>
 *   );
 * }
 */
export function useMoveBack() {
  const navigate = useNavigate();
  return () => navigate(-1);
}
