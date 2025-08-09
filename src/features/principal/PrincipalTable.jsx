import { useState, useEffect } from "react";

import Pagination from "../../ui/Pagination";
import Spinner from "../../ui/Spinner";
import Table from "../../ui/Table";
import Noexam from "./../../ui/Noexam";
import PrincipalRow from "./PrincipalRow";

import { useDownloadPaper } from "./useDownloadPaper";
import { usePPapers } from "./usePPapers";
import { PAPER_SLOTS } from "../../utils/constants";

/**
 * PrincipalTable
 * --------------
 * Displays a table of subjects, each with a fixed number of paper slots.
 * - Tracks which subjects have already been downloaded THIS SESSION/TAB (using Set and sessionStorage).
 * - Locks out further downloads for a subject in this UI as soon as one is picked.
 * - Shows spinner UI per-row while download is in progress.
 * - Integrates pagination and handles empty/exam-not-started states.
 */
function PrincipalTable() {
  // Fetch processed/grouped subject-paper rows and page count from custom query hook
  // - rows: array of grouped subjects, each with an array of paper objects
  // - isLoading: loading flag for server fetch
  // - count: total subject rows (for pagination)
  const { isLoading, papers: rows, count } = usePPapers();

  // State: Set of subject_codes already 'locked' THIS SESSION (i.e., downloaded/locked)
  // Used to instantly disable download buttons for these subjects in the UI.
  const [downloadedSubjectCodes, setDownloadedSubjectCodes] = useState(
    new Set()
  );

  // State: row index of the row currently "downloading" (per-row spinner)
  const [currentDownloading, setCurrentDownloading] = useState(null);

  // Download paper mutation:
  // - When download is successful, adds subject_code to Set and sessionStorage.
  // - Also opens downloaded file in new tab (qp_file_url)
  // - On backend error: also "defensively" locks the subject if download fails for duplicate
  const { mutate: downloadPaperMutate, isLoading: isDownloading } =
    useDownloadPaper({
      onSuccess: ({ qp_file_url, subject_code }) => {
        // After a successful download, lock this subject code in memory state and session storage
        setDownloadedSubjectCodes((prev) => {
          const next = new Set(prev);
          next.add(subject_code);
          return next;
        });
        sessionStorage.setItem("downloaded_" + subject_code, "1");
        window.open(qp_file_url, "_blank"); // Show downloaded paper in a new tab
      },
      onError: (error, variables) => {
        // Defensive: If backend says already downloaded, still lock out subject immediately in UI
        if (
          error.message &&
          error.message.includes("already downloaded") &&
          variables.subject_code
        ) {
          setDownloadedSubjectCodes((prev) => {
            const next = new Set(prev);
            next.add(variables.subject_code);
            return next;
          });
          sessionStorage.setItem("downloaded_" + variables.subject_code, "1");
        }
      },
    });

  // On mount or whenever 'rows' change (e.g. after refetch), restore any locks from sessionStorage.
  // This way reloads and pagination don't lose session lock state for subjects already downloaded.
  useEffect(() => {
    if (!rows || rows.length === 0) return;

    const restored = new Set();
    rows.forEach((row) => {
      if (sessionStorage.getItem("downloaded_" + row.subject_code)) {
        restored.add(row.subject_code);
      }
    });

    // Only update state if there was a change (prevents infinite effect loops)
    const restoredStr = Array.from(restored).sort().join(",");
    const currentStr = Array.from(downloadedSubjectCodes).sort().join(",");
    if (restoredStr !== currentStr) {
      setDownloadedSubjectCodes(restored);
    }
    // eslint-disable-next-line
  }, [rows]);

  // Show a loading spinner while fetching subject-paper data from API/hook
  if (isLoading) return <Spinner />;

  // Show a "no exam papers found" state if there are no subject-paper rows to display
  if (!rows.length) return <Noexam />;

  /**
   * Handler for clicking a Download QP button in any row/slot:
   * - Tracks the active row being downloaded (for showing loading spinner only for that row)
   * - Triggers the download mutation, passing current paper and subject context
   */
  function handleDownload(paper, rowIdx) {
    setCurrentDownloading(rowIdx); // Show spinner for this row
    downloadPaperMutate({
      principal_employee_id: "emp123", // TODO: Replace with real principal/user ID
      subject_id: paper.subject_id, // Paper's subject DB ID
      exam_date: paper.exam_datetime, // Context for exam session/date
      downloaded_paper_id: paper.id, // Unique paper being downloaded
      subject_code: paper.subject_code, // For UI lockout
      rowIdx, // UI-only; not sent to backend
      qp_file_url: paper.qp_file_url, // File to open after success
    });
  }

  // Main render: Table of fixed PAPER_SLOTS columns (plus subject code), per-row spinner and per-subject-session lockout
  return (
    <Table columns={`1fr ${"1fr ".repeat(PAPER_SLOTS)}`.trim()}>
      <Table.Header>
        <div>Subject Code</div>
        {/* Render header columns for each paper slot */}
        {[...Array(PAPER_SLOTS)].map((_, idx) => (
          <div key={idx}>Paper-{idx + 1}</div>
        ))}
      </Table.Header>
      <Table.Body
        data={rows}
        render={(row, idx) => (
          <PrincipalRow
            key={idx} // Stable row key
            row={row} // Data for this subject and its papers
            rowIdx={idx}
            PAPER_SLOTS={PAPER_SLOTS}
            onDownload={handleDownload} // Download button callback
            // 'downloaded' is true if this subject's code is in the UI-locked set: disables ALL buttons for subject in current session/tab
            downloaded={downloadedSubjectCodes.has(row.subject_code)}
            // Only show spinner/loading for the row currently being downloaded
            isLoading={currentDownloading === idx && isDownloading}
          />
        )}
      />
      <Table.Footer>
        <Pagination count={count} />
      </Table.Footer>
    </Table>
  );
}

export default PrincipalTable;
