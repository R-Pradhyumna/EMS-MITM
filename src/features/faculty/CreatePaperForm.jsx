import styled from "styled-components";
import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import FormRow from "./../../ui/FormRow";

import { useCreatePaper } from "./useCreatePaper";
import { useEditPaper } from "./useEditPaper";
import { useUserData } from "../authentication/useUserData";
import { useDepartments } from "../../hooks/useDepartments";

const StyledSelect = styled.select`
  font-size: 1.2rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid
    ${(props) =>
      props.type === "white"
        ? "var(--color-grey-100)"
        : "var(--color-grey-300)"};
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
`;

// Form for adding or editing a single paper (question and scheme files, plus metadata)
function CreatePaperForm({ paperToEdit = {}, onCloseModal }) {
  // Hooks for creating and editing paper entities (from custom mutation hooks)
  const { isCreating, createPaper } = useCreatePaper();
  const { isEditing, editPaper } = useEditPaper();
  const { employee_id } = useUserData();
  const { data = [] } = useDepartments();
  const options = data.map((dep) => ({
    value: dep.name,
    label: dep.name,
  }));
  // Track working state: disables form when a request is in progress
  const isWorking = isCreating || isEditing;

  // Destructure id (edit mode) and all other values
  const { id: editId, ...editValues } = paperToEdit;
  // Determine if we are in edit mode (true if editing an existing paper)
  const isEditSession = Boolean(editId);

  // Initialize the react-hook-form instance
  // - Sets defaultValues for edit mode
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: isEditSession ? editValues : {},
  });
  // Grab form error object for validation feedback
  const { errors } = formState;

  // Main submit handler: called with validated form data by react-hook-form

  function onSubmit(data) {
    const qpFileArray =
      data.qp_file && data.qp_file.length > 0 ? data.qp_file : [];
    const schemeFileArray =
      data.scheme_file && data.scheme_file.length > 0 ? data.scheme_file : [];

    const basePayload = {
      subject_code: data.subject_code,
      subject_name: data.subject_name,
      semester: data.semester,
      academic_year: Number(data.academic_year),
      department_name: data.department_name,
      qp_file: qpFileArray,
      scheme_file: schemeFileArray,
      uploaded_by: employee_id, // <-- Always include this!
    };

    // For edit, preserve previous file URLs/types
    if (isEditSession) {
      const payload = {
        ...basePayload,
        qp_file_url: paperToEdit.qp_file_url,
        scheme_file_url: paperToEdit.scheme_file_url,
        qp_file_type: paperToEdit.qp_file_type,
        scheme_file_type: paperToEdit.scheme_file_type,
      };
      editPaper(
        { newPaper: payload, id: editId },
        {
          onSuccess: () => {
            reset();
            onCloseModal?.();
          },
        }
      );
    } else {
      // For create: always include uploaded_by!
      createPaper(basePayload, {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      });
    }
  }

  // function onSubmit(data) {
  //   // For file inputs: array of File, or empty array if not present
  //   const qpFileArray =
  //     data.qp_file && data.qp_file.length > 0 ? data.qp_file : [];
  //   const schemeFileArray =
  //     data.scheme_file && data.scheme_file.length > 0 ? data.scheme_file : [];

  //   const payload = {
  //     subject_code: data.subject_code,
  //     subject_name: data.subject_name,
  //     semester: data.semester,
  //     academic_year: Number(data.academic_year),
  //     department_name: data.department_name,
  //     qp_file: qpFileArray, // <-- ALWAYS array
  //     scheme_file: schemeFileArray, // <-- ALWAYS array
  //     qp_file_url: paperToEdit.qp_file_url,
  //     scheme_file_url: paperToEdit.scheme_file_url,
  //     qp_file_type: paperToEdit.qp_file_type,
  //     scheme_file_type: paperToEdit.scheme_file_type,
  //     uploaded_by: employee_id,
  //   };

  //   // For edit:
  //   if (isEditSession) {
  //     editPaper(
  //       { newPaper: payload, id: editId },
  //       {
  //         onSuccess: () => {
  //           reset();
  //           onCloseModal?.();
  //         },
  //       }
  //     );
  //   } else {
  //     // For create:
  //     createPaper(
  //       { ...data },
  //       {
  //         onSuccess: () => {
  //           reset();
  //           onCloseModal?.();
  //         },
  //       }
  //     );
  //   }
  // }

  // Render the controlled form with all fields
  return (
    <Form
      onSubmit={handleSubmit(onSubmit)} // react-hook-form's submit handler wrapper
      type={onCloseModal ? "modal" : "regular"} // Controls styling/origin based on context
    >
      {/* Subject code: string, max length 8 */}
      <FormRow label="Subject Code" error={errors?.subject_code?.message}>
        <Input
          type="text"
          id="subject_code"
          disabled={isWorking}
          {...register("subject_code", {
            required: "This field is required!",
            maxLength: { value: 10, message: "Max 10 characters" }, // correct for strings
          })}
        />
      </FormRow>

      {/* Subject name: required string */}
      <FormRow label="Subject Name" error={errors?.subject_name?.message}>
        <Input
          type="text"
          id="subject_name"
          disabled={isWorking}
          {...register("subject_name", {
            required: "This field is required",
          })}
        />
      </FormRow>

      {/* Semester: number, min 1, max 8 */}
      <FormRow label="Semester" error={errors?.semester?.message}>
        <Input
          type="number"
          id="semester"
          disabled={isWorking}
          {...register("semester", {
            required: "This field is required!",
            max: {
              value: 8,
              message: "Semester cannot be more than 8",
            },
            min: {
              value: 1,
              message: "Semester cannot be less than 1",
            },
          })}
        />
      </FormRow>

      {/* Academic year: number, required */}
      <FormRow label="Academic Year" error={errors?.academic_year?.message}>
        <Input
          type="number"
          id="academic_year"
          disabled={isWorking}
          {...register("academic_year", {
            required: "This field is required!",
          })}
        />
      </FormRow>

      {/* Department name: string, max length 4 */}
      <FormRow label="Department Name" error={errors?.department_name?.message}>
        <StyledSelect
          id="department_name"
          disabled={isWorking}
          {...register("department_name", {
            required: "This field is required!",
          })}
        >
          <option value="">Select Department</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
      </FormRow>

      {/* QP File upload: required, .doc/.docx */}
      <FormRow label="QP File (.doc/.docx)" error={errors?.qp_file?.message}>
        <FileInput
          id="qp_file"
          accept=".doc,.docx"
          {...register("qp_file", {
            required: !isEditSession ? "This field is required!" : false, // required only when adding!
          })}
        />
      </FormRow>

      {/* Scheme File upload: required, .doc/.docx */}
      <FormRow
        label="Schema File (.doc/.docx)"
        error={errors?.scheme_file?.message}
      >
        <FileInput
          id="scheme_file"
          accept=".doc,.docx"
          {...register("scheme_file", {
            required: !isEditSession ? "This field is required!" : false, // required only when adding!
          })}
        />
      </FormRow>

      {/* Form action buttons row (reset/cancel and submit) */}
      <FormRow>
        {/* Cancel/close button (resets and/or closes modal) */}
        <Button
          variation="danger"
          type="reset"
          onClick={() => onCloseModal?.()}
        >
          Cancel
        </Button>

        {/* Main submit button (disabled while in progress) */}
        <Button disabled={isWorking}>
          {isEditSession ? "Edit paper" : "Add Paper"}
        </Button>
      </FormRow>
    </Form>
  );
}

export default CreatePaperForm;
