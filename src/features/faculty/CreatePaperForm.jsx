import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import FormRow from "./../../ui/FormRow";

import { useCreatePaper } from "./useCreatePaper";
import { useEditPaper } from "./useEditPaper";

// Form for adding or editing a single paper (question and scheme files, plus metadata)
function CreatePaperForm({ paperToEdit = {}, onCloseModal }) {
  // Hooks for creating and editing paper entities (from custom mutation hooks)
  const { isCreating, createPaper } = useCreatePaper();
  const { isEditing, editPaper } = useEditPaper();
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
    // For file inputs: array of File, or empty array if not present
    const qpFileArray =
      data.qp_file && data.qp_file.length > 0 ? data.qp_file : [];
    const schemeFileArray =
      data.scheme_file && data.scheme_file.length > 0 ? data.scheme_file : [];

    const payload = {
      subject_code: data.subject_code,
      subject_name: data.subject_name,
      semester: data.semester,
      academic_year: Number(data.academic_year),
      department_name: data.department_name,
      qp_file: qpFileArray, // <-- ALWAYS array
      scheme_file: schemeFileArray, // <-- ALWAYS array
      // Provide previous file URLs/types as well (for preservation)
      qp_file_url: paperToEdit.qp_file_url,
      scheme_file_url: paperToEdit.scheme_file_url,
      qp_file_type: paperToEdit.qp_file_type,
      scheme_file_type: paperToEdit.scheme_file_type,
    };

    // For edit:
    if (isEditSession) {
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
      // For create:
      createPaper(
        { ...data },
        {
          onSuccess: () => {
            reset();
            onCloseModal?.();
          },
        }
      );
    }
  }

  // function onSubmit(data) {
  //   // For file inputs, React Hook Form returns an array of File objects
  //   const qpFile = data.qp_file[0];
  //   const schemeFile = data.scheme_file[0];

  //   // Prepare the DB payload (for edit)
  //   const payload = {
  //     subject_code: data.subject_code,
  //     subject_name: data.subject_name,
  //     semester: data.semester,
  //     academic_year: Number(data.academic_year),
  //     department_name: data.department_name,
  //     qp_file: qpFile,
  //     scheme_file: schemeFile,
  //   };

  //   // If in edit mode, call editPaper with payload and the edit ID
  //   if (isEditSession) {
  //     editPaper(
  //       { newPaperdata: payload, id: editId },
  //       {
  //         onSuccess: () => {
  //           reset(); // Resets form in the UI
  //           onCloseModal?.(); // Closes dialog/modal if supplied
  //         },
  //       }
  //     );
  //     // Else, create a new paper
  //   } else {
  //     createPaper(
  //       {
  //         ...data, // Includes all fields being tracked by react-hook-form (may include IDs if present)
  //         qp_file_url: data.qp_file[0], // Passes the raw File for upload
  //         scheme_file_url: data.scheme_file[0], // Passes the raw File
  //       },
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
            maxLength: { value: 8, message: "Max 8 characters" }, // correct for strings
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
        <Input
          type="text"
          id="department_name"
          disabled={isWorking}
          {...register("department_name", {
            required: "This field is required!",
            maxLength: { value: 4, message: "Max 4 characters" },
          })}
        />
      </FormRow>

      {/* QP File upload: required, .doc/.docx */}
      {/* <FormRow label="QP File (.doc/.docx)" error={errors?.qp_file?.message}>
        <FileInput
          id="qp_file"
          accept=".doc,.docx"
          {...register("qp_file", {
            required: "This field is required!",
          })}
        />
      </FormRow> */}
      <FileInput
        id="qp_file"
        accept=".doc,.docx"
        {...register("qp_file", {
          required: !isEditSession ? "This field is required!" : false, // required only when adding!
        })}
      />
      {/* Scheme File upload: required, .doc/.docx */}
      {/* <FormRow
        label="Schema File (.doc/.docx)"
        error={errors?.scheme_file?.message}
      >
        <FileInput
          id="scheme_file"
          accept=".doc,.docx"
          {...register("scheme_file", {
            required: "This field is required!",
          })}
        />
      </FormRow> */}
      <FileInput
        id="scheme_file"
        accept=".doc,.docx"
        {...register("scheme_file", {
          required: !isEditSession ? "This field is required!" : false, // required only when adding!
        })}
      />

      {/* Form action buttons row (reset/cancel and submit) */}
      <FormRow>
        {/* Cancel/close button (resets and/or closes modal) */}
        <Button
          variation="secondary"
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
