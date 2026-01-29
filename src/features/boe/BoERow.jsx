import { HiCheckCircle, HiEye } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Menus from "../../ui/Menus";
import Table from "../../ui/Table";

const SubCode = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-grey-700);
  display: flex;
  align-items: center;
`;

const SubName = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
  display: flex;
  align-items: center;
`;

const Semester = styled.div`
  font-size: 1.4rem;
  color: var(--color-grey-600); /* Changed from green */
  display: flex;
  align-items: center;
  /* Removed justify-content: center - left align like others */
  /* Removed text-align: center */
`;

// Wrap Status in a container div
const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Status = styled.span`
  display: inline-flex; /* ← Changed from default */
  align-items: center;
  justify-content: center;
  width: fit-content;
  text-transform: uppercase;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.4rem 1.2rem;
  border-radius: 100px;
  white-space: nowrap;

  color: ${(props) =>
    props.status === "Submitted"
      ? "var(--color-green-700)"
      : props.status === "CoE-approved"
      ? "var(--color-yellow-700)"
      : props.status === "BoE-approved"
      ? "var(--color-blue-700)"
      : props.status === "Locked"
      ? "var(--color-red-700)"
      : props.status === "Downloaded"
      ? "var(--color-indigo-700)"
      : "var(--color-grey-700)"};

  background-color: ${(props) =>
    props.status === "Submitted"
      ? "var(--color-green-100)"
      : props.status === "CoE-approved"
      ? "var(--color-yellow-100)"
      : props.status === "BoE-approved"
      ? "var(--color-blue-100)"
      : props.status === "Locked"
      ? "var(--color-red-100)"
      : props.status === "Downloaded"
      ? "var(--color-indigo-100)"
      : "var(--color-grey-200)"};
`;

/**
 * BoERow
 * -------
 * Renders a single table row in the BoE (Board of Examiners) view.
 * - Shows code, academic year, name, semester, and multi-state status badge.
 * - Final column is an actions menu:
 *    - Always: "See details"
 *    - If status is "CoE-approved": allows "Approve" (BoE approval workflow)
 */
function BoERow({
  paper: {
    id: paperId,
    subject_code,
    academic_year,
    subject_name,
    semester,
    status,
  },
}) {
  const navigate = useNavigate(); // React Router: for navigation/redirects

  return (
    <Table.Row>
      {/* 1: Subject Code */}
      <SubCode>{subject_code}</SubCode>
      {/* 2: Academic Year */}
      <SubCode>{academic_year}</SubCode>
      {/* 3: Subject Name */}
      <SubName>{subject_name}</SubName>
      {/* 4: Semester */}
      <Semester>Sem-{semester}</Semester>
      {/* 5: Status badge (color-coded) */}
      <StatusWrapper>
        <Status status={status}>{status}</Status>
      </StatusWrapper>

      {/* 6: Actions menu (more/vertical dots) */}
      <Menus.Menu>
        {/* Toggle button (⋮), targeting this row's ID */}
        <Menus.Toggle id={paperId} />
        <Menus.List id={paperId}>
          {/* Always: "See details" navigates to detail page */}
          <Menus.Button
            icon={<HiEye style={{ color: "var(--color-blue-700)" }} />}
            onClick={() => navigate(`/papers/${paperId}`)}
          >
            See details
          </Menus.Button>

          {/* If paper is "CoE-approved", allow BoE to Approve */}
          {status === "CoE-approved" && (
            <Menus.Button
              icon={
                <HiCheckCircle style={{ color: "var(--color-green-700)" }} />
              }
              onClick={() => navigate(`/approve/${paperId}`)}
            >
              Approve
            </Menus.Button>
          )}
        </Menus.List>
      </Menus.Menu>
    </Table.Row>
  );
}

export default BoERow;
