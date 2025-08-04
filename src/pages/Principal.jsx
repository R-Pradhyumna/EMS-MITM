import Row from "../ui/Row";
import Heading from "../ui/Heading";
import PrincipalTable from "./../features/principal/PrincipalTable";
import PrincipalTableOperations from "../features/principal/PrincipalTableOperations";
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
