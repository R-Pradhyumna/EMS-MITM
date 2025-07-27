import styled from "styled-components";
import { format } from "date-fns";
import {
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineUser,
} from "react-icons/hi2";
import DataItem from "../../ui/DataItem";

// Your provided styled components
const StyledPaperDataBox = styled.section`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
`;

const Header = styled.header`
  background-color: var(--color-brand-500);
  padding: 2rem 4rem;
  color: #e0e7ff;
  font-size: 1.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    height: 3.2rem;
    width: 3.2rem;
  }

  & div:first-child {
    display: flex;
    align-items: center;
    gap: 1.6rem;
    font-weight: 600;
    font-size: 1.8rem;
  }

  & span {
    font-family: "Sono";
    font-size: 2rem;
    margin-left: 4px;
  }
`;

const Section = styled.section`
  padding: 3.2rem 4rem 1.2rem;
`;

const Footer = styled.footer`
  padding: 1.6rem 4rem;
  font-size: 1.2rem;
  color: var(--color-grey-500);
  text-align: right;
`;

// Status badge
const Status = styled.span`
  font-family: "Sono";
  font-weight: 500;
  padding: 0.4rem 1.2rem;
  border-radius: var(--border-radius-sm);
  text-align: center;
  width: fit-content;
  margin-left: 2rem;

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
      ? "var(--color-green-700)"
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

function BPaperDataBox({ paper }) {
  if (!paper) return null;

  const {
    status,
    subject_name,
    subject_code,
    department_name,
    semester,
    academic_year,
    uploaded_by,
    created_at,
    updated_at,
    approved_by,
  } = paper;

  return (
    <StyledPaperDataBox>
      <Header>
        <div>
          <HiOutlineDocumentText />
          <span>{subject_code}</span>
        </div>
        <Status status={status}>
          {status?.replace("-", " ") ?? "Unknown"}
        </Status>
      </Header>

      <Section>
        <DataItem icon={<HiOutlineAcademicCap />} label="Subject - ">
          {subject_name} {subject_code && <>({subject_code})</>}
        </DataItem>

        <DataItem icon={<HiOutlineUser />} label="Uploaded by - ">
          {uploaded_by}
        </DataItem>

        <DataItem icon={<HiOutlineDocumentText />} label="Department - ">
          {department_name}
        </DataItem>

        <DataItem icon={<HiOutlineDocumentText />} label="Semester, Year - ">
          {semester}, {academic_year}
        </DataItem>
      </Section>

      <Footer>
        {created_at && (
          <span>
            Created {format(new Date(created_at), "EEE, MMM dd yyyy, p")}
          </span>
        )}
        {updated_at && created_at !== updated_at && (
          <span>
            | Updated {format(new Date(updated_at), "EEE, MMM dd yyyy, p")}
          </span>
        )}
      </Footer>
    </StyledPaperDataBox>
  );
}

export default BPaperDataBox;
