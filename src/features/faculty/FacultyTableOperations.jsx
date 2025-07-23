import TableOperations from "./../../ui/TableOperations";
import Filter from "../../ui/Filter";
import SortBy from "../../ui/sortBy";

function FacultyTableOperations() {
  return (
    <TableOperations>
      <Filter
        filterField="papers"
        options={[
          { value: "all", label: "All papers" },
          { value: "dept", label: "Filter by dept" },
        ]}
      />

      <SortBy
        options={[
          { value: "scheme", label: "Sort by scheme" },
          { value: "sem", label: "Sort by semester" },
        ]}
      />
    </TableOperations>
  );
}

export default FacultyTableOperations;
