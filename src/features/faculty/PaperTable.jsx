import { useSearchParams } from "react-router-dom";
import Menus from "../../ui/Menus";
import Table from "../../ui/Table";
import Spinner from "./../../ui/Spinner";
import PaperRow from "./PaperRow";
import Empty from "./../../ui/Empty";

import { useFPapers } from "./useFPapers";

function PaperTable() {
  const { isLoading, papers } = useFPapers();
  const [searchParams] = useSearchParams();

  if (isLoading) return <Spinner />;

  if (!papers.length) return <Empty resourceName="papers" />;

  const sortBy = searchParams.get("sortBy") || "academic_year";
  const [field, direction] = sortBy.split("-");
  const modifier = direction === "asc" ? 1 : -1;
  const sortedPapers = papers.sort((a, b) => (a[field] - b[field]) * modifier);

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
        </Table.Header>

        <Table.Body
          data={sortedPapers}
          render={(paper) => <PaperRow paper={paper} key={paper.id} />}
        />
      </Table>
    </Menus>
  );
}

export default PaperTable;
