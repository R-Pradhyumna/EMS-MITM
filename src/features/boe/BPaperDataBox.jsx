import { formatInTimeZone } from "date-fns-tz";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  HiArrowDownTray,
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineUser,
} from "react-icons/hi2";
import styled from "styled-components";
import Button from "../../ui/Button";
import DataItem from "../../ui/DataItem";

import { useUploadScrutinizedFiles } from "../boe/useUploadScrutinizedFiles";

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

// NEW: Grid layout for two columns
const GridSection = styled.section`
  padding: 3.2rem 4rem 1.2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: stretch;
`;

// NEW: Column containers
const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.section`
  padding: 3.2rem 4rem 1.2rem;
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
  const [isEditing, setIsEditing] = useState(false);
  const [scrutinizedQP, setScrutinizedQP] = useState(null);
  const [scrutinizedSchema, setScrutinizedSchema] = useState(null);

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
    downloaded_at,
    qp_file_url,
    scheme_file_url,
  } = paper;

  const { mutate: uploadFiles, isLoading } = useUploadScrutinizedFiles({
    onSuccess: () => {
      setIsEditing(false);
      setScrutinizedQP(null);
      setScrutinizedSchema(null);
    },
  });

  function toggleEdit() {
    setIsEditing((prev) => {
      if (prev) {
        // Clear files when canceling
        setScrutinizedQP(null);
        setScrutinizedSchema(null);
      }
      return !prev;
    });
  }

  function handleUpload() {
    if (!scrutinizedQP || !scrutinizedSchema) {
      toast.error("Please select both QP and Schema files.");
      return;
    }
    uploadFiles({
      paper,
      qpFile: scrutinizedQP,
      schemaFile: scrutinizedSchema,
    });
  }

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

      <GridSection>
        {/* Column 1: Subject, Uploaded By, Department */}
        <Column>
          <DataItem icon={<HiOutlineAcademicCap />} label="Subject - ">
            {subject_name} {subject_code && <>({subject_code})</>}
          </DataItem>

          <DataItem icon={<HiOutlineUser />} label="Uploaded by - ">
            {users?.username} ({uploaded_by})
          </DataItem>

          <DataItem icon={<HiOutlineBuildingOffice />} label="Department - ">
            {department_name}
          </DataItem>
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
            <DataItem icon={<HiOutlineCalendar />} label="Updated -">
              {formatInTimeZone(
                new Date(updated_at),
                "Asia/Kolkata",
                "EEE, MMM dd yyyy, p"
              )}

              {downloaded_at && created_at !== updated_at && (
                <DataItem icon={<HiOutlineCalendar />} label="Approved -">
                  {formatInTimeZone(
                    new Date(downloaded_at),
                    "Asia/Kolkata",
                    "EEE, MMM dd yyyy, p"
                  )}
                </DataItem>
              )}
            </DataItem>
          )}
        </Column>
      </GridSection>
      {/* BoE Download + Edit/Cancel Button - Inside the box */}
      <Section
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          paddingTop: 0,
          paddingBottom: "1rem",
          width: "100%",
        }}
      >
        {/* Only show download buttons when NOT editing */}
        <>
          {qp_file_url && (
            <Button
              as="a"
              href={qp_file_url}
              download
              target="_blank"
              icon={<HiArrowDownTray />}
            >
              Download QP
            </Button>
          )}
          {scheme_file_url && (
            <Button
              as="a"
              href={scheme_file_url}
              download
              target="_blank"
              icon={<HiArrowDownTray />}
            >
              Download Schema
            </Button>
          )}
        </>
        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Edit/Cancel Button - Always visible */}
        <Button onClick={toggleEdit}>
          {isEditing ? "Cancel" : "Edit Paper"}
        </Button>
      </Section>

      {/* BoE file upload section - When editing */}
      {isEditing && (
        <>
          <Section>
            <label>
              Upload Corrected QP (.doc/.docx):
              <input
                type="file"
                accept=".doc,.docx"
                onChange={(e) => setScrutinizedQP(e.target.files?.[0] || null)}
                disabled={isLoading}
              />
            </label>
          </Section>
          <Section>
            <label>
              Upload Corrected Schema (.doc/.docx):
              <input
                type="file"
                accept=".doc,.docx"
                onChange={(e) =>
                  setScrutinizedSchema(e.target.files?.[0] || null)
                }
                disabled={isLoading}
              />
            </label>
          </Section>
          <Section>
            <Button
              onClick={handleUpload}
              disabled={isLoading || !scrutinizedQP || !scrutinizedSchema}
            >
              {isLoading ? "Uploading..." : "Upload Corrected Files"}
            </Button>
          </Section>
        </>
      )}
    </StyledPaperDataBox>
  );
}

export default BPaperDataBox;
