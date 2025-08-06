import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import SearchBar from "../../ui/Searchbar";

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
  return (
    // Container for all table-level operations and controls
    <TableOperations>
      {/* Department Name filter: lets user filter by ISE, CSE, or show All */}
      <Filter
        filterField="department_name"
        options={[
          { value: "all", label: "All" },
          { value: "ISE", label: "Information Science" },
          { value: "CSE", label: "Computer Science" },
        ]}
      />

      {/* Academic Year filter: select 2023 or show All years */}
      <Filter
        filterField="academic_year"
        options={[
          { value: "all", label: "All" },
          { value: "2023", label: "2023" },
        ]}
      />

      {/* Status filter: filter by submission/approval/download status */}
      <Filter
        filterField="status"
        options={[
          { value: "all", label: "All" },
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
