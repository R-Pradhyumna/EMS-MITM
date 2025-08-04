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
      <SearchBar />
    </TableOperations>
  );
}

export default CoETableOperations;
