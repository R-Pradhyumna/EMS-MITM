import ExamControlOperations from "./../features/examcontrol/ExamControlOperations";

import Heading from "../ui/Heading";
import Row from "../ui/Row";

function ExamControl() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Examination Control</Heading>
      </Row>

      <ExamControlOperations />
    </>
  );
}

export default ExamControl;
