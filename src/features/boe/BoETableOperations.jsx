import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import SearchBar from "../../ui/Searchbar";

function BoETableOperations() {
  return (
    <TableOperations>
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

export default BoETableOperations;
