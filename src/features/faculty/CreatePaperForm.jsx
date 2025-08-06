import { useForm } from "react-hook-form";

import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import FormRow from "./../../ui/FormRow";

import { useCreatePaper } from "./useCreatePaper";
import { useEditPaper } from "./useEditPaper";

// This works, but only manual entry
function CreatePaperForm({ paperToEdit = {}, onCloseModal }) {
  const { isCreating, createPaper } = useCreatePaper();
  const { isEditing, editPaper } = useEditPaper();
  const isWorking = isCreating || isEditing;

  const { id: editId, ...editValues } = paperToEdit;
  const isEditSession = Boolean(editId);

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: isEditSession ? editValues : {},
  });

  const { errors } = formState;

  function onSubmit(data) {
    const qpFile = data.qp_file[0];
    const schemeFile = data.scheme_file[0];

    const payload = {
      subject_code: data.subject_code,
      subject_name: data.subject_name,
      semester: data.semester,
      academic_year: Number(data.academic_year),
      department_name: data.department_name,
      qp_file: qpFile,
      scheme_file: schemeFile,
    };

    if (isEditSession) {
      editPaper(
        { newPaperdata: payload, id: editId },
        {
          onSuccess: () => {
            reset();
            onCloseModal?.();
          },
        }
      );
    } else {
      createPaper(
        {
          ...data, // exam_id, subject_id, etc.
          qp_file_url: data.qp_file[0],
          scheme_file_url: data.scheme_file[0],
        },
        {
          onSuccess: () => {
            reset();
            onCloseModal?.();
          },
        }
      );
    }
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      type={onCloseModal ? "modal" : "regular"}
    >
      <FormRow label="Subject Code" error={errors?.subject_code?.message}>
        <Input
          type="text"
          id="subject_code"
          disabled={isWorking}
          {...register("subject_code", {
            required: "This field is required!",
            maxLength: { value: 8, message: "Max 8 characters" },
          })}
        />
      </FormRow>

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

      <FormRow label="Department Name" error={errors?.department_name?.message}>
        <Input
          type="text"
          id="department_name"
          disabled={isWorking}
          {...register("department_name", {
            required: "This field is required!",
            max: 4,
          })}
        />
      </FormRow>

      <FormRow label="QP File (.doc/.docx)">
        <FileInput
          id="qp_file"
          accept=".doc,.docx"
          {...register("qp_file", {
            required: "This field is required!",
          })}
        />
      </FormRow>

      <FormRow label="Schema File (.doc/.docx)">
        <FileInput
          id="scheme_file"
          accept=".doc,.docx"
          {...register("scheme_file", {
            required: "This field is required!",
          })}
        />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button
          variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
        >
          Cancel
        </Button>
        <Button disabled={isWorking}>
          {isEditSession ? "Edit paper" : "Add Paper"}
        </Button>
      </FormRow>
    </Form>
  );
}

export default CreatePaperForm;
