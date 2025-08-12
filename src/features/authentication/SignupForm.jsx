import { useForm } from "react-hook-form";

import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import { useSignup } from "./useSignup";

// Email regex: /\S+@\S+\.\S+/

function SignupForm() {
  const { signup, isLoading } = useSignup();
  const { register, formState, getValues, handleSubmit, reset } = useForm();
  const { errors } = formState;

  function onSubmit({
    fullName,
    email,
    password,
    employee_id,
    department_name,
    role,
  }) {
    signup(
      { fullName, email, password, employee_id, department_name, role },
      {
        onSuccess: reset,
      }
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Full name" error={errors?.fullName?.message}>
        <Input
          type="text"
          id="fullName"
          {...register("fullName", { required: "This field is required" })}
        />
      </FormRow>

      <FormRow label="Employee ID" error={errors?.employee_id?.message}>
        <Input
          type="text"
          id="employee_id"
          {...register("employee_id", { required: "This field is required" })}
        />
      </FormRow>

      <FormRow label="Department Name" error={errors?.department_name?.message}>
        <Input
          type="text"
          id="department_name"
          {...register("department_name", {
            required: "This field is required",
          })}
        />
      </FormRow>

      <FormRow label="Role" error={errors?.role?.message}>
        <select
          id="role"
          {...register("role", { required: "Please select a role" })}
        >
          <option value="">-- Select role --</option>
          <option value="faculty">Faculty</option>
          <option value="CoE">Controller of Examination</option>
          <option value="BoE">Board of Examiner</option>
          <option value="Principal">Principal</option>
        </select>
      </FormRow>

      <FormRow label="Email address" error={errors?.email?.message}>
        <Input
          type="email"
          id="email"
          autoComplete="off"
          {...register("email", {
            required: "This field is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Please provide a valid email address",
            },
          })}
        />
      </FormRow>

      <FormRow
        label="Password (min 8 characters)"
        error={errors?.password?.message}
      >
        <Input
          type="password"
          id="password"
          {...register("password", {
            required: "This field is required",
            minLength: {
              value: 8,
              message: "Password needs a minimum of 8 characters",
            },
          })}
        />
      </FormRow>

      <FormRow label="Repeat password" error={errors?.passwordConfirm?.message}>
        <Input
          type="password"
          id="passwordConfirm"
          {...register("passwordConfirm", {
            required: "This field is required",
            validate: (value) =>
              value === getValues("password") || "Passwords need to match",
          })}
        />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button
          variation="danger"
          type="reset"
          disabled={isLoading}
          onClick={reset}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          Create new user
        </Button>
      </FormRow>
    </Form>
  );
}

export default SignupForm;
