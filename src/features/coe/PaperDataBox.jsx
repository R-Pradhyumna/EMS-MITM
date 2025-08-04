import styled from "styled-components";
import { useState } from "react";
import { format } from "date-fns";
import {
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineUser,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import DataItem from "../../ui/DataItem";
import Button from "../../ui/Button";
import { useUploadScrutinizedFiles } from "../boe/useUploadScrutinizedFiles";
import toast from "react-hot-toast";

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

function PaperDataBox({ paper, role }) {
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
    qp_file_url,
    scheme_file_url,
  } = paper;
  const [isEditing, setIsEditing] = useState(false);
  //  State to hold selected files for uploading
  const [scrutinizedQP, setScrutinizedQP] = useState(null);
  const [scrutinizedSchema, setScrutinizedSchema] = useState(null);

  const { mutate: uploadFiles, isLoading } = useUploadScrutinizedFiles({
    onSuccess: () => {
      // Close the upload form
      setIsEditing(false);
      // Reset file inputs
      setScrutinizedQP(null);
      setScrutinizedSchema(null);
    },
  });

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

  function toggleEdit() {
    setIsEditing((prev) => {
      if (prev) {
        setScrutinizedQP(null);
        setScrutinizedSchema(null);
      }
      return !prev;
    });
  }

  return (
    <StyledPaperDataBox>
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

        {approved_by && (
          <DataItem icon={<HiOutlineCheckCircle />} label="Approved by - ">
            {approved_by}
          </DataItem>
        )}
      </Section>

      {role === "boe" && (
        <Section
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: 0,
            paddingBottom: "1rem",
            width: "100%",
          }}
        >
          {qp_file_url && (
            <Button
              as="a"
              href={qp_file_url}
              download
              target="_blank"
              style={{ marginRight: "1rem" }}
            >
              Download QP
            </Button>
          )}
          {scheme_file_url && (
            <Button as="a" href={scheme_file_url} download target="_blank">
              Download Schema
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button variant="secondary" onClick={toggleEdit}>
            {isEditing ? "Cancel" : "Edit Paper"}
          </Button>
        </Section>
      )}

      {/* BoE upload inputs for scrutinized files */}
      {role === "boe" && isEditing && (
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

      {/* Footer with timestamps */}
      <Footer>
        {created_at && (
          <span>
            Created {format(new Date(created_at), "EEE, MMM dd yyyy, p")}
          </span>
        )}
        {updated_at && created_at !== updated_at && (
          <span>
            {" "}
            | Updated {format(new Date(updated_at), "EEE, MMM dd yyyy, p")}
          </span>
        )}
      </Footer>
    </StyledPaperDataBox>
  );
}

export default PaperDataBox;
