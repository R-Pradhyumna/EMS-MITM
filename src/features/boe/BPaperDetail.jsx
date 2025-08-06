import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import BPaperDataBox from "./BPaperDataBox";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import ButtonGroup from "../../ui/ButtonGroup";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";

import { useMoveBack } from "../../hooks/useMoveBack";
import { useBPaper } from "./useBPaper";
import Spinner from "../../ui/Spinner";

/* Group for the heading and status badge, aligned horizontally */
const HeadingGroup = styled.div`
  display: flex;
  gap: 2.4rem;
  align-items: center;
`;

/* Status badge, color-coded by status */
const Status = styled.span`
  font-family: "Sono";
  font-weight: 500;
  padding: 0.4rem 1.2rem;
  border-radius: var(--border-radius-sm);
  text-align: center;
  width: fit-content;
  margin-left: 2rem;

  background-color: ${({ status }) =>
    status === "Submitted"
      ? "var(--color-green-100)"
      : status === "CoE-approved"
      ? "var(--color-yellow-100)"
      : status === "BoE-approved"
      ? "var(--color-indigo-100)"
      : status === "Locked"
      ? "var(--color-grey-300)"
      : status === "Downloaded"
      ? "var(--color-blue-100)"
      : "var(--color-grey-100)"};

  color: ${({ status }) =>
    status === "Submitted"
      ? "var(--color-green-700)"
      : status === "CoE-approved"
      ? "var(--color-yellow-700)"
      : status === "BoE-approved"
      ? "var(--color-indigo-700)"
      : status === "Locked"
      ? "var(--color-grey-800)"
      : status === "Downloaded"
      ? "var(--color-blue-700)"
      : "var(--color-grey-700)"};
`;

/**
 * BPaperDetail
 * -------------
 * Displays the detail view for a single paper in the BoE workflow.
 * - Loads a paper using useBPaper() (by route param)
 * - Shows a spinner while loading, or fallback if not found
 * - Shows the main details in a BPaperDataBox
 * - Renders header, status badge, and navigation/approve actions
 */
function BPaperDetail() {
  // Data loader for a single paper (looks up by URL param)
  const { paper, isLoading } = useBPaper();

  // Custom hook for going back (one level in history/router)
  const moveBack = useMoveBack();

  // React Router's main navigation function (for programmatic redirects)
  const navigate = useNavigate();

  // If loading, display a spinner
  if (isLoading) return <Spinner />;

  // If "paper" is not found (could be a 404), show fallback UI
  if (!paper) return <div>No paper data</div>;

  // Pull out status and id for use in buttons, headings, actions
  const { status, id: paperId } = paper;

  // Main render: header row, info card, and action buttons
  return (
    <>
      {/* --- Header Row: Title, Status badge, Back button --- */}
      <Row type="horizontal">
        <HeadingGroup>
          <Heading as="h1">Paper {paperId}</Heading>
          <Status status={status}>
            {/* Render status string, convert "-" to space for display */}
            {status?.replace("-", " ") ?? "Unknown"}
          </Status>
        </HeadingGroup>
        {/* Back text link (← Back), invokes moveBack handler */}
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      {/* --- Main Paper Data / Info Card --- */}
      <BPaperDataBox paper={paper} />

      {/* --- Footer: context actions for BoE workflow --- */}
      <ButtonGroup>
        {/* If paper is ready for BoE approval, show Approve button */}
        {status === "CoE-approved" && (
          <Button onClick={() => navigate(`/approve/${paperId}`)}>
            Approve
          </Button>
        )}

        {/* Always show a secondary Back button for safe navigation */}
        <Button variation="secondary" onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  );
}

export default BPaperDetail;
