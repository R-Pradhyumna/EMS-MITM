import BoERow from "./BoERow";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "../../ui/Empty";
import Spinner from "../../ui/Spinner";
import Pagination from "../../ui/Pagination";
import { useBPapers } from "./useBPapers";

/**
 * BoETable
 * ---------
 * Main table for the BoE (Board of Examiners) workflow.
 * - Fetches and paginates papers using useBPapers()
 * - Displays spinner if loading, or "Empty" UI if no papers found
 * - Shows table with custom headings and BoERow for each data entity
 * - Provides full pagination and action menu structure
 */
function BoETable() {
  // Load papers, loading state, and count from custom BoE data hook
  const { papers = [], isLoading, count } = useBPapers();

  // While waiting for data, show a spinner/loading indicator
  if (isLoading) return <Spinner />;

  // If no papers were found after loading, show an "Empty" notice
  if (!papers.length) return <Empty resourceName="papers" />;

  // Render the main BoE table with menus and all rows
  return (
    <Menus>
      <Table columns="1.4fr 2fr 2.4fr 1.4fr 1fr 3.2rem">
        <Table.Header>
          <div>Subject Code</div>
          <div>Scheme/Academic Year</div>
          <div>Subject Name</div>
          <div>Semester</div>
          <div>Status</div>
          <div></div> {/* Empty for row actions menu */}
        </Table.Header>
        {/* Table.Body maps each paper to a BoERow for detailed row-level logic */}
        <Table.Body
          data={papers}
          render={(paper) => <BoERow key={paper.id} paper={paper} />}
        />
        {/* Footer displays pagination using total count from API */}
        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default BoETable;
