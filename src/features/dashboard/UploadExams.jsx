import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../ui/Button";
import { uploadExamScheduleFile } from "../../services/apiDashboard";

export function UploadExams() {
  const fileInputRef = useRef();
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    event.target.value = ""; // Reset early to allow re-upload

    if (!file) return;

    // Validate file type
    const validTypes = [".csv", ".xlsx"];
    if (!validTypes.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      toast.error("Please upload a CSV or Excel (.xlsx) file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      await uploadExamScheduleFile(file);
      toast.success("Exam schedule uploaded successfully!");
      // Optionally refresh exams table here
    } catch (err) {
      toast.error(
        err.message || "Upload failed. Please check the file and try again."
      );
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        size="small"
        variation="primary"
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload exam schedule"}
      </Button>
      <input
        type="file"
        accept=".csv,.xlsx"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </>
  );
}
