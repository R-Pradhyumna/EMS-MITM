import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import supabase from "../../services/supabase";
import Button from "../../ui/Button";

function UploadUsers() {
  const fileInputRef = useRef();
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    event.target.value = ""; // Reset early to allow re-upload of same file

    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      const csvText = await file.text();
      const { data, error } = await supabase.functions.invoke("createUsers", {
        body: csvText,
      });

      if (error) throw error;

      // Success feedback
      toast.success(
        data?.created
          ? `Users created: ${data.created}. ${
              data.errors?.length || 0
            } rows had errors.`
          : "No users were created."
      );

      // Show row errors to admin
      if (data?.errors?.length) {
        console.error("Row errors:", data.errors);
        // Optionally show these in a modal or expandable section for full details
        toast.error(
          `${data.errors.length} rows had errors. See console for details.`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.message || "Upload failed. Please check the CSV and try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isUploading}
        size="small"
        variation="primary"
      >
        {isUploading ? "Uploading..." : "Create new users"}
      </Button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
}

export default UploadUsers;
