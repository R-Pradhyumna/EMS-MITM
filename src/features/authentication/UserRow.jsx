import styled from "styled-components";
import Button from "../../ui/Button";
import Table from "../../ui/Table";
import RemoveUsers from "./RemoveUsers";

const Details = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  text-align: left;
  color: var(--color-grey-600);
  font-family: "Sono";
`;

function UserRow({ user }) {
  const { employee_id, username, department_name, role } = user;

  const { mutate: removeUser, isDeleting } = RemoveUsers();

  return (
    <Table.Row>
      <Details>{employee_id}</Details>
      <Details>{username}</Details>
      <Details>{department_name}</Details>
      <Details>{role}</Details>
      <Button
        variation="danger"
        size="medium"
        onClick={() => removeUser(employee_id)}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete User"}
      </Button>
    </Table.Row>
  );
}

export default UserRow;
