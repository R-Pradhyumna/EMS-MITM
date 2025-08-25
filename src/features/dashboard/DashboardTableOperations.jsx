import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import TableOperations from "../../ui/TableOperations";
import { UploadExams } from "./UploadExams";
import { UploadSubjects } from "./UploadSubjects";
import UploadUsers from "./UploadUsers";

function DashboardTableOperations() {
  const navigate = useNavigate();
  return (
    <TableOperations>
      <UploadSubjects />
      <UploadExams />
      <UploadUsers />
    </TableOperations>
  );
}

export default DashboardTableOperations;
