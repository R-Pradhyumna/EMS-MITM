import CoERow from "./CoERow";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "../../ui/Empty";
import Spinner from "../../ui/Spinner";
import { useCPapers } from "./useCPapers";

function CoETable() {
  const { papers = [], isLoading } = useCPapers();

  if (isLoading) return <Spinner />;

  if (!papers.length) return <Empty resourceName="papers" />;

  return (
    <Menus>
      <Table columns="1.4fr 2fr 2.4fr 1.4fr 1fr 3.2rem">
        <Table.Header>
          <div>Subject Code</div>
          <div>Scheme/Academic Year</div>
          <div>Subject Name</div>
          <div>Semester</div>
          <div>Status</div>
          <div></div>
        </Table.Header>
        <Table.Body
          data={papers}
          render={(paper) => <CoERow key={paper.id} paper={paper} />}
        />
      </Table>
    </Menus>
  );
}

export default CoETable;
