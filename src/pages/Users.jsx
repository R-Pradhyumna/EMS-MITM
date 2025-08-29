import Row from "../ui/Row";
import Heading from "../ui/Heading";
import UserTable from "../features/authentication/UserTable";

function Users() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Users Portal</Heading>
      </Row>

      <UserTable />
    </>
  );
}

export default Users;
