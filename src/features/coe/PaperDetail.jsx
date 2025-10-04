import { HiEye } from "react-icons/hi2"; // NEW
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useMoveBack } from "../../hooks/useMoveBack";
import { usePreviewFile } from "../../hooks/usePreviewFile"; // NEW
import Button from "../../ui/Button";
import ButtonGroup from "../../ui/ButtonGroup";
import ButtonText from "../../ui/ButtonText";
import Heading from "../../ui/Heading";
import Row from "../../ui/Row";
import Empty from "./../../ui/Empty";
import Spinner from "./../../ui/Spinner";
import PaperDataBox from "./PaperDataBox";
import { useCPaper } from "./useCPaper";

const HeadingGroup = styled.div`
  display: flex;
  gap: 2.4rem;
  align-items: center;
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

// NEW: Styled container for button sections
const ActionSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-top: 2.4rem;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

function PaperDetail() {
  // Fetch a single paper and loading state from custom data hook (e.g. by route param)
  const { paper, isLoading } = useCPaper();
  // Custom hook to move back in browser history/routing
  const moveBack = useMoveBack();
  // React Router navigate function (for redirecting to other routes)
  const navigate = useNavigate();
  // NEW: Preview hook for viewing files online
  const { previewFile, isGeneratingUrl } = usePreviewFile();

  // Show spinner while the data is still loading
  if (isLoading) return <Spinner />;

  // If for some reason there is no paper (shouldn't normally happen), show fallback
  if (!paper) return <Empty resourceName="paper" />;

  // Pull out status and ID for local reference/actions
  const { status, id: paperId, qp_file_url, scheme_file_url } = paper;

  // Main render: Page header, data details, and action buttons
  return (
    <>
      {/* --- Page header area: Paper ID, status badge, Back button --- */}
      <Row type="horizontal">
        <HeadingGroup>
          <Heading as="h1">Paper {paperId}</Heading>
          {/* Format status string for badge */}
          <Status status={status}>
            {status?.replace("-", " ") ?? "Unknown"}
          </Status>
        </HeadingGroup>
        {/* Back link styled as text */}
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      {/* --- Main details/information panel --- */}
      {/* Shows subject, department, QP/schema info, upload/approval/footer, roles etc. */}
      <PaperDataBox paper={paper} />

      {/* --- Page footer: contextual action buttons --- */}
      <ActionSection>
        {/* Left: File Actions (Preview) */}
        <ActionGroup>
          <Button
            onClick={() => previewFile(qp_file_url)}
            disabled={isGeneratingUrl}
            icon={<HiEye />}
          >
            Preview QP
          </Button>
          <Button
            onClick={() => previewFile(scheme_file_url)}
            disabled={isGeneratingUrl}
            icon={<HiEye />}
          >
            Preview Scheme
          </Button>
        </ActionGroup>

        {/* Right: Workflow Actions (Approve/Lock/Back) */}
        <ActionGroup>
          {status === "Submitted" && (
            <Button onClick={() => navigate(`/approve/${paperId}`)}>
              Approve
            </Button>
          )}
          {status === "BoE-approved" && (
            <Button onClick={() => navigate(`/approve/${paperId}`)}>
              Lock
            </Button>
          )}
        </ActionGroup>
      </ActionSection>
    </>
  );
}

export default PaperDetail;
