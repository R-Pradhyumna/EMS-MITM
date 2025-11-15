import { HiCheckCircle, HiEye, HiLockClosed } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Table from "../../ui/Table";
import Menus from "./../../ui/Menus";

// --- Styled Components ---
// Styled cell for Subject Code, large & bold
const SubCode = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  text-align: left;
  color: var(--color-grey-600);
  font-family: "Sono";
`;

// Styled cell for Subject Name, bold
const SubName = styled.div`
  font-family: "Sono";
  font-weight: 600;
  text-align: left;
`;

// Styled cell for Semester, with accent color
const Semester = styled.div`
  font-family: "Sono";
  font-weight: 500;
  color: var(--color-green-700);
  text-align: left;
`;

// Styled cell for the Status badge, color-coded by status prop
const Status = styled.div`
  font-family: "Sono";
  font-weight: 500;
  padding: 0.4rem 1.2rem;
  border-radius: var(--border-radius-sm);
  text-align: left;
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

  return (
    <Table.Row>
      {/* Subject Code cell */}
      <SubCode>{subject_code}</SubCode>
      {/* Academic Year cell */}
      <SubCode>{academic_year}</SubCode>
      {/* Subject Name cell */}
      <SubName>{subject_name}</SubName>
      {/* Semester cell */}
      <Semester>{semester}</Semester>
      {/* Colorful status badge */}
      <Status status={status}>{status}</Status>

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
