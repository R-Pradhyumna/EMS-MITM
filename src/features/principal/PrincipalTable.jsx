import Table from "../../ui/Table";
import Empty from "../../ui/Empty";
import Spinner from "../../ui/Spinner";
import Pagination from "../../ui/Pagination";
import PrincipalRow from "./PrincipalRow";
import { usePPapers } from "./usePPapers";
import { PAPER_SLOTS } from "../../utils/constants";

function PrincipalTable({ onDownload }) {
  const { isLoading, papers: rows, count } = usePPapers();
  // console.log("rows:", rows, "count:", count);

  if (isLoading) return <Spinner />;
  if (!rows.length) return <Empty resourceName="papers" />;

  return (
    <Table columns={`1fr ${"1fr ".repeat(PAPER_SLOTS)}`.trim()}>
      <Table.Header>
        <div>Subject Code</div>
        {[...Array(PAPER_SLOTS)].map((_, idx) => (
          <div key={idx}>Paper-{idx + 1}</div>
        ))}
      </Table.Header>
      <Table.Body
        data={rows}
        render={(row) => (
          <PrincipalRow
            key={row.id}
            row={row}
            onDownload={onDownload}
            PAPER_SLOTS={PAPER_SLOTS}
          />
        )}
      />
      <Table.Footer>
        <Pagination count={count} />
      </Table.Footer>
    </Table>
  );
}

export default PrincipalTable;
