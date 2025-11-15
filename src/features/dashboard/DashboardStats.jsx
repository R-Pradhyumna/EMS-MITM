import styled from "styled-components";
import { useDashboardStats } from "./useDashboardStats";

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.6rem;
  margin-bottom: 2.4rem;
`;

const StatCard = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-grey-500);
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const StatIcon = styled.span`
  font-size: 2rem;
`;

const StatValue = styled.div`
  font-size: 3.6rem;
  font-weight: 700;
  color: var(--color-grey-700);
  line-height: 1;
  text-align: center;
`;

function DashboardStats() {
  const { stats } = useDashboardStats();

  const { totalPapers, pendingReview, approved, downloaded } = stats;

  return (
    <StatsContainer>
      {/* Total Papers */}
      <StatCard>
        <StatHeader>
          <StatTitle>Total Papers</StatTitle>
          <StatIcon>📄</StatIcon>
        </StatHeader>
        <StatValue>{totalPapers}</StatValue>
      </StatCard>

      {/* Pending Review */}
      <StatCard>
        <StatHeader>
          <StatTitle>Pending Review</StatTitle>
          <StatIcon>⏳</StatIcon>
        </StatHeader>
        <StatValue>{pendingReview}</StatValue>
      </StatCard>

      {/* Approved */}
      <StatCard>
        <StatHeader>
          <StatTitle>Approved</StatTitle>
          <StatIcon>✅</StatIcon>
        </StatHeader>
        <StatValue>{approved}</StatValue>
      </StatCard>

      {/* Downloaded */}
      <StatCard>
        <StatHeader>
          <StatTitle>Downloaded</StatTitle>
          <StatIcon>📥</StatIcon>
        </StatHeader>
        <StatValue>{downloaded}</StatValue>
      </StatCard>
    </StatsContainer>
  );
}

export default DashboardStats;
