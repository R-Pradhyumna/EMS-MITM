import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as useUploadScrutinizedFilesModule from "../../../features/boe/useUploadScrutinizedFiles";
import PaperDataBox from "../../../features/coe/PaperDataBox";

// Mock dependencies
vi.mock("react-hot-toast");
vi.mock("../../../features/boe/useUploadScrutinizedFiles");
vi.mock("../../../ui/DataItem", () => ({
  default: ({ label, children }) => (
    <div data-testid="data-item">
      <span>{label}</span>
      <span>{children}</span>
    </div>
  ),
}));

// Mock window.matchMedia
beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("PaperDataBox - Unit Tests", () => {
  let queryClient;
  const mockMutate = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    vi.spyOn(
      useUploadScrutinizedFilesModule,
      "useUploadScrutinizedFiles"
    ).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockPaper = {
    id: 123,
    status: "Submitted",
    subject_name: "Data Structures",
    subject_code: "CS101",
    department_name: "Computer Science",
    semester: "5th Semester",
    academic_year: "2024-25",
    uploaded_by: "John Doe",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-16T14:45:00Z",
    approved_by: null,
    downloaded_at: null,
    qp_file_url: null,
    scheme_file_url: null,
  };

  // ==================== NULL/UNDEFINED HANDLING ====================
  describe("Null/Undefined Handling", () => {
    it("returns null when paper is null", () => {
      // ARRANGE & ACT
      const { container } = render(<PaperDataBox paper={null} />, { wrapper });

      // ASSERT
      expect(container.firstChild).toBeNull();
    });

    it("returns null when paper is undefined", () => {
      // ARRANGE & ACT
      const { container } = render(<PaperDataBox paper={undefined} />, {
        wrapper,
      });

      // ASSERT
      expect(container.firstChild).toBeNull();
    });
  });

  // ==================== RENDERING ====================
  // ==================== RENDERING ====================
  describe("Rendering", () => {
    it("renders paper data box with all information", () => {
      // ARRANGE & ACT
      render(<PaperDataBox paper={mockPaper} />, { wrapper });

      // ASSERT
      expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
      const cs101Elements = screen.getAllByText(/CS101/i);
      expect(cs101Elements.length).toBeGreaterThan(0);
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Computer Science/i)).toBeInTheDocument();
    });

    it("renders header with status badge", () => {
      // ARRANGE & ACT
      render(<PaperDataBox paper={mockPaper} />, { wrapper });

      // ASSERT
      expect(screen.getByText("Submitted")).toBeInTheDocument();
    });

    it("renders subject name and code", () => {
      // ARRANGE & ACT
      render(<PaperDataBox paper={mockPaper} />, { wrapper });

      // ASSERT
      expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
      const codeElements = screen.getAllByText(/CS101/i);
      expect(codeElements.length).toBeGreaterThan(0);
    });

    // ... rest remain the same
  });

  // ==================== STATUS BADGE ====================
  describe("Status Badge", () => {
    const statuses = [
      "Submitted",
      "CoE-approved",
      "BoE-approved",
      "Locked",
      "Downloaded",
    ];

    statuses.forEach((status) => {
      it(`renders ${status} status badge correctly`, () => {
        // ARRANGE
        const paperWithStatus = { ...mockPaper, status };

        // ACT
        render(<PaperDataBox paper={paperWithStatus} />, { wrapper });

        // ASSERT
        const statusText = status.replace("-", " ");
        expect(screen.getByText(statusText)).toBeInTheDocument();
      });
    });
  });

  // ==================== DATE FORMATTING ====================
  describe("Date Formatting", () => {
    it("renders created_at date when provided", () => {
      // ARRANGE & ACT
      render(<PaperDataBox paper={mockPaper} />, { wrapper });

      // ASSERT
      expect(screen.getByText(/Mon, Jan 15 2024/i)).toBeInTheDocument();
    });

    it("renders updated_at date when different from created_at", () => {
      // ARRANGE
      const paperWithUpdate = {
        ...mockPaper,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      };

      // ACT
      render(<PaperDataBox paper={paperWithUpdate} />, { wrapper });

      // ASSERT
      expect(screen.getByText(/Mon, Jan 15 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/Sat, Jan 20 2024/i)).toBeInTheDocument();
    });

    it("does not render updated_at when same as created_at", () => {
      // ARRANGE
      const paperSameDates = {
        ...mockPaper,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
      };

      // ACT
      render(<PaperDataBox paper={paperSameDates} />, { wrapper });

      // ASSERT
      const dataItems = screen.getAllByTestId("data-item");
      const approvedLabels = dataItems.filter((item) =>
        item.textContent.includes("Approved")
      );
      expect(approvedLabels.length).toBe(0);
    });

    it("renders downloaded_at date when provided", () => {
      // ARRANGE
      const paperWithDownload = {
        ...mockPaper,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
        downloaded_at: "2024-01-25T09:00:00Z",
      };

      // ACT
      render(<PaperDataBox paper={paperWithDownload} />, { wrapper });

      // ASSERT
      expect(screen.getByText(/Thu, Jan 25 2024/i)).toBeInTheDocument();
    });
  });

  // ==================== APPROVED BY ====================
  describe("Approved By", () => {
    it("renders approved_by when provided", () => {
      // ARRANGE
      const paperWithApprover = {
        ...mockPaper,
        approved_by: "Jane Smith",
      };

      // ACT
      render(<PaperDataBox paper={paperWithApprover} />, { wrapper });

      // ASSERT
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("does not render approved_by when null", () => {
      // ARRANGE & ACT
      render(<PaperDataBox paper={mockPaper} />, { wrapper });

      // ASSERT
      const dataItems = screen.getAllByTestId("data-item");
      const approvedByItem = dataItems.find((item) =>
        item.textContent.includes("Approved by")
      );
      expect(approvedByItem).toBeUndefined();
    });
  });

  // ==================== BOE ROLE SPECIFIC ====================
  describe("BoE Role Specific", () => {
    it("renders download buttons for BoE role with file URLs", () => {
      // ARRANGE
      const paperWithFiles = {
        ...mockPaper,
        qp_file_url: "https://example.com/qp.pdf",
        scheme_file_url: "https://example.com/scheme.pdf",
      };

      // ACT
      render(<PaperDataBox paper={paperWithFiles} role="BoE" />, { wrapper });

      // ASSERT
      expect(
        screen.getByRole("link", { name: /Download QP/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /Download Schema/i })
      ).toBeInTheDocument();
    });

    it("renders Edit Paper button for BoE role", () => {
      // ARRANGE & ACT
      render(<PaperDataBox paper={mockPaper} role="BoE" />, { wrapper });

      // ASSERT
      expect(
        screen.getByRole("button", { name: /Edit Paper/i })
      ).toBeInTheDocument();
    });

    it("does not render BoE buttons when role is not BoE", () => {
      // ARRANGE & ACT
      render(<PaperDataBox paper={mockPaper} role="CoE" />, { wrapper });

      // ASSERT
      expect(
        screen.queryByRole("button", { name: /Edit Paper/i })
      ).not.toBeInTheDocument();
    });

    it("toggles to Cancel button when Edit Paper is clicked", async () => {
      // ARRANGE
      const user = userEvent.setup();
      render(<PaperDataBox paper={mockPaper} role="BoE" />, { wrapper });

      // ACT
      const editButton = screen.getByRole("button", { name: /Edit Paper/i });
      await user.click(editButton);

      // ASSERT
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Cancel/i })
        ).toBeInTheDocument();
      });
    });
  });

  // ==================== FILE UPLOAD ====================
  describe("File Upload", () => {
    // ... other tests remain the same until "calls uploadFiles mutation"

    it("calls uploadFiles mutation with correct data", async () => {
      // ARRANGE
      const user = userEvent.setup();
      const qpFile = new File(["qp content"], "qp.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const schemaFile = new File(["schema content"], "schema.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      render(<PaperDataBox paper={mockPaper} role="BoE" />, { wrapper });

      // ACT
      const editButton = screen.getByRole("button", { name: /Edit Paper/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getAllByLabelText(/Upload Corrected/i).length).toBe(2);
      });

      const [qpInput, schemaInput] =
        screen.getAllByLabelText(/Upload Corrected/i);
      await user.upload(qpInput, qpFile);
      await user.upload(schemaInput, schemaFile);

      const uploadButton = screen.getByRole("button", {
        name: /Upload Corrected Files/i,
      });
      await user.click(uploadButton);

      // ASSERT - Check that mutate was called (may include onSuccess callback)
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      // Check the mutation was called with an object containing paper, qpFile, schemaFile
      const callArg = mockMutate.mock.calls[0][0];
      expect(callArg.paper).toEqual(mockPaper);
      expect(callArg.qpFile).toBe(qpFile);
      expect(callArg.schemaFile).toBe(schemaFile);
    });

    it("shows Uploading text when isLoading is true", async () => {
      // ARRANGE
      vi.spyOn(
        useUploadScrutinizedFilesModule,
        "useUploadScrutinizedFiles"
      ).mockReturnValue({
        mutate: mockMutate,
        isLoading: true,
      });

      const user = userEvent.setup();
      render(<PaperDataBox paper={mockPaper} role="BoE" />, { wrapper });

      // ACT
      const editButton = screen.getByRole("button", { name: /Edit Paper/i });
      await user.click(editButton);

      // ASSERT
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Uploading.../i })
        ).toBeInTheDocument();
      });
    });

    it("disables file inputs when uploading", async () => {
      // ARRANGE
      vi.spyOn(
        useUploadScrutinizedFilesModule,
        "useUploadScrutinizedFiles"
      ).mockReturnValue({
        mutate: mockMutate,
        isLoading: true,
      });

      const user = userEvent.setup();
      render(<PaperDataBox paper={mockPaper} role="BoE" />, { wrapper });

      // ACT
      const editButton = screen.getByRole("button", { name: /Edit Paper/i });
      await user.click(editButton);

      // ASSERT
      await waitFor(() => {
        const fileInputs = screen.getAllByLabelText(/Upload Corrected/i);
        fileInputs.forEach((input) => {
          expect(input).toBeDisabled();
        });
      });
    });
  });

  // ==================== EDGE CASES ====================
  describe("Edge Cases", () => {
    it("handles paper without subject_code", () => {
      // ARRANGE
      const paperWithoutCode = { ...mockPaper, subject_code: null };

      // ACT
      render(<PaperDataBox paper={paperWithoutCode} />, { wrapper });

      // ASSERT
      expect(screen.getByText("Data Structures")).toBeInTheDocument();
      expect(screen.queryByText(/\(CS101\)/i)).not.toBeInTheDocument();
    });

    it("handles null dates gracefully", () => {
      // ARRANGE
      const paperWithNullDates = {
        ...mockPaper,
        created_at: null,
        updated_at: null,
        downloaded_at: null,
      };

      // ACT
      render(<PaperDataBox paper={paperWithNullDates} />, { wrapper });

      // ASSERT
      expect(screen.getByText(/Data Structures/i)).toBeInTheDocument();
    });

    it("cancels editing and resets files when Cancel is clicked", async () => {
      // ARRANGE
      const user = userEvent.setup();
      const qpFile = new File(["qp"], "qp.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      render(<PaperDataBox paper={mockPaper} role="BoE" />, { wrapper });

      // ACT - Start editing and select file
      const editButton = screen.getByRole("button", { name: /Edit Paper/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getAllByLabelText(/Upload Corrected/i).length).toBe(2);
      });

      const [qpInput] = screen.getAllByLabelText(/Upload Corrected/i);
      await user.upload(qpInput, qpFile);

      // ACT - Cancel
      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelButton);

      // ASSERT - Should be back to Edit Paper button
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Edit Paper/i })
        ).toBeInTheDocument();
      });
    });
  });
});
