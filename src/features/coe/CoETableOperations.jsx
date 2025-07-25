import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import SearchBar from "../../ui/Searchbar";

function CoETableOperations() {
  return (
    <TableOperations>
      <Filter
        filterField="department_name"
        options={[
          { value: "all", label: "All" },
          { value: "ISE", label: "Information Science" },
          { value: "CSE", label: "Computer Science" },
        ]}
      />

      <Filter
        filterField="academic_year"
        options={[
          { value: "all", label: "All" },
          { value: "2023", label: "2023" },
        ]}
      />

      <SearchBar />

      {/* <SortBy
        options={[
          { value: "academic_year-asc", label: "Sort by scheme (ascending)" },
          { value: "academic_year-desc", label: "Sort by scheme(desceding)" },
          { value: "semester-asc", label: "Sort by semester(1-8)" },
          {
            value: "semester-desc",
            label: "Sort by semester(8-1)",
          },
        ]}
      /> */}
    </TableOperations>
  );
}

export default CoETableOperations;
