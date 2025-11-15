import styled from "styled-components";
import Button from "../../ui/Button";
import Table from "../../ui/Table";

const SubCode = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  text-align: left;
  color: var(--color-grey-600);
  font-family: "Sono";
`;

// Styled cell for Subject Name, bold
const SubName = styled.div`
  font-family: "Sono";
  font-weight: 600;
  text-align: left;
`;

// Styled cell for Semester, with accent color
const Semester = styled.div`
  font-family: "Sono";
  font-weight: 500;
  color: var(--color-green-700);
  text-align: left;
`;

function DashboardRow({
  paper: {
    subject_code,
    academic_year,
    subject_name,
    semester,
    uploaded_by,
    scheme_file_url, // <- Make sure this is present in your paper object
  },
}) {
  const handleDownload = () => {
    // Download Scheme of Valuation file
    const link = document.createElement("a");
    link.href = scheme_file_url;
    link.download = `${subject_code}_SchemeOfValuation.`;
    link.click();
  };

  return (
    <Table.Row>
      <SubCode>{subject_code}</SubCode>
      <SubCode>{academic_year}</SubCode>
      <SubName>{subject_name}</SubName>
      <Semester>{semester}</Semester>
      <SubName>{uploaded_by}</SubName>
      {/* Download SoV button */}
      <Button
        size="medium"
        variation="primary"
        onClick={handleDownload}
        disabled={!scheme_file_url}
      >
        {scheme_file_url ? "Download" : "Not Available"}
      </Button>
    </Table.Row>
  );
}

export default DashboardRow;
