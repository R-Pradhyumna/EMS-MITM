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
import StatusTransitions from "./StatusTransitions";
import { useApproval } from "./useApproval";

const Box = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem 4rem;
`;

function ApprovePaper({ role, usePaperHook }) {
  const { paper, isLoading } = usePaperHook();
  const moveBack = useMoveBack();
  const [confirmed, setConfirmed] = useState(false);
  const { mutate, isLoading: isApproving } = useApproval({ role });

  if (isLoading) return <Spinner />;
  if (!paper) return <div>No paper found.</div>;

  const { id, status } = paper;
  const transitions = StatusTransitions[status] || {};
  const transition = transitions[role];

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
      <PaperDataBox paper={paper} role={role} />
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
      {!transition && (
        <Box>
          <span>No approval action available for your role at this stage.</span>
        </Box>
      )}
    </>
  );
}

export default ApprovePaper;
