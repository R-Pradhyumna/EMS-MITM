import Empty from "../../ui/Empty";
import Menus from "../../ui/Menus";
import Pagination from "../../ui/Pagination";
import Table from "../../ui/Table";

import { useGetFaculties } from "../boe/useGetFaculties";
import { useGetCoE } from "../principal/useGetCoE";
import { useGetUsers } from "./../coe/useGetUsers";
import UserRow from "./UserRow";
import { useUserData } from "./useUserData";

function useGetUsersByRole(role) {
  switch (role) {
    case "BoE":
      return useGetFaculties();
    case "CoE":
      return useGetUsers();
    case "Principal":
      return useGetCoE();
    default:
      return { data: [], isLoading: false, count: 0 }; // Avoid returning undefined
  }
}

function UserTable() {
  const { role, isLoading: isUserLoading } = useUserData();

  const {
    users = [],
    isLoading: isDataLoading,
    count,
  } = useGetUsersByRole(role);

  if (!users.length) return <Empty resourceName="users" />;

  return (
    <Menus>
      <Table columns="1.4fr 1.8fr 2.2fr 1fr 1fr 1fr">
        <Table.Header>
          <div>Employee ID</div>
          <div>Username</div>
          <div>Department Name</div>
          <div>Role</div>
          <div></div>
        </Table.Header>
        <Table.Body
          data={users}
          render={(user) => <UserRow key={user.employee_id} user={user} />}
        />
        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default UserTable;
