import SortBy from "../../ui/SortBy";
import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import { getDepartments } from "../../services/apiCoE";

// const { dept } = getDepartments();

function CoETableOperations() {
  return (
    <TableOperations>
      {/* <Filter filterField="status" options={dept.name} /> */}
      <Filter
        filterField="dept"
        options={[
          { value: "all", label: "All" },
          { value: "CSE", label: "Computer Science" },
          { value: "ECE", label: "Electronics" },
          // etc.
        ]}
      />

      <Filter
        filterField="academic_year"
        options={[
          { value: "all", label: "All" },
          { value: "2021", label: "2021" },
          // etc.
        ]}
      />

      {/* <Filter
        filterField=""
        options={[
          { value: "dept", label: "Filter by dept" },
          { value: "academic_year", label: "Filter by scheme" },
        ]}
      /> */}

      <SortBy
        options={[
          { value: "academic_year-asc", label: "Sort by scheme (ascending)" },
          { value: "academic_year-desc", label: "Sort by scheme(desceding)" },
          { value: "semester-asc", label: "Sort by semester(1-8)" },
          {
            value: "semester-desc",
            label: "Sort by semester(8-1)",
          },
        ]}
      />
    </TableOperations>
  );
}

export default CoETableOperations;
