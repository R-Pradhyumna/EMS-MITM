import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import TableOperations from "../../ui/TableOperations";
import { UploadExams } from "./UploadExams";
import { UploadSubjects } from "./UploadSubjects";

function DashboardTableOperations() {
  const navigate = useNavigate();
  return (
    <TableOperations>
      <UploadSubjects />
      <UploadExams />
      <Button onClick={() => navigate("/signup")} size="small">
        Create a new user
      </Button>
    </TableOperations>
  );
}

export default DashboardTableOperations;
