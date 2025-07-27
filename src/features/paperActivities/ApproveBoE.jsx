import { useState } from "react";
import styled from "styled-components";
import PaperDataBox from "../coe/PaperDataBox";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import ButtonGroup from "../../ui/ButtonGroup";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";
import Checkbox from "../../ui/Checkbox";
import Spinner from "../../ui/Spinner";
import { useMoveBack } from "../../hooks/useMoveBack";
import { useBPaper } from "../boe/useBPaper";
import { useApproval } from "./useApproval";

const Box = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem 4rem;
`;

// --- Workflow logic: map status to next action+update+confirmation ---
const STATUS_TRANSITIONS = {
  Submitted: {
    label: "Approve",
    update: (paper) => ({ status: "CoE-approved" }),
    confirm: (paper) =>
      `I confirm that ${paper.uploaded_by} has uploaded paper #${paper.id}`,
  },
  "BoE-approved": {
    label: "Lock",
    update: (paper) => ({ status: "Locked", is_locked: true }),
    confirm: (paper) =>
      `I confirm that ${
        paper.approved_by || paper.uploaded_by
      } has approved paper #${paper.id}`,
  },
};

function ApproveBoE() {
  const { paper, isLoading } = useBPaper();
  const moveBack = useMoveBack();
  const [confirmed, setConfirmed] = useState(false);

  const { mutate, isLoading: isApproving } = useApproval();

  if (isLoading) return <Spinner />;
  if (!paper) return null;

  const { id, status } = paper;

  // Determine the current workflow step, or null for others
  const transition = STATUS_TRANSITIONS[status] || null;

  // Handle the button click: computes the update on the fly
  function handleAction() {
    if (!transition) return;
    mutate({ id, update: transition.update(paper) });
  }

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          {transition ? `${transition.label} paper ${id}` : `Paper ${id}`}
        </Heading>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <PaperDataBox paper={paper} />

      {/* Show confirmation checkbox if a transition is available */}
      {transition && (
        <Box>
          <Checkbox
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          >
            {transition.confirm(paper)}
          </Checkbox>
        </Box>
      )}

      <ButtonGroup>
        {transition && (
          <Button onClick={handleAction} disabled={!confirmed || isApproving}>
            {isApproving
              ? `${transition.label}ing...`
              : `${transition.label} paper ${id}`}
          </Button>
        )}
        <Button variation="secondary" onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  );
}

export default ApproveBoE;
