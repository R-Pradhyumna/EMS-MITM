import TableOperations from "../../ui/TableOperations";
import { UploadExams } from "./UploadExams";
import { UploadSubjects } from "./UploadSubjects";
import UploadUsers from "./UploadUsers";

function DashboardTableOperations() {
  return (
    <TableOperations>
      <UploadSubjects />
      <UploadExams />
      <UploadUsers />
    </TableOperations>
  );
}

export default DashboardTableOperations;
