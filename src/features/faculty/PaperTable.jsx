import { useSearchParams } from "react-router-dom";
import Menus from "../../ui/Menus";
import Table from "../../ui/Table";
import Spinner from "./../../ui/Spinner";
import PaperRow from "./PaperRow";
import Empty from "./../../ui/Empty";
import Pagination from "../../ui/Pagination";

import { useFPapers } from "./useFPapers";

/**
 * PaperTable
 * ----------
 * Faculty-facing table for listing (and managing) all exam papers.
 * Handles:
 *  - Loading and paginating paper data via useFPapers
 *  - Sorting by academic_year or semester, ascending/descending
 *  - Displaying empty state if no papers
 *  - Wrapping rows with a Menu context for actions like Edit
 */
function PaperTable() {
  // Fetch paginated data and row count from custom hook (data comes from Supabase API)
  const { isLoading, papers, count } = useFPapers();

  // Allows reading the sort param (or others) from the URL (via React Router)
  const [searchParams] = useSearchParams();

  // Show loading spinner while waiting for API to resolve
  if (isLoading) return <Spinner />;

  // Show a context-aware empty state if there are no papers after loading
  if (!papers || papers.length === 0) return <Empty resourceName="papers" />;

  // --- Sorting logic, client-side (can be moved server-side if needed) ---
  // Parse 'sortBy' from the URL (e.g., "academic_year-asc", default to academic_year ascending)
  const sortBy = searchParams.get("sortBy") || "academic_year";
  // Destructure to get column and direction ("asc"/"desc")
  const [field, direction] = sortBy.split("-");
  // Convert direction to sort multiplier (+1 = ascending, -1 = descending)
  const modifier = direction === "asc" ? 1 : -1;
  // Sort the papers array by selected field and direction (numeric fields only!)
  const sortedPapers = papers.sort((a, b) => (a[field] - b[field]) * modifier);

  // --- Render the main table with menus and rows ---
  return (
    <Menus>
      <Table columns="1.4fr 1.8fr 2.2fr 1fr 1fr 1fr">
        <Table.Header>
          <div>Subject Code</div>
          <div>Academic Year</div>
          <div>Subject Name</div>
          <div>Semester</div>
          <div>Status</div>
          <div></div>
          {/* empty for actions menu column */}
        </Table.Header>

        {/* Table.Body handles mapping each record to a row component */}
        <Table.Body
          data={sortedPapers}
          render={(paper) => <PaperRow paper={paper} key={paper.id} />}
        />

        {/* Pagination component in the table footer, using total count */}
        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default PaperTable;
