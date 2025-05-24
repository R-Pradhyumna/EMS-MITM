import { useState } from "react";
import PaperTable from "../features/faculty/PaperTable";
import Button from "../ui/Button";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import CreatePaperForm from "../features/faculty/CreatePaperForm";

function Faculty() {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Faculty Portal</Heading>
        <p>Filter / Sort</p>
      </Row>

      <Row>
        <PaperTable />
        <Button onClick={() => setShowForm((show) => !show)}>
          Add new paper
        </Button>
        {showForm && <CreatePaperForm />}
      </Row>
    </>
  );
}

export default Faculty;
