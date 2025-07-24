import Row from "../ui/Row";
import Heading from "../ui/Heading";
import CoETable from "../features/coe/CoETable";
import CoETableOperations from "../features/coe/CoETableOperations";

function CoE() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">CoE Portal</Heading>
        <CoETableOperations />
      </Row>

      <CoETable />
    </>
  );
}

export default CoE;
