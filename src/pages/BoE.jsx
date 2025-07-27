import Row from "../ui/Row";
import Heading from "../ui/Heading";
import BoETableOperations from "../features/boe/BoETableOperations";
import BoETable from "./../features/boe/BoETable";

function BoE() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">BoE Portal</Heading>
        <BoETableOperations />
      </Row>

      <BoETable />
    </>
  );
}

export default BoE;
