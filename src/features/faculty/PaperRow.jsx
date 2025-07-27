import { HiPencil } from "react-icons/hi2";
import styled from "styled-components";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import Table from "../../ui/Table";
import CreatePaperForm from "./CreatePaperForm";

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

function PaperRow({ paper }) {
  const {
    id: paperId,
    subject_code,
    academic_year,
    subject_name,
    semester,
    status,
  } = paper;
  return (
    <Table.Row>
      {/* 1st column: Subject Code */}
      <SubCode>{subject_code}</SubCode>

      {/* 2nd column: Academic_year */}
      <SubCode>{academic_year}</SubCode>

      {/* 3rd column: Subject Name */}
      <SubName>{subject_name}</SubName>

      {/* 4th column: Semester */}
      <Semester>{semester}</Semester>

      {/* 5th column: Status */}
      <Status status={status}>{status}</Status>

      <div>
        <Modal>
          <Menus.Menu>
            <Menus.Toggle id={paperId} />
            <Menus.List id={paperId}>
              <Modal.Open opens="edit">
                <Menus.Button icon={<HiPencil />}>Edit</Menus.Button>
              </Modal.Open>
            </Menus.List>

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
