import { useState, useEffect } from "react";

import Table from "../../ui/Table";
import Noexam from "./../../ui/Noexam";
import Spinner from "../../ui/Spinner";
import Pagination from "../../ui/Pagination";
import PrincipalRow from "./PrincipalRow";

import { PAPER_SLOTS } from "../../utils/constants";
import { useDownloadPaper } from "./useDownloadPaper";
import { usePPapers } from "./usePPapers";

/**
 * PrincipalTable
 * --------------
 * Displays a paginated table of subject-paper download "slots" for the Principal view,
 * with lockout-by-session for already-downloaded subjects and per-row download loading UI.
 */
function PrincipalTable() {
  // Fetch processed/grouped subject-paper rows and page count from custom query hook
  // - rows: array of grouped subjects, each with an array of paper objects
  // - isLoading: boolean flag for server fetch in progress
  // - count: total number of subject rows for pagination UI
  const { isLoading, papers: rows, count } = usePPapers();

  // Set of subject_codes already 'locked' this session (downloaded/locked)
  // (used to disable download buttons on these rows)
  const [downloadedSubjectCodes, setDownloadedSubjectCodes] = useState(
    new Set()
  );

  // State: index of the row that's currently "downloading" (for spinner-per-row UI)
  const [currentDownloading, setCurrentDownloading] = useState(null);

  // Download mutation: for recording download, locking that subject, & opening the QP file in new tab
  // - mutate: function to call for triggering (handleDownload will use this)
  // - isDownloading: true if API action is in progress
  const { mutate: downloadPaperMutate, isLoading: isDownloading } =
    useDownloadPaper({
      onSuccess: ({ qp_file_url, subject_code }) => {
        // Lock this subject_code in state and sessionStorage as soon as a download is recorded
        setDownloadedSubjectCodes((prev) => {
          const next = new Set(prev);
          next.add(subject_code);
          return next;
        });
        sessionStorage.setItem("downloaded_" + subject_code, "1");
        window.open(qp_file_url, "_blank");
      },
      onError: (error, variables) => {
        // If backend says "already downloaded", immediately lock as well (defensive)
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

  // On mount or when `rows` changes, restore download locks from sessionStorage
  // (this keeps the UI consistent even after reloads within a session)
  useEffect(() => {
    if (!rows || rows.length === 0) return;

    const restored = new Set();
    rows.forEach((row) => {
      if (sessionStorage.getItem("downloaded_" + row.subject_code)) {
        restored.add(row.subject_code);
      }
    });

    // Only update state if changed, to avoid infinite effect loops
    const restoredStr = Array.from(restored).sort().join(",");
    const currentStr = Array.from(downloadedSubjectCodes).sort().join(",");
    if (restoredStr !== currentStr) {
      setDownloadedSubjectCodes(restored);
    }
    // eslint-disable-next-line
  }, [rows]);

  // Show a loading spinner while fetching subject-paper data
  if (isLoading) return <Spinner />;
  // Show "No exam papers" state if there are no subject-paper rows to display
  if (!rows.length) return <Noexam />;

  /**
   * Handler for user clicking a Download QP button
   * - rowIdx: index of the row in the table (used for UI busy display)
   * - paper: the specific paper object being downloaded (holds subject_id, exam_datetime, etc)
   */
  function handleDownload(paper, rowIdx) {
    setCurrentDownloading(rowIdx); // Set loading UI on this row
    downloadPaperMutate({
      principal_employee_id: "emp123", // TODO: Replace with dynamic user ID
      subject_id: paper.subject_id,
      exam_date: paper.exam_datetime,
      downloaded_paper_id: paper.id,
      subject_code: paper.subject_code,
      rowIdx, // For UI state only; not used on backend
      qp_file_url: paper.qp_file_url, // Used to open the file after download
    });
  }

  // Main render: Table of subject-paper slots with per-row download state and lock icons
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
            key={idx} // Stable key; okay if row order never changes after initial rendering!
            row={row} // Row data with subject/group info
            rowIdx={idx}
            PAPER_SLOTS={PAPER_SLOTS}
            onDownload={handleDownload} // Function to trigger when a download slot is used
            downloaded={downloadedSubjectCodes.has(row.subject_code)} // Has the subject been downloaded (locked for this session)?
            isLoading={currentDownloading === idx && isDownloading} // Loading only for the current row being fetched
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
