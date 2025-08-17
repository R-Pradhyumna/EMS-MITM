import { HiPencil } from "react-icons/hi2";
import styled from "styled-components";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import Table from "../../ui/Table";
import CreatePaperForm from "./CreatePaperForm";

// --- Styled Components for Table Cells ---

// Large, strong subject code display
const SubCode = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  text-align: left;
  color: var(--color-grey-600);
  font-family: "Sono";
`;

// Subject name, bold for emphasis
const SubName = styled.div`
  font-family: "Sono";
  font-weight: 600;
  text-align: left;
`;

// Semester, a little more colorful
const Semester = styled.div`
  font-family: "Sono";
  font-weight: 500;
  color: var(--color-green-700);
  text-align: left;
`;

// Status badge: color & background depend on status value
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

// === Main Table Row Component ===
/**
 * Renders a single row of the Papers table for faculty view
 * - Displays subject code, academic year, subject name, semester, and status
 * - Last cell contains a menu button (⋮) for row actions
 *   - Edit paper ("Submitted" status only), opens modal form
 */
function PaperRow({ paper }) {
  // Destructure relevant attributes of the paper for display and IDs
  const {
    id: paperId,
    subject_code,
    academic_year,
    subject_name,
    semester,
    status,
    // ...other fields if any
  } = paper;

  return (
    <Table.Row>
      {/* 1st Column: Subject Code */}
      <SubCode>{subject_code}</SubCode>

      {/* 2nd Column: Academic Year */}
      <SubCode>{academic_year}</SubCode>

      {/* 3rd Column: Subject Name */}
      <SubName>{subject_name}</SubName>

      {/* 4th Column: Semester */}
      <Semester>{semester}</Semester>

      {/* 5th Column: Status badge */}
      <Status status={status}>{status}</Status>

      {/* Actions column: Edit menu, only when status is "Submitted" */}
      <div>
        <Modal>
          <Menus.Menu>
            {/* The three-dot toggle for row actions */}
            <Menus.Toggle
              id={paperId}
              aria-label="Show actions for this paper"
            />
            {/* Only enable edit if paper is still "Submitted" (i.e., not locked/approved) */}
            {status === "Submitted" && (
              <Menus.List id={paperId}>
                {/* Modal.Open links the menu action to opening the modal */}
                <Modal.Open opens="edit">
                  <Menus.Button icon={<HiPencil />} aria-label="Edit paper">
                    Edit
                  </Menus.Button>
                </Modal.Open>
              </Menus.List>
            )}
            {/* Modal window: shows the CreatePaperForm in edit mode, pre-filled with this paper's data */}
            <Modal.Window name="edit">
              <CreatePaperForm paperToEdit={paper} />
            </Modal.Window>
          </Menus.Menu>
        </Modal>
      </div>
    </Table.Row>
  );
}

export default PaperRow;
