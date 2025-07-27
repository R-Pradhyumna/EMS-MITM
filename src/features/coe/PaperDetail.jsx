import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import BookingDataBox from "./PaperDataBox";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import ButtonGroup from "../../ui/ButtonGroup";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";

import { useMoveBack } from "../../hooks/useMoveBack";
import { useCPaper } from "./useCPaper";
import Spinner from "./../../ui/Spinner";

const HeadingGroup = styled.div`
  display: flex;
  gap: 2.4rem;
  align-items: center;
`;

const Status = styled.div`
  font-family: "Sono";
  font-weight: 500;
  padding: 0.4rem 1.2rem;
  border-radius: var(--border-radius-sm);
  text-align: center;
  width: fit-content;

  background-color: ${({ status }) =>
    status === "Submitted"
      ? "var(--color-green-100)"
      : status === "CoE-approved"
      ? "var(--color-yellow-100)"
      : status === "BoE-approved"
      ? "var(--color-indigo-100)"
      : status === "Locked"
      ? "var(--color-yellow-100)"
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
      ? "var(--color-green-700)"
      : status === "Downloaded"
      ? "var(--color-blue-700)"
      : "var(--color-grey-700)"};
`;

function PaperDetail() {
  const { paper, isLoading } = useCPaper();
  const moveBack = useMoveBack();
  const navigate = useNavigate();

  if (isLoading) return <Spinner />;

  if (!paper) return <div>No paper data</div>;

  const { status, id: paperId } = paper;
  return (
    <>
      <Row type="horizontal">
        <HeadingGroup>
          <Heading as="h1">Paper {paperId}</Heading>
          <Status status={status}>
            {status?.replace("-", " ") ?? "Unknown"}
          </Status>
        </HeadingGroup>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox paper={paper} />

      <ButtonGroup>
        {status === "Submitted" && (
          <Button onClick={() => navigate(`/approve/${paperId}`)}>
            Approve
          </Button>
        )}

        {status === "BoE-approved" && (
          <Button onClick={() => navigate(`/approve/${paperId}`)}>Lock</Button>
        )}

        <Button variation="secondary" onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  );
}

export default PaperDetail;
