import styled from "styled-components";
// import { format, isToday } from "date-fns";

import Table from "../../ui/Table";

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

function CoERow({
  paper: { subject_code, academic_year, subject_name, semester, status },
}) {
  return (
    <Table.Row>
      <SubCode>{subject_code}</SubCode>
      <SubCode>{academic_year}</SubCode>
      <SubName>{subject_name}</SubName>
      <Semester>{semester}</Semester>
      <Status status={status}>{status}</Status>
    </Table.Row>
  );
}

export default CoERow;
