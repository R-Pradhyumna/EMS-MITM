import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPaper } from "../../services/apiBoE";

/**
 * useBPaper
 * ----------
 * Custom hook for fetching a single BoE (Board of Examiners) paper record by its ID.
 * - Reads paper ID from URL params using react-router
 * - Fetches the specific paper object (and handles loading/error) via React Query
 * - Disables retry on error (since not-found/404 should not aggressively retry)
 *
 * Returns: { isLoading, error, paper }
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
