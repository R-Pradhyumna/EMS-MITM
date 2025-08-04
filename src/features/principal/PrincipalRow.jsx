import Button from "../../ui/Button";
import Table from "../../ui/Table";

function PrincipalRow({ row, onDownload, PAPER_SLOTS }) {
  const { subject_code, papers = [], downloaded } = row;

  // Pad papers array to fixed slots length for consistent column layout
  const paddedPapers = [
    ...papers,
    ...Array(Math.max(0, PAPER_SLOTS - papers.length)).fill(null),
  ];

  return (
    <Table.Row>
      <div>{subject_code}</div>
      {paddedPapers.map((paper, idx) => (
        <div
          key={
            paper
              ? `${subject_code}-${paper.id}`
              : `${subject_code}-slot-${idx}`
          }
        >
          {paper ? (
            <>
              {paper.qp_file_url && (
                <Button
                  as="a"
                  href={paper.qp_file_url}
                  download
                  target="_blank"
                  style={{ marginRight: ".5rem" }}
                >
                  Download QP
                </Button>
              )}
            </>
          ) : (
            "-"
          )}
        </div>
      ))}
    </Table.Row>
  );
}

export default PrincipalRow;
