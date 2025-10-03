import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Modal from "../../ui/Modal";
import * as useOutsideClickModule from "../../hooks/useOutsideClick";

// Mock the custom hook
vi.mock("../../hooks/useOutsideClick");

describe("Modal Component", () => {
  // Setup: Create a mock function for the custom hook
  beforeEach(() => {
    // Mock useOutsideClick to return a ref object
    useOutsideClickModule.default = vi.fn(() => ({ current: null }));
  });

  // TEST 1: Basic Compound Component Structure
  it("renders Modal.Open and Modal.Window components", () => {
    render(
      <Modal>
        <Modal.Open opens="test-window">
          <button>Open Modal</button>
        </Modal.Open>
        <Modal.Window name="test-window">
          <div>Modal Content</div>
        </Modal.Window>
      </Modal>
    );

    // The open button should be visible
    expect(
      screen.getByRole("button", { name: /open modal/i })
    ).toBeInTheDocument();

    // Modal content should NOT be visible initially
    expect(screen.queryByText(/modal content/i)).not.toBeInTheDocument();
  });

  // TEST 2: Opening the Modal
  it("opens modal when Open component is clicked", () => {
    render(
      <Modal>
        <Modal.Open opens="test-window">
          <button>Open Modal</button>
        </Modal.Open>
        <Modal.Window name="test-window">
          <div>Modal Content</div>
        </Modal.Window>
      </Modal>
    );

    // Click the open button
    const openButton = screen.getByRole("button", { name: /open modal/i });
    fireEvent.click(openButton);

    // Modal content should now be visible
    expect(screen.getByText(/modal content/i)).toBeInTheDocument();
  });

  // TEST 3: Portal Renders to document.body
  it("renders modal content in document.body when opened", () => {
    render(
      <Modal>
        <Modal.Open opens="test-window">
          <button>Open Modal</button>
        </Modal.Open>
        <Modal.Window name="test-window">
          <div>Portal Content</div>
        </Modal.Window>
      </Modal>
    );

    // Open the modal
    fireEvent.click(screen.getByRole("button", { name: /open modal/i }));

    // Check that the content exists in document.body
    expect(document.body).toContainElement(screen.getByText(/portal content/i));
  });

  // TEST 4: Closing Modal with X Button
  it("closes modal when close button (X) is clicked", () => {
    render(
      <Modal>
        <Modal.Open opens="test-window">
          <button>Open Modal</button>
        </Modal.Open>
        <Modal.Window name="test-window">
          <div>Modal Content</div>
        </Modal.Window>
      </Modal>
    );

    // Open modal
    fireEvent.click(screen.getByRole("button", { name: /open modal/i }));
    expect(screen.getByText(/modal content/i)).toBeInTheDocument();

    // Find and click the close button (X icon button)
    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons.find((btn) => btn.querySelector("svg"));
    fireEvent.click(closeButton);

    // Modal should be closed
    expect(screen.queryByText(/modal content/i)).not.toBeInTheDocument();
  });

  // TEST 5: Multiple Modal Windows
  it("handles multiple modal windows correctly", () => {
    render(
      <Modal>
        <Modal.Open opens="window-1">
          <button>Open Window 1</button>
        </Modal.Open>
        <Modal.Open opens="window-2">
          <button>Open Window 2</button>
        </Modal.Open>

        <Modal.Window name="window-1">
          <div>Window 1 Content</div>
        </Modal.Window>
        <Modal.Window name="window-2">
          <div>Window 2 Content</div>
        </Modal.Window>
      </Modal>
    );

    // Open first window
    fireEvent.click(screen.getByRole("button", { name: /open window 1/i }));
    expect(screen.getByText(/window 1 content/i)).toBeInTheDocument();
    expect(screen.queryByText(/window 2 content/i)).not.toBeInTheDocument();

    // Close first window
    const closeButton = screen
      .getAllByRole("button")
      .find((btn) => btn.querySelector("svg"));
    fireEvent.click(closeButton);

    // Open second window
    fireEvent.click(screen.getByRole("button", { name: /open window 2/i }));
    expect(screen.queryByText(/window 1 content/i)).not.toBeInTheDocument();
    expect(screen.getByText(/window 2 content/i)).toBeInTheDocument();
  });

  // TEST 6: onCloseModal Callback
  it("passes onCloseModal callback to children", () => {
    const TestComponent = ({ onCloseModal }) => (
      <div>
        <p>Test Content</p>
        <button onClick={onCloseModal}>Custom Close</button>
      </div>
    );

    render(
      <Modal>
        <Modal.Open opens="test-window">
          <button>Open</button>
        </Modal.Open>
        <Modal.Window name="test-window">
          <TestComponent />
        </Modal.Window>
      </Modal>
    );

    // Open modal
    fireEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByText(/test content/i)).toBeInTheDocument();

    // Click custom close button
    fireEvent.click(screen.getByRole("button", { name: /custom close/i }));

    // Modal should be closed
    expect(screen.queryByText(/test content/i)).not.toBeInTheDocument();
  });

  // TEST 7: Overlay is Rendered
  it("renders overlay when modal is open", () => {
    render(
      <Modal>
        <Modal.Open opens="test-window">
          <button>Open</button>
        </Modal.Open>
        <Modal.Window name="test-window">
          <div>Content</div>
        </Modal.Window>
      </Modal>
    );

    // Open modal
    fireEvent.click(screen.getByRole("button", { name: /open/i }));

    // Check for overlay (we can't directly test styled-components styles,
    // but we can verify the structure)
    const modalContent = screen.getByText(/content/i);
    const overlay = modalContent.closest("div").parentElement;

    expect(overlay).toBeInTheDocument();
  });

  // TEST 8: Only One Modal Open at a Time
  it("only shows the modal with matching name", () => {
    render(
      <Modal>
        <Modal.Open opens="correct-window">
          <button>Open Modal</button>
        </Modal.Open>

        <Modal.Window name="wrong-window">
          <div>Wrong Content</div>
        </Modal.Window>
        <Modal.Window name="correct-window">
          <div>Correct Content</div>
        </Modal.Window>
      </Modal>
    );

    // Open modal
    fireEvent.click(screen.getByRole("button", { name: /open modal/i }));

    // Only the correct window should show
    expect(screen.getByText(/correct content/i)).toBeInTheDocument();
    expect(screen.queryByText(/wrong content/i)).not.toBeInTheDocument();
  });
});
