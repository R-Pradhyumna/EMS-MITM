import TableOperations from "../../ui/TableOperations";
import { UploadExams } from "./UploadExams";
import { UploadSubjects } from "./UploadSubjects";

function DashboardTableOperations() {
  return (
    <TableOperations>
      <UploadSubjects />
      <UploadExams />
    </TableOperations>
  );
}

export default DashboardTableOperations;
