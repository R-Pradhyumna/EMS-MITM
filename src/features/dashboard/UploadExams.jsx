import { useRef } from "react";
import Button from "../../ui/Button"; // Use your actual Button import
import { uploadExamScheduleFile } from "../../services/apiDashboard"; // See previous solution
import toast from "react-hot-toast";

export function UploadExams() {
  const fileInputRef = useRef();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await uploadExamScheduleFile(file); // parses and uploads subjects
      toast.success("Exam schedule uploaded successfully!");
      // Optionally refresh subjects table here
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    }
    event.target.value = ""; // reset file input
  };

  return (
    <>
      <Button size="small" variation="primary" onClick={handleClick}>
        Upload exam schedule
      </Button>
      <input
        type="file"
        accept=".csv,.xlsx"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
}
