import UserTable from "../features/authentication/UserTable";
import Heading from "../ui/Heading";
import Row from "../ui/Row";

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
