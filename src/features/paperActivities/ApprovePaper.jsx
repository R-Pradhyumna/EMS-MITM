import { useState } from "react";
import styled from "styled-components";

import BPaperDataBox from "../boe/BPaperDataBox";
import PaperDataBox from "../coe/PaperDataBox";
import StatusTransitions from "./StatusTransitions";

import Button from "../../ui/Button";
import ButtonGroup from "../../ui/ButtonGroup";
import ButtonText from "../../ui/ButtonText";
import Checkbox from "../../ui/Checkbox";
import Heading from "../../ui/Heading";
import Row from "../../ui/Row";
import Empty from "./../../ui/Empty";

import { useMoveBack } from "../../hooks/useMoveBack";
import { useApproval } from "./useApproval";

// Styled container for the action/confirmation area
const Box = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem 4rem;
`;

/**
 * ApprovePaper
 * -------------
 * Handles the approve/lock (role-based) workflow for an exam paper.
 * - Loads paper data by id, role, and custom hook (passed in as usePaperHook)
 * - Shows header, subject detail (PaperDataBox), and role-specific approval action
 * - Uses status "transition" logic from StatusTransitions and role mapping
 * - Approval button is gated by a user-checked confirmation checkbox
 * - Parent passes the user role ("coe", "boe", etc) and paper-fetching hook (e.g. useCPaper)
 */
function ApprovePaper({ role, usePaperHook }) {
  // Data and loading state for the currently viewed paper (custom data hook)
  const { paper } = usePaperHook();
  const moveBack = useMoveBack(); // Go back in navigation/routing

  // State: Has the user checked the confirmation box before approve/lock?
  const [confirmed, setConfirmed] = useState(false);

  // Mutation hook for performing status change/approval logic
  const { mutate, isLoading: isApproving } = useApproval({ role });

  if (!paper) return <Empty resourceName="papers" />;

  // Current paper ID and status
  const { id, status } = paper;
  // Render PaperDataBox or BPaperDataBox based on role
  const PaperComponent = role === "boe" ? BPaperDataBox : PaperDataBox;
  // Determine possible transitions for the current status/role
  const transitions = StatusTransitions[status] || {};
  const transition = transitions[role];

  // Handler: When Approve/Lock button is pressed
  function handleAction() {
    if (!transition) return; // Should never happen (button only shown if transition is defined)
    mutate({ id, update: transition.update(paper) });
  }

  // Main render UI
  return (
    <>
      {/* --- Page Header --- */}
      <Row type="horizontal">
        <Heading as="h1">
          {transition ? `${transition.label} paper ${id}` : `Paper ${id}`}
        </Heading>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      {/* Paper details/info card */}
      <PaperComponent paper={paper} role={role} />

      {/* --- Action/Confirmation Section: Only if transition is valid for current status/role --- */}
      {transition && transition.confirm && (
        <Box>
          <Checkbox
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          >
            {transition.confirm(paper)}
          </Checkbox>
        </Box>
      )}

      {/* --- Action Buttons --- */}
      <ButtonGroup>
        {transition && (
          <Button
            onClick={handleAction}
            variation="danger"
            disabled={
              isApproving || (transition.confirm && !confirmed) // Only require confirmation if confirm exists
            }
          >
            {isApproving
              ? `${transition.label}ing...`
              : `${transition.label} paper ${id}`}
          </Button>
        )}
        <Button variation="secondary" onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>

      {/* No-op fallback: If there is no role-action for this status */}
      {!transition && (
        <Box>
          <span>No approval action available for your role at this stage.</span>
        </Box>
      )}
    </>
  );
}

export default ApprovePaper;
