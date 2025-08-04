import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import SearchBar from "../../ui/Searchbar";

function PrincipalTableOperations() {
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
    </TableOperations>
  );
}

export default PrincipalTableOperations;
