import styled from "styled-components";
import Table from "../../ui/Table";
import Menus from "./../../ui/Menus";
import { HiEye, HiCheckCircle, HiLockClosed } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const SubCode = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-600);
  font-family: "Sono";
`;

const SubName = styled.div`
  font-family: "Sono";
  font-weight: 600;
`;

const Semester = styled.div`
  font-family: "Sono";
  font-weight: 500;
  color: var(--color-green-700);
`;

const Status = styled.div`
  font-family: "Sono";
  font-weight: 500;
  padding: 0.4rem 1.2rem;
  border-radius: var(--border-radius-sm);
  text-align: center;
  width: fit-content;
  white-space: nowrap;

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
      ? "var(--color-yellow-700)"
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

function CoERow({
  paper: {
    id: paperId,
    subject_code,
    academic_year,
    subject_name,
    semester,
    status,
  },
}) {
  const navigate = useNavigate();
  return (
    <Table.Row>
      <SubCode>{subject_code}</SubCode>
      <SubCode>{academic_year}</SubCode>
      <SubName>{subject_name}</SubName>
      <Semester>{semester}</Semester>
      <Status status={status}>{status}</Status>

      <Menus.Menu>
        <Menus.Toggle id={paperId} />
        <Menus.List id={paperId}>
          <Menus.Button
            icon={<HiEye style={{ color: "var(--color-blue-700)" }} />}
            onClick={() => navigate(`/papers/${paperId}`)}
          >
            See details
          </Menus.Button>

          {status === "Submitted" && (
            <Menus.Button
              icon={
                <HiCheckCircle style={{ color: "var(--color-green-700)" }} />
              }
              onClick={() => navigate(`/approve/${paperId}`)}
            >
              Approve
            </Menus.Button>
          )}

          {status === "BoE-approved" && (
            <Menus.Button
              icon={
                <HiLockClosed style={{ color: "var(--color-yellow-700)" }} />
              }
              onClick={() => navigate(`/approve/${paperId}`)}
            >
              Lock
            </Menus.Button>
          )}
        </Menus.List>
      </Menus.Menu>
    </Table.Row>
  );
}

export default CoERow;
