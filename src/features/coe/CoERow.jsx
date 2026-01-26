import {
  HiArrowUturnLeft,
  HiCheckCircle,
  HiEye,
  HiLockClosed,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Table from "../../ui/Table";
import Menus from "./../../ui/Menus";
import useRollbackPaper from "./useRollbackPaper";

// --- Styled Components ---
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

// === Main Row Component for CoE Table ===
/**
 * CoERow
 * -------
 * Renders a single paper row for the CoE/exam office table.
 * Displays subject code, academic year, name, semester, and status.
 * Last cell is an actions menu:
 *  - Always: "See details"
 *  - If "Submitted": "Approve"
 *  - If "BoE-approved": "Lock"
 *
 * All actions use React Router's navigate to go to detail/approve/lock views.
 */
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
  const navigate = useNavigate(); // React Router navigation function
  const { rollbackPaper, isPending } = useRollbackPaper();

  const handleRollback = (targetStatus) => {
    if (!confirm(`Rollback paper from ${status} → ${targetStatus}?`)) return;
    rollbackPaper({ paperId, targetStatus });
  };

  return (
    <Table.Row>
      {/* Subject Code cell */}
      <SubCode>{subject_code}</SubCode>
      {/* Academic Year cell */}
      <SubCode>{academic_year}</SubCode>
      {/* Subject Name cell */}
      <SubName>{subject_name}</SubName>
      {/* Semester cell */}
      <Semester>Sem-{semester}</Semester>
      {/* Colorful status badge */}
      <StatusWrapper>
        <Status status={status}>{status}</Status>
      </StatusWrapper>

      {/* Row actions: 3-dot menu with conditional items */}
      <Menus.Menu>
        {/* Button to open row actions menu */}
        <Menus.Toggle id={paperId} />

        <Menus.List id={paperId}>
          {/* Always show this: Go to the details page for the paper */}
          <Menus.Button
            icon={<HiEye style={{ color: "var(--color-blue-700)" }} />}
            onClick={() => navigate(`/papers/${paperId}`)}
          >
            See details
          </Menus.Button>

          {/* If paper is in "Submitted" state, allow CoE to "Approve" */}
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

          {/* NEW: Rollback buttons - CoE only context */}
          {status === "BoE-approved" && (
            <Menus.Button
              icon={
                <HiArrowUturnLeft
                  style={{ color: "var(--color-orange-700)" }}
                />
              }
              onClick={() => handleRollback("CoE-approved")}
              disabled={isPending}
            >
              Rollback to CoE-approved
            </Menus.Button>
          )}

          {status === "CoE-approved" && (
            <Menus.Button
              icon={
                <HiArrowUturnLeft
                  style={{ color: "var(--color-orange-700)" }}
                />
              }
              onClick={() => handleRollback("Submitted")}
              disabled={isPending}
            >
              Rollback to Submitted
            </Menus.Button>
          )}

          {/* If already "BoE-approved", allow CoE to "Lock" the paper */}
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
