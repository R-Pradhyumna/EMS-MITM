import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import SearchBar from "../../ui/Searchbar";
import { useAcademicYear } from "../../hooks/useAcademicYear";

/**
 * BoETableOperations
 * ---------------------
 * Provides filter and search controls for the Board of Examiners (BoE) table view.
 * - Offers filtering by academic year and status of papers
 * - Includes a search bar for keywords (likely subject code/name/etc)
 * - Is intended to be placed above the main BoETable to interactively scope/filter the data
 * - All controls are composed inside TableOperations for layout consistency
 *
 * Parent or context is responsible for wiring filter/search state to data fetcher/query keys.
 */
function BoETableOperations() {
  const { ay = [] } = useAcademicYear();

  const uniqueYears = Array.from(new Set(ay.map((ay) => ay.academic_year)));

  const academic_years = [
    { value: "", label: "Academic Year" },
    ...uniqueYears.map((year) => ({
      value: year,
      label: year,
    })),
  ];
  return (
    // Container providing consistent row/spacing for all table operations
    <TableOperations>
      {/* Academic Year Filter: dropdown for year-based filtering */}
      <Filter filterField="academic_year" options={academic_years} />

      {/* Status filter: restricts view to certain approval/download stages */}
      <Filter
        filterField="status"
        options={[
          { value: "all", label: "Status" },
          { value: "CoE-approved", label: "CoE-approved" },
          { value: "BoE-approved", label: "BoE-approved" },
          { value: "Locked", label: "Locked" },
        ]}
      />

      {/* Instant keyword search, typically for subject code/name/etc */}
      <SearchBar />
    </TableOperations>
  );
}

export default BoETableOperations;
