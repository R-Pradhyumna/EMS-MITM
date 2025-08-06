import styled from "styled-components";

import Heading from "../../ui/Heading";
import Row from "../../ui/Row";

/**
 * StyledToday
 * ------------
 * The main container for the "Today" dashboard box.
 * - Provides background, border, radius, and padding
 * - Lays out content as a vertical flex column with a gap
 * - Spans two columns in grid parent, so it can be wide
 */
const StyledToday = styled.div`
  /* Box styling */
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);

  padding: 3.2rem;
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  grid-column: 1 / span 2; /* Wide box (if grid parent used) */
  padding-top: 2.4rem; /* Extra spacing at the top */
`;

/**
 * TodayList
 * ----------
 * Scrollable (vertical) list area for today's activities/papers/items.
 * - Hides default scrollbars for a cleaner UI on all browsers
 */
const TodayList = styled.ul`
  overflow: scroll;
  overflow-x: hidden;

  /* Hide scrollbars (Chrome/Safari/Edge) */
  &::-webkit-scrollbar {
    width: 0 !important;
  }
  /* Firefox */
  scrollbar-width: none;
  /* IE/Edge */
  -ms-overflow-style: none;
`;

/**
 * NoActivity
 * ----------
 * Displayed when there is nothing "today".
 * - Centered, bold, larger text
 */
const NoActivity = styled.p`
  text-align: center;
  font-size: 1.8rem;
  font-weight: 500;
  margin-top: 0.8rem;
`;

/**
 * Today
 * -----
 * High-level dashboard widget for "Today".
 * Intended to hold a list of today's activities, papers, or similar info.
 * (Currently only shows a heading; real data/list is to be added later)
 */
function Today() {
  return (
    <StyledToday>
      <Row type="horizontal">
        <Heading as="h2">Today</Heading>
      </Row>
      {/* 
        Add more components here in the future, such as:
        <TodayList>...</TodayList>
        <NoActivity>No activity today</NoActivity>
      */}
    </StyledToday>
  );
}

export default Today;
