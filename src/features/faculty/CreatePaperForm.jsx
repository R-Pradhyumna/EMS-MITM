import styled from "styled-components";
import { useForm } from "react-hook-form";

import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import FileInput from "../../ui/FileInput";
import Button from "../../ui/Button";
import Form from "../../ui/Form";

const FormRow = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 24rem 1fr 1.2fr;
  gap: 2.4rem;
  padding: 1.2rem 0;

  &:first-child {
    padding-top: 0;
  }
  &:last-child {
    padding-bottom: 0;
  }
  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }

  &:has(button) {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
  }
`;

const Label = styled.label`
  font-weight: 500;
`;

const Error = styled.span`
  font-size: 1.4rem;
  color: var(--color-red-700);
`;

function CreatePaperForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    // TODO: Handle file upload + Supabase insert
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Scheme */}
      <FormRow>
        <Label htmlFor="scheme">Scheme</Label>
        <select
          id="scheme"
          {...register("scheme", { required: "Scheme is required" })}
        >
          <option value="">Select scheme</option>
          {Array.from({ length: 4 }).map((_, i) => {
            const base = 2023;
            const year = base + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
        {errors.scheme && <Error>{errors.scheme.message}</Error>}
      </FormRow>

      {/* Semester */}
      <FormRow>
        <Label htmlFor="semester">Semester</Label>
        <select
          id="semester"
          {...register("semester", { required: "Semester is required" })}
        >
          <option value="">Select semester</option>
          {[...Array(8)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        {errors.semester && <Error>{errors.semester.message}</Error>}
      </FormRow>

      {/* Department */}
      <FormRow>
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          type="text"
          placeholder="e.g. ISE"
          {...register("department", { required: "Department is required" })}
        />
        {errors.department && <Error>{errors.department.message}</Error>}
      </FormRow>

      {/* Subject */}
      <FormRow>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          type="text"
          placeholder="e.g. OS"
          {...register("subject", { required: "Subject is required" })}
        />
        {errors.subject && <Error>{errors.subject.message}</Error>}
      </FormRow>

      {/* Paper Title */}
      <FormRow>
        <Label htmlFor="title">Paper Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter paper title"
          {...register("title", { required: "Paper title is required" })}
        />
        {errors.title && <Error>{errors.title.message}</Error>}
      </FormRow>

      {/* Description */}
      <FormRow>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" {...register("description")} />
      </FormRow>

      {/* Upload Question Paper */}
      <FormRow>
        <Label htmlFor="qp_file">Upload Question Paper</Label>
        <FileInput
          id="qp_file"
          accept="application/pdf"
          {...register("qp_file", { required: "Question Paper is required" })}
        />
        {errors.qp_file && <Error>{errors.qp_file.message}</Error>}
      </FormRow>

      {/* Upload Scheme of Valuation */}
      <FormRow>
        <Label htmlFor="scheme_file">Upload Scheme of Valuation</Label>
        <FileInput
          id="qp_file"
          accept="application/pdf"
          {...register("qp_file", { required: "Question Paper is required" })}
        />

        {errors.scheme_file && <Error>{errors.scheme_file.message}</Error>}
      </FormRow>

      {/* Action Buttons */}
      <FormRow>
        <Button variation="secondary" type="reset">
          Cancel
        </Button>
        <Button type="submit">Submit Paper</Button>
      </FormRow>
    </Form>
  );
}

export default CreatePaperForm;
