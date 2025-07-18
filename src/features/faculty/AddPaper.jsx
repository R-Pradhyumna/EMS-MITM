import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import CreatePaperForm from "./CreatePaperForm";

function AddPaper() {
  return (
    <div>
      <Modal>
        <Modal.Open opens="paper-form">
          <Button>Add paper</Button>
        </Modal.Open>
        <Modal.Window name="paper-form">
          <CreatePaperForm />
        </Modal.Window>
      </Modal>
    </div>
  );
}

export default AddPaper;
