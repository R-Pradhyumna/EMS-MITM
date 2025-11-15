/**
 * Dashboard API Module
 *
 * Provides API functions for dashboard operations including:
 * - Retrieving downloaded Scheme of Valuation (SoV) papers
 * - Bulk uploading subjects data via CSV import
 * - Bulk uploading exam schedules via CSV import
 *
 * Uses PapaParse for CSV parsing and validation before database operations.
 *
 * @module apiDashboard
 */

import { PAGE_SIZE } from "../utils/constants";
import supabase from "./supabase";

/**
 * Retrieves paginated list of Scheme of Valuation papers that have been downloaded.
 *
 * Fetches papers marked as downloaded (is_downloaded = true) with relevant metadata
 * for dashboard display and tracking purposes. Only includes essential fields for
 * performance optimization.
 *
 * @async
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number for pagination (1-based)
 * @returns {Promise<Object>} Paginated SoV papers and total count
 * @returns {Array<Object>} returns.data - Array of paper objects
 * @returns {string} returns.data[].subject_code - Subject code
 * @returns {string} returns.data[].academic_year - Academic year
 * @returns {string} returns.data[].subject_name - Subject name
 * @returns {string} returns.data[].semester - Semester value
 * @returns {string} returns.data[].uploaded_by - Employee ID of uploader
 * @returns {string} returns.data[].scheme_file_url - URL to scheme file
 * @returns {number} returns.count - Total count of downloaded SoV papers
 * @throws {Error} If SoV papers cannot be loaded from database
 *
 * @example
 * const result = await getSchema({ page: 1 });
 * console.log(`Found ${result.count} downloaded SoV papers`);
 *
 * @example
 * // Display all downloaded papers
 * const result = await getSchema({});
 * result.data.forEach(paper => {
 *   console.log(`${paper.subject_code}: ${paper.scheme_file_url}`);
 * });
 */
export async function getSchema({ page }) {
  let query = supabase
    .from("exam_papers")
    .select(
      "subject_code, academic_year,subject_name,semester,uploaded_by,scheme_file_url",
      {
        count: "exact",
      }
    )
    .eq("is_downloaded", true);

  // Pagination: apply a range based on page number and PAGE_SIZE
  if (page) {
    const from = (page - 1) * PAGE_SIZE; // Index to start from
    const to = from + PAGE_SIZE - 1; // Index to end at
    query = query.range(from, to);
  }

  // Execute query, retrieving: data (rows), error object, count (total matching results)
  const { data, error, count } = await query;

  // Throw a user-friendly error on failure
  if (error) {
    throw new Error("SoV papers could not be loaded!");
  }

  // Return both page's rows and total count (for pagination UI)
  return { data, count };
}

/**
 * Retrieves dashboard statistics for overview cards (OPTIMIZED).
 *
 * Fetches all exam papers in a single query and computes statistics
 * on the client side. Much more efficient than multiple queries.
 *
 * @async
 * @returns {Promise<Object>} Dashboard statistics
 * @returns {number} returns.totalPapers - Total count of all exam papers
 * @returns {number} returns.pendingReview - Papers waiting for CoE/BoE review
 * @returns {number} returns.approved - Papers approved by BoE
 * @returns {number} returns.downloaded - Papers downloaded by Principal
 * @returns {number} returns.weeklyGrowth - Papers submitted in last 7 days
 * @throws {Error} If database query fails
 */
export async function getDashboardStats() {
  try {
    // Single query - fetch all papers with minimal fields
    const { data: papers, error } = await supabase
      .from("exam_papers")
      .select("status, is_downloaded, created_at");

    if (error) throw error;

    // Calculate date threshold for weekly growth
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Compute statistics on client side (single pass)
    const stats = papers.reduce(
      (acc, paper) => {
        // Total papers
        acc.totalPapers++;

        // Pending review (Submitted)
        if (paper.status === "Submitted") {
          acc.pendingReview++;
        }

        // Approved (BoE-approved)
        if (
          paper.status === "BoE-approved" ||
          paper.status === "CoE-approved"
        ) {
          acc.approved++;
        }

        // Downloaded
        if (paper.is_downloaded === true) {
          acc.downloaded++;
        }

        // Weekly growth (created in last 7 days)
        const paperDate = new Date(paper.created_at);
        if (paperDate >= sevenDaysAgo) {
          acc.weeklyGrowth++;
        }

        return acc;
      },
      {
        totalPapers: 0,
        pendingReview: 0,
        approved: 0,
        downloaded: 0,
        weeklyGrowth: 0,
      }
    );

    return stats;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to load dashboard statistics");
  }
}
