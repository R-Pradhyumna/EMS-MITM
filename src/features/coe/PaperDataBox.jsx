import { formatInTimeZone } from "date-fns-tz";

import {
  HiOutlineBookOpen,
  HiOutlineBuildingOffice,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineUser,
} from "react-icons/hi2";
import styled from "styled-components";
import DataItem from "../../ui/DataItem";

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

const GridSection = styled.section`
  padding: 3.2rem 4rem 1.2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: stretch;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

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
      ? "var(--color-yellow-100)"
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
      ? "var(--color-green-700)"
      : status === "Downloaded"
      ? "var(--color-blue-700)"
      : "var(--color-grey-700)"};
`;

function PaperDataBox({ paper }) {
  if (!paper) return null;

  const {
    status,
    subject_name,
    subject_code,
    department_name,
    semester,
    academic_year,
    uploaded_by,
    users,
    created_at,
    updated_at,
    approved_by,
    approver_user,
    downloaded_at,
  } = paper;

  return (
    <StyledPaperDataBox>
      {/* Header: subject code + status badge */}
      <Header>
        <div>
          <HiOutlineDocumentText />
          <p>
            <span>{subject_code}</span>
          </p>
        </div>
        <Status status={status}>
          {status?.replace("-", " ") ?? "Unknown"}
        </Status>
      </Header>

      {/* Two-column grid layout */}
      <GridSection>
        {/* Column 1: Subject, Uploaded by, Department */}
        <Column>
          <DataItem icon={<HiOutlineBookOpen />} label="Subject - ">
            {subject_name} {subject_code && <>({subject_code})</>}
          </DataItem>

          <DataItem icon={<HiOutlineUser />} label="Uploaded by - ">
            {users?.username} ({uploaded_by})
          </DataItem>

          <DataItem icon={<HiOutlineBuildingOffice />} label="Department - ">
            {department_name}
          </DataItem>

          {approved_by && (
            <DataItem icon={<HiOutlineCheckCircle />} label="Approved by - ">
              {approver_user?.username} ({approved_by})
            </DataItem>
          )}
        </Column>

        {/* Column 2: Semester/Year, Created at, Updated at */}
        <Column>
          <DataItem icon={<HiOutlineCalendar />} label="Semester, Year - ">
            {semester}, {academic_year}
          </DataItem>

          {created_at && (
            <DataItem icon={<HiOutlineCalendar />} label="Created -">
              {formatInTimeZone(
                new Date(created_at),
                "Asia/Kolkata",
                "EEE, MMM dd yyyy, p"
              )}
            </DataItem>
          )}

          {updated_at && created_at !== updated_at && (
            <DataItem icon={<HiOutlineCalendar />} label="Approved -">
              {formatInTimeZone(
                new Date(updated_at),
                "Asia/Kolkata",
                "EEE, MMM dd yyyy, p"
              )}
            </DataItem>
          )}

          {downloaded_at && created_at !== updated_at && (
            <DataItem icon={<HiOutlineCalendar />} label="Downloaded -">
              {formatInTimeZone(
                new Date(downloaded_at),
                "Asia/Kolkata",
                "EEE, MMM dd yyyy, p"
              )}
            </DataItem>
          )}
        </Column>
      </GridSection>
    </StyledPaperDataBox>
  );
}

export default PaperDataBox;
