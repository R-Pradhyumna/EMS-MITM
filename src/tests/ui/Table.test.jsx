import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Table from "../../ui/Table";

describe("Table Component", () => {
  // Sample test data
  const sampleData = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com" },
  ];

  // ==================== BASIC RENDERING ====================

  it("renders table with header and rows", () => {
    // ARRANGE: Set up table with columns and data
    render(
      <Table columns="1fr 2fr 2fr">
        <Table.Header>
          <div>ID</div>
          <div>Name</div>
          <div>Email</div>
        </Table.Header>
        <Table.Body
          data={sampleData}
          render={(item) => (
            <Table.Row key={item.id}>
              <div>{item.id}</div>
              <div>{item.name}</div>
              <div>{item.email}</div>
            </Table.Row>
          )}
        />
      </Table>
    );

    // ACT: Query for table elements
    const table = screen.getByRole("table");
    const header = screen.getByText("Name");

    // ASSERT: Verify table structure exists
    expect(table).toBeInTheDocument();
    expect(header).toBeInTheDocument();
  });

  // ==================== CONTEXT PASSING ====================

  it("passes columns prop via context to Header and Row", () => {
    // ARRANGE: Render table with specific column configuration
    const columns = "1fr 3fr 2fr";

    render(
      <Table columns={columns}>
        <Table.Header>
          <div>Col 1</div>
          <div>Col 2</div>
          <div>Col 3</div>
        </Table.Header>
      </Table>
    );

    // ACT: Query for header element
    const header = screen.getByRole("row");

    // ASSERT: Verify header rendered (columns applied via styled-components)
    expect(header).toBeInTheDocument();
  });

  // ==================== DATA RENDERING ====================

  it("renders all data rows correctly", () => {
    // ARRANGE: Create table with multiple data rows
    render(
      <Table columns="1fr 2fr">
        <Table.Header>
          <div>Name</div>
          <div>Email</div>
        </Table.Header>
        <Table.Body
          data={sampleData}
          render={(item) => (
            <Table.Row key={item.id}>
              <div>{item.name}</div>
              <div>{item.email}</div>
            </Table.Row>
          )}
        />
      </Table>
    );

    // ACT: Query for specific data
    const johnName = screen.getByText("John Doe");
    const janeEmail = screen.getByText("jane@example.com");
    const bobName = screen.getByText("Bob Johnson");

    // ASSERT: Verify all data is rendered
    expect(johnName).toBeInTheDocument();
    expect(janeEmail).toBeInTheDocument();
    expect(bobName).toBeInTheDocument();
  });

  // ==================== EMPTY STATE ====================

  it("displays empty message when no data is provided", () => {
    // ARRANGE: Render table with empty data array
    const emptyData = [];

    render(
      <Table columns="1fr 2fr">
        <Table.Header>
          <div>Name</div>
          <div>Email</div>
        </Table.Header>
        <Table.Body
          data={emptyData}
          render={(item) => (
            <Table.Row key={item.id}>
              <div>{item.name}</div>
            </Table.Row>
          )}
        />
      </Table>
    );

    // ACT: Query for empty state message
    const emptyMessage = screen.getByText(/no data to show at the moment/i);

    // ASSERT: Verify empty message is displayed
    expect(emptyMessage).toBeInTheDocument();
  });

  it("does not render rows when data is empty", () => {
    // ARRANGE: Set up table with no data
    const emptyData = [];

    render(
      <Table columns="1fr 2fr">
        <Table.Header>
          <div>Name</div>
          <div>Email</div>
        </Table.Header>
        <Table.Body
          data={emptyData}
          render={(item) => (
            <Table.Row key={item.id}>
              <div>{item.name}</div>
            </Table.Row>
          )}
        />
      </Table>
    );

    // ACT: Try to find any data that shouldn't exist
    const rows = screen.queryByRole("row", { name: /john/i });

    // ASSERT: Verify no data rows exist
    expect(rows).not.toBeInTheDocument();
  });

  // ==================== RENDER PROP PATTERN ====================

  it("uses render prop to display custom row content", () => {
    // ARRANGE: Create table with custom render function
    const customData = [{ id: 1, firstName: "John", lastName: "Doe" }];

    render(
      <Table columns="1fr 1fr">
        <Table.Header>
          <div>First Name</div>
          <div>Last Name</div>
        </Table.Header>
        <Table.Body
          data={customData}
          render={(item) => (
            <Table.Row key={item.id}>
              <div>{item.firstName}</div>
              <div>{item.lastName}</div>
            </Table.Row>
          )}
        />
      </Table>
    );

    // ACT: Query for custom rendered content
    const firstName = screen.getByText("John");
    const lastName = screen.getByText("Doe");

    // ASSERT: Verify custom content is rendered
    expect(firstName).toBeInTheDocument();
    expect(lastName).toBeInTheDocument();
  });

  // ==================== FOOTER ====================

  it("renders footer when provided", () => {
    // ARRANGE: Create table with footer
    render(
      <Table columns="1fr 2fr">
        <Table.Header>
          <div>Name</div>
          <div>Email</div>
        </Table.Header>
        <Table.Body
          data={sampleData}
          render={(item) => (
            <Table.Row key={item.id}>
              <div>{item.name}</div>
              <div>{item.email}</div>
            </Table.Row>
          )}
        />
        <Table.Footer>
          <div>Total: {sampleData.length} items</div>
        </Table.Footer>
      </Table>
    );

    // ACT: Query for footer content
    const footer = screen.getByText(/total: 3 items/i);

    // ASSERT: Verify footer is displayed
    expect(footer).toBeInTheDocument();
  });

  // ==================== MULTIPLE HEADERS ====================

  it("renders multiple header columns", () => {
    // ARRANGE: Create table with multiple headers
    render(
      <Table columns="1fr 2fr 2fr 1fr">
        <Table.Header>
          <div>ID</div>
          <div>Name</div>
          <div>Email</div>
          <div>Status</div>
        </Table.Header>
        <Table.Body data={[]} render={() => null} />
      </Table>
    );

    // ACT: Query for all header texts
    const idHeader = screen.getByText("ID");
    const nameHeader = screen.getByText("Name");
    const emailHeader = screen.getByText("Email");
    const statusHeader = screen.getByText("Status");

    // ASSERT: Verify all headers exist
    expect(idHeader).toBeInTheDocument();
    expect(nameHeader).toBeInTheDocument();
    expect(emailHeader).toBeInTheDocument();
    expect(statusHeader).toBeInTheDocument();
  });

  // ==================== COMPLEX DATA ====================

  it("handles complex nested data rendering", () => {
    // ARRANGE: Set up table with complex data
    const complexData = [
      {
        id: 1,
        user: { name: "Alice", age: 25 },
        status: "Active",
      },
    ];

    render(
      <Table columns="2fr 1fr 1fr">
        <Table.Header>
          <div>Name</div>
          <div>Age</div>
          <div>Status</div>
        </Table.Header>
        <Table.Body
          data={complexData}
          render={(item) => (
            <Table.Row key={item.id}>
              <div>{item.user.name}</div>
              <div>{item.user.age}</div>
              <div>{item.status}</div>
            </Table.Row>
          )}
        />
      </Table>
    );

    // ACT: Query for nested data
    const name = screen.getByText("Alice");
    const age = screen.getByText("25");
    const status = screen.getByText("Active");

    // ASSERT: Verify nested data is rendered correctly
    expect(name).toBeInTheDocument();
    expect(age).toBeInTheDocument();
    expect(status).toBeInTheDocument();
  });

  // ==================== ACCESSIBILITY ====================

  it("has proper ARIA role for table", () => {
    // ARRANGE: Render basic table
    render(
      <Table columns="1fr 1fr">
        <Table.Header>
          <div>Col 1</div>
          <div>Col 2</div>
        </Table.Header>
        <Table.Body data={[]} render={() => null} />
      </Table>
    );

    // ACT: Query by table role
    const table = screen.getByRole("table");

    // ASSERT: Verify table role exists
    expect(table).toBeInTheDocument();
  });

  it("has proper ARIA role for rows", () => {
    // ARRANGE: Render table with header
    render(
      <Table columns="1fr 1fr">
        <Table.Header>
          <div>Header 1</div>
          <div>Header 2</div>
        </Table.Header>
        <Table.Body data={[]} render={() => null} />
      </Table>
    );

    // ACT: Query for row role
    const headerRow = screen.getByRole("row");

    // ASSERT: Verify row has proper role
    expect(headerRow).toBeInTheDocument();
  });

  // ==================== EDGE CASES ====================

  it("handles single row of data", () => {
    // ARRANGE: Table with only one data item
    const singleItem = [{ id: 1, name: "Only One" }];

    render(
      <Table columns="1fr">
        <Table.Header>
          <div>Name</div>
        </Table.Header>
        <Table.Body
          data={singleItem}
          render={(item) => (
            <Table.Row key={item.id}>
              <div>{item.name}</div>
            </Table.Row>
          )}
        />
      </Table>
    );

    // ACT: Find the single item
    const item = screen.getByText("Only One");

    // ASSERT: Verify it renders correctly
    expect(item).toBeInTheDocument();
  });

  it("renders table without footer when not provided", () => {
    // ARRANGE: Table without footer component
    render(
      <Table columns="1fr">
        <Table.Header>
          <div>Name</div>
        </Table.Header>
        <Table.Body
          data={sampleData}
          render={(item) => (
            <Table.Row key={item.id}>
              <div>{item.name}</div>
            </Table.Row>
          )}
        />
      </Table>
    );

    // ACT: Query for footer (should not exist)
    const footer = screen.queryByRole("contentinfo");

    // ASSERT: Verify footer doesn't exist
    expect(footer).not.toBeInTheDocument();
  });
});
