import TableOperations from "./../../ui/TableOperations";
import SortBy from "../../ui/SortBy";

function FacultyTableOperations() {
  return (
    <TableOperations>
      <SortBy
        options={[
          {
            value: "academic_year-asc",
            label: "Sort by academic year(ascending)",
          },
          {
            value: "academic_year-desc",
            label: "Sort by academic year(descending)",
          },
          { value: "semester-asc", label: "Sort by semester(1-8)" },
          { value: "semester-desc", label: "Sort by semester(8-1)" },
        ]}
      />
    </TableOperations>
  );
}

export default FacultyTableOperations;
