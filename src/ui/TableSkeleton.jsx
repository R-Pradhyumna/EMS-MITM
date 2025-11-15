import { useContext } from "react";
import styled, { keyframes } from "styled-components";
import { StyledBody, StyledRow, TableContext } from "./Table";

const wave = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SkeletonItem = styled.div`
  height: 2.2rem;
  width: 100%;
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-200);
  background-image: linear-gradient(
    90deg,
    var(--color-grey-200),
    var(--color-shimmer),
    var(--color-grey-200)
  );
  background-size: 200px 100%;
  background-repeat: no-repeat;
  animation: ${wave} 1.5s infinite linear;
`;

function SkeletonRow() {
  const { columns } = useContext(TableContext);
  const numColumns = columns.split(" ").length;

  return (
    <StyledRow columns={columns}>
      {Array.from({ length: numColumns }, (_, i) => (
        <SkeletonItem key={i} />
      ))}
    </StyledRow>
  );
}

function TableSkeleton({ numRows = 5 }) {
  return (
    <StyledBody>
      {Array.from({ length: numRows }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </StyledBody>
  );
}

export default TableSkeleton;
