import CoETable from "../features/coe/CoETable";
import CoETableOperations from "../features/coe/CoETableOperations";

import Heading from "../ui/Heading";
import Row from "../ui/Row";

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
