import DashboardRow from "./DashboardRow";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "../../ui/Empty";
import Spinner from "../../ui/Spinner";
import Pagination from "../../ui/Pagination";
import { useDPapers } from "./useDPapers";

function DashboardTable() {
  // Custom hook loads data, loading state, and total count for pagination
  const { papers = [], isLoading, count } = useDPapers();

  // Show loading indicator while waiting for API/data
  if (isLoading) return <Spinner />;

  // Show custom "empty" state if there are no papers returned after loading
  if (!papers.length) return <Empty resourceName="papers" />;

  // Main render: interactive table with custom columns for Dashboard workflow
  return (
    <Menus>
      {/* <Table columns="1.4fr 2fr 2.4fr 1.4fr 1fr 3.2rem"> */}
      <Table columns="1.4fr 1.8fr 2.2fr 1fr 1fr 1fr">
        <Table.Header>
          <div>Subject Code</div>
          <div>Academic Year</div>
          <div>Subject Name</div>
          <div>Semester</div>
          <div>Uploaded By</div>
          <div>Schema File</div>
        </Table.Header>

        {/* Render all rows. Each row handles its own actions/logic via DashboardRow */}
        <Table.Body
          data={papers}
          render={(paper) => <DashboardRow key={paper.id} paper={paper} />}
        />

        {/* Paginate using total count (provided by useDPapers) */}
        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default DashboardTable;
