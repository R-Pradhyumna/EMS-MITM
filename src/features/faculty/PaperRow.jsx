import { FaFilePdf } from "react-icons/fa"; // Import the PDF Icon
import { HiPencil } from "react-icons/hi2";
import styled from "styled-components";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import Table from "../../ui/Table";
import CreatePaperForm from "./CreatePaperForm";

// const TableRow = styled.div`
//   display: grid;
//   grid-template-columns: 0.6fr 1.8fr 2.2fr 1fr 1fr 1fr;
//   column-gap: 2.4rem;
//   align-items: center;
//   padding: 1.4rem 2.4rem;

//   &:not(:last-child) {
//     border-bottom: 1px solid var(--color-grey-100);
//   }
// `;

const Img = styled.img`
  display: block;
  width: 6.4rem;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  object-position: center;
  transform: scale(1.5) translateX(-7px);
`;

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

  background-color: ${({ status }) =>
    status === "Submitted"
      ? "var(--color-green-100)"
      : status === "Pending-CoE"
      ? "var(--color-yellow-100)"
      : status === "Pending-BoE"
      ? "var(--color-indigo-100)"
      : status === "Correction-Requested"
      ? "var(--color-red-100)"
      : status === "Locked"
      ? "var(--color-yellow-100)"
      : status === "Downloaded"
      ? "var(--color-blue-100)"
      : "var(--color-grey-100)"};

  color: ${({ status }) =>
    status === "Submitted"
      ? "var(--color-yellow-700)"
      : status === "Pending-CoE"
      ? "var(--color-yellow-700)"
      : status === "Pending-BoE"
      ? "var(--color-indigo-700)"
      : status === "Correction-Requested"
      ? "var(--color-red-700)"
      : status === "Locked"
      ? "var(--color-green-700)"
      : status === "Downloaded"
      ? "var(--color-blue-700)"
      : "var(--color-grey-700)"};
`;

function PaperRow({ paper }) {
  const { subject_id, title, semester, status } = paper;

  return (
    <Table.Row>
      {/* 1st column: PDF Icon */}
      <div className="flex items-center justify-center">
        <FaFilePdf className="text-red-600 w-8 h-8" />
      </div>

      {/* 2nd column: Subject Code */}
      <SubCode>{subject_id}</SubCode>

      {/* 3rd column: Subject Name */}
      <SubName>{title}</SubName>

      {/* 4th column: Semester */}
      <Semester>{semester}</Semester>

      {/* 5th column: Status */}
      <Status status={status}>{status}</Status>

      <div>
        <Modal>
          <Menus.Menu>
            <Menus.Toggle>
              {/* put id={paperId} here later*/}
              <Menus.List>
                {/* put id={paperId} here later*/}
                <Modal.Open opens="edit">
                  <Menus.Button icon={<HiPencil />}>Edit</Menus.Button>
                </Modal.Open>
              </Menus.List>
            </Menus.Toggle>

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
