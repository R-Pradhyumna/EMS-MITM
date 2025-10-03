import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";

import { useState } from "react";
import { useUpdateUser } from "./useUpdateUser";
import { useUser } from "./useUser";
import { useUserData } from "./useUserData";

function UpdateUserDataForm() {
  const {
    user: { email },
  } = useUser();
  const { employee_id, username, department_name, role } = useUserData();
  const { updateUser, isUpdating } = useUpdateUser();

  console.log(username, employee_id, department_name);

  // Controlled state for all editable fields
  const [name, setName] = useState(username || "");
  const [empId, setEmpId] = useState(employee_id || "");
  const [deptName, setDeptName] = useState(department_name || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !empId.trim() || !deptName.trim()) return;
    updateUser(
      { fullName: name, employee_id: empId, department_name: deptName },
      {
        onSuccess: () => {
          setName(fullName || "");
          setEmpId(employee_id || "");
          setDeptName(department_name || "");
        },
      }
    );
  }

  function handleCancel() {
    // Reset fields to current DB/user values
    setName(username || "");
    setEmpId(employee_id || "");
    setDeptName(department_name || "");
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="Email address">
        <Input value={email || ""} disabled />
      </FormRow>

      <FormRow label="Full name">
        <Input
          type="text"
          id="fullName"
          value={name}
          disabled={isUpdating}
          onChange={(e) => setName(e.target.value)}
        />
      </FormRow>

      <FormRow label="Employee ID">
        <Input
          type="text"
          id="employee_id"
          value={empId}
          disabled={isUpdating}
          onChange={(e) => setEmpId(e.target.value)}
        />
      </FormRow>

      <FormRow label="Department Name">
        <Input
          type="text"
          id="department_name"
          value={deptName}
          disabled={isUpdating}
          onChange={(e) => setDeptName(e.target.value)}
        />
      </FormRow>

      <FormRow label="Role">
        <Input value={role || ""} disabled />
      </FormRow>

      <FormRow>
        <Button
          type="reset"
          variation="secondary"
          disabled={isUpdating}
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button disabled={isUpdating}>Update account</Button>
      </FormRow>
    </Form>
  );
}

export default UpdateUserDataForm;
