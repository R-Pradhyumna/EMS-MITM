import PrincipalTableOperations from "../features/principal/PrincipalTableOperations";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import PrincipalTable from "./../features/principal/PrincipalTable";

function Principal() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Principal Portal</Heading>
        <PrincipalTableOperations />
      </Row>

      <PrincipalTable />
    </>
  );
}

export default Principal;
