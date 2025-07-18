import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
import FormRow from "../../ui/FormRow";

import { createPapers } from "../../services/apiFaculty";

function CreatePaperForm() {
  const QueryClient = useQueryClient();

  const { mutate, isLoading: isCreating } = useMutation({
    mutationFn: createPapers,
    onSuccess: () => {
      toast.success("New paper successfully created!");
      QueryClient.invalidateQueries({ queryKey: ["exam_papers"] });
      reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { register, handleSubmit, reset, formState } = useForm();
  const { errors } = formState;

  function onSubmit(data) {
    mutate({ ...data, qp_file_url: data.qp_file_url[0] });
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Name" error={errors?.name?.message}>
        <Input
          type="text"
          id="name"
          disabled={isCreating}
          {...register("name", {
            required: "This field is required!",
          })}
        />
      </FormRow>

      <FormRow label="Name" error={errors?.name?.message}>
        <Input
          type="number"
          id="maxCapacity"
          disabled={isCreating}
          {...register("name", {
            required: "This field is required!",
          })}
        />
      </FormRow>

      <FormRow label="Name" error={errors?.name?.message}>
        <Input
          type="number"
          id="regularPrice"
          disabled={isCreating}
          {...register("name", {
            required: "This field is required!",
          })}
        />
      </FormRow>

      <FormRow label="Name" error={errors?.name?.message}>
        <Input
          type="number"
          id="discount"
          defaultValue={0}
          disabled={isCreating}
          {...register("name", {
            required: "This field is required!",
          })}
        />
      </FormRow>

      <FormRow label="Name" error={errors?.name?.message}>
        <Textarea
          type="number"
          id="description"
          defaultValue=""
          disabled={isCreating}
          {...register("name", {
            required: "This field is required!",
          })}
        />
      </FormRow>

      <FormRow label="Name" error={errors?.name?.message}>
        <FileInput
          id="image"
          accept="image/*"
          disabled={isCreating}
          {...register("name", {
            required: "This field is required!",
          })}
        />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button variation="secondary" type="reset">
          Cancel
        </Button>
        <Button disabled={isCreating}>Add Paper</Button>
      </FormRow>
    </Form>
  );
}

export default CreatePaperForm;
