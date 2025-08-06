import styled from "styled-components";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import { HiEye, HiCheckCircle } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

// Styled cell for subject code: large font, bold, gray
const SubCode = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-600);
  font-family: "Sono";
`;

// Styled cell for subject name: bold headline
const SubName = styled.div`
  font-family: "Sono";
  font-weight: 600;
`;

// Styled cell for semester: moderately bold and green-accented
const Semester = styled.div`
  font-family: "Sono";
  font-weight: 500;
  color: var(--color-green-700);
`;

// Status badge styling: color and background reflect status prop
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
      <Semester>{semester}</Semester>
      {/* 5: Status badge (color-coded) */}
      <Status status={status}>{status}</Status>

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
