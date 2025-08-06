import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPaper } from "../../services/apiCoE";

/**
 * useCPaper
 * -----------
 * Custom React hook for fetching a single paper by its ID from the route.
 * - Reads paper ID from react-router URL params
 * - Fetches paper data (and handles loading/error) via React Query
 * - Disables retry on error (since 404/not found shouldn't retry)
 *
 * Returns: { isLoading, error, paper }
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
