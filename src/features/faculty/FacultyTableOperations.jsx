import SortBy from "../../ui/SortBy";
import TableOperations from "./../../ui/TableOperations";

/**
 * FacultyTableOperations
 * -----------------------
 * Renders operation controls for the faculty papers table (or listing view).
 * Currently provides a "Sort By" control for academic year and semester,
 * both ascending and descending order.
 * Intended to be placed above or alongside your main table to give users easy sorting.
 */
function FacultyTableOperations() {
  return (
    // TableOperations is a layout/container for control elements above the table UI.
    <TableOperations>
      {/* SortBy provides a select/dropdown to control table sorting.
        Each option value follows the pattern: "column-direction".
        You should have logic elsewhere to consume this value and update the displayed data accordingly.
      */}
      <SortBy
        options={[
          {
            value: "academic_year-asc",
            label: "Sort by academic year (ascending)",
          },
          {
            value: "academic_year-desc",
            label: "Sort by academic year (descending)",
          },
          { value: "semester-asc", label: "Sort by semester (1-8)" },
          { value: "semester-desc", label: "Sort by semester (8-1)" },
        ]}
      />
    </TableOperations>
  );
}

export default FacultyTableOperations;
