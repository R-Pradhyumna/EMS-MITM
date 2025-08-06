// Import reusable UI components and the form for adding a paper
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import CreatePaperForm from "./CreatePaperForm";

/**
 * AddPaper
 * ----------
 * Renders a button that, when clicked, opens a modal dialog.
 * Inside the modal, the CreatePaperForm is displayed to allow the user to add a new exam paper.
 * All modal state (open/close) and UI are handled by the Modal component.
 */
function AddPaper() {
  return (
    <div>
      {/* Modal manages its own open/close state and portal rendering */}
      <Modal>
        {/* Modal.Open is a render-prop component:
            When the child (Add paper button) is clicked, it opens the modal window named "paper-form"
        */}
        <Modal.Open opens="paper-form">
          <Button>Add paper</Button>
        </Modal.Open>
        {/* Modal.Window declares a modal dialog with the given name. 
            This dialog opens when Modal.Open(opens="paper-form") is triggered.
            It renders the CreatePaperForm inside the modal overlay.
        */}
        <Modal.Window name="paper-form">
          <CreatePaperForm />
        </Modal.Window>
      </Modal>
    </div>
  );
}

export default AddPaper;
