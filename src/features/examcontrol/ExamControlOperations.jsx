import styled from "styled-components";

import UploadExams from "./UploadExams";
import UploadSubjects from "./UploadSubjects";
import UploadUsers from "./UploadUsers";

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.4rem;
  margin-top: 2.4rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 3.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  transition: all 0.3s;
  text-align: center;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const CardIcon = styled.div`
  font-size: 4.5rem;
  line-height: 1;
`;

const CardTitle = styled.h3`
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.8rem;
`;

const CardAction = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 1.6rem;
  border-top: 1px solid var(--color-grey-200);
  width: 100%;
`;

function ExamControlOperations() {
  return (
    <GridContainer>
      {/* Upload Subjects */}
      <ActionCard>
        <CardIcon>📚</CardIcon>
        <CardTitle>Upload Subjects</CardTitle>
        <CardAction>
          <UploadSubjects />
        </CardAction>
      </ActionCard>

      {/* Upload Exam Schedule */}
      <ActionCard>
        <CardIcon>📅</CardIcon>
        <CardTitle>Upload Exam Schedule</CardTitle>
        <CardAction>
          <UploadExams />
        </CardAction>
      </ActionCard>

      {/* Create New Users */}
      <ActionCard>
        <CardIcon>👥</CardIcon>
        <CardTitle>Create New Users</CardTitle>
        <CardAction>
          <UploadUsers />
        </CardAction>
      </ActionCard>
    </GridContainer>
  );
}

export default ExamControlOperations;
