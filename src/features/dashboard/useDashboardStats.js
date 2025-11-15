import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../../services/apiDashboard";

/**
 * Custom hook to fetch dashboard statistics
 *
 * Fetches counts for:
 * - Total papers (all)
 * - Pending review (Submitted + CoE-approved)
 * - Approved (BoE-approved)
 * - Downloaded (is_downloaded = true)
 * - Weekly growth (papers submitted in last 7 days)
 */
export function useDashboardStats() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  return {
    stats: stats || {
      totalPapers: 0,
      pendingReview: 0,
      approved: 0,
      downloaded: 0,
      weeklyGrowth: 0,
    },
    isLoading,
    error,
  };
}
