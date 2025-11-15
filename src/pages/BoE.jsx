import BoETableOperations from "../features/boe/BoETableOperations";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
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
