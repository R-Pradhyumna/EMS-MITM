import AddPaper from "../features/faculty/AddPaper";
import PaperTable from "../features/faculty/PaperTable";
import Heading from "../ui/Heading";
import Row from "../ui/Row";

function Faculty() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Faculty Portal</Heading>
        <p>Filter / Sort</p>
      </Row>

      <Row>
        <PaperTable />
        <AddPaper />
      </Row>
    </>
  );
}

export default Faculty;
