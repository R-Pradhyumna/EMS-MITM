import { useAcademicYear } from "../../hooks/useAcademicYear";
import { useDepartments } from "../../hooks/useDepartments";
import Filter from "../../ui/Filter";
import SearchBar from "../../ui/Searchbar";
import TableOperations from "../../ui/TableOperations";
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
  const { data = [] } = useDepartments();
  const { ay = [] } = useAcademicYear();

  const departments = [
    { value: "", label: "Departments" },
    ...data.map((dep) => ({
      value: dep.name,
      label: dep.name,
    })),
  ];

  const uniqueYears = Array.from(new Set(ay.map((ay) => ay.academic_year)));
  const academic_years = [
    { value: "", label: "Academic Year" },
    ...uniqueYears.map((year) => ({
      value: year,
      label: year,
    })),
  ];

  return (
    <TableOperations>
      {/* Filter by department_name (dropdown) */}
      <Filter filterField="department_name" options={departments} />

      {/* Filter by academic_year (dropdown) */}
      <Filter filterField="academic_year" options={academic_years} />

      {/* Freeform search - typically by subject code/name */}
      <SearchBar />
    </TableOperations>
  );
}

export default PrincipalTableOperations;
