import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import SearchBar from "../../ui/Searchbar";

/**
 * PrincipalTableOperations
 * -------------------------
 * Presents table-wide controls for the Principal's view of exam papers:
 *   - Department filter: lets user filter by ISE/CSE/All
 *   - Academic year filter: lets user select a year or see all
 *   - Search bar: for searching by subject code, name, etc (as implemented in SearchBar)
 * All controls are grouped using the TableOperations layout component.
 * Parent/component context should connect filter/search state to data queries.
 */
function PrincipalTableOperations() {
  return (
    <TableOperations>
      {/* Filter by department_name (dropdown) */}
      <Filter
        filterField="department_name"
        options={[
          { value: "all", label: "All" },
          { value: "ISE", label: "Information Science" },
          { value: "CSE", label: "Computer Science" },
        ]}
      />

      {/* Filter by academic_year (dropdown) */}
      <Filter
        filterField="academic_year"
        options={[
          { value: "all", label: "All" },
          { value: "2023", label: "2023" },
        ]}
      />

      {/* Freeform search - typically by subject code/name */}
      <SearchBar />
    </TableOperations>
  );
}

export default PrincipalTableOperations;
