import styled from "styled-components";
import Spinner from "./../../ui/Spinner";
import PaperRow from "./PaperRow";
import { usePapers } from "./usePapers";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import { useSearchParams } from "react-router-dom";

function PaperTable() {
  const { isLoading, papers } = usePapers();
  const [searchParams] = useSearchParams();

  if (isLoading) return <Spinner />;

  // 1. Filter
  const filterValue = searchParams.get("dept") || "all";

  let filteredPapers;
  if (filterValue === "all") filteredPapers = papers;
  if (filterValue === "dept" && currentUser?.department_id) {
    filteredPapers = papers.filter(
      (paper) => paper.department_id === currentUser.department_id
    );
  }

  // 2. Sort
  const sortBy = searchParams.get("sortBy") || "scheme";

  let sortedPapers;
  if (sortBy === "scheme")
    sortedPapers = filteredPapers.sort(
      (a, b) => a.academic_year - b.academic_year
    );

  if (sortBy === "sem")
    sortedPapers = filteredPapers.sort((a, b) => a.semester - b.semester);

  return (
    <Menus>
      <Table columns="0.6fr 1.8fr 2.2fr 1fr 1fr 1fr">
        <Table.Header>
          <div></div>
          <div>Subject Code</div>
          <div>Subject Name</div>
          <div>Semester</div>
          <div>Status</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={sortedPapers}
          render={(paper) => <PaperRow paper={paper} key={paper.id} />}
        />
      </Table>
    </Menus>
  );
}

export default PaperTable;
