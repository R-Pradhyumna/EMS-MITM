import Filter from "../../ui/Filter";
import SearchBar from "../../ui/Searchbar";
import TableOperations from "../../ui/TableOperations";

import { useAcademicYear } from "../../hooks/useAcademicYear";
import { useDepartments } from "../../hooks/useDepartments";

/**
 * CoETableOperations
 * -------------------
 * Renders the operations bar for the CoE exam papers table.
 * Provides:
 *  - Department, academic year, and status filters
 *  - A search bar for quick lookup (by subject code, etc)
 *  - All controls are laid out with TableOperations as the container
 *
 * To be positioned above or adjacent to the main CoETable. Relies on
 * context or parent handlers to wire up filter/search state to data fetching.
 */
function CoETableOperations() {
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
    // Container for all table-level operations and controls
    <TableOperations>
      {/* Department Name filter: lets user filter by ISE, CSE, or show All */}
      <Filter filterField="department_name" options={departments} />

      {/* Academic Year filter: select 2023 or show All years */}
      <Filter filterField="academic_year" options={academic_years} />

      {/* Status filter: filter by submission/approval/download status */}
      <Filter
        filterField="status"
        options={[
          { value: "all", label: "Status" },
          { value: "Submitted", label: "Submitted" },
          { value: "CoE-approved", label: "CoE-approved" },
          { value: "BoE-approved", label: "BoE-approved" },
          { value: "Locked", label: "Locked" },
          { value: "Downloaded", label: "Downloaded" },
        ]}
      />

      {/* Search Bar: for searching papers by code, name, etc */}
      <SearchBar />
    </TableOperations>
  );
}

export default CoETableOperations;
