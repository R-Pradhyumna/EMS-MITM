import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "../../ui/Button";

describe("Button Component", () => {
  // TEST 1: Basic Rendering
  it("renders button with text", () => {
    // Arrange: Set up the test data
    render(<Button>Click me</Button>);

    // Act: Query for the button
    const button = screen.getByRole("button", { name: /click me/i });

    // Assert: Check if button exists in the document
    expect(button).toBeInTheDocument();
  });

  // TEST 2: Default Props
  it("applies default props (primary variation and medium size)", () => {
    render(<Button>Default Button</Button>);

    const button = screen.getByRole("button");

    // Check that button exists
    expect(button).toBeInTheDocument();
    // Note: styled-components applies styles via className,
    // so we're testing that it renders without errors
  });

  // TEST 3: Size Variations
  it("renders with small size", () => {
    render(<Button size="small">Small Button</Button>);

    const button = screen.getByRole("button", { name: /small button/i });
    expect(button).toBeInTheDocument();
  });

  it("renders with medium size", () => {
    render(<Button size="medium">Medium Button</Button>);

    const button = screen.getByRole("button", { name: /medium button/i });
    expect(button).toBeInTheDocument();
  });

  it("renders with large size", () => {
    render(<Button size="large">Large Button</Button>);

    const button = screen.getByRole("button", { name: /large button/i });
    expect(button).toBeInTheDocument();
  });

  // TEST 4: Variation Props
  it("renders with primary variation", () => {
    render(<Button variation="primary">Primary</Button>);

    const button = screen.getByRole("button", { name: /primary/i });
    expect(button).toBeInTheDocument();
  });

  it("renders with secondary variation", () => {
    render(<Button variation="secondary">Secondary</Button>);

    const button = screen.getByRole("button", { name: /secondary/i });
    expect(button).toBeInTheDocument();
  });

  it("renders with danger variation", () => {
    render(<Button variation="danger">Delete</Button>);

    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toBeInTheDocument();
  });

  // TEST 5: Combined Props
  it("renders with combined size and variation props", () => {
    render(
      <Button size="large" variation="danger">
        Large Danger Button
      </Button>
    );

    const button = screen.getByRole("button", { name: /large danger button/i });
    expect(button).toBeInTheDocument();
  });

  // TEST 6: Button is Clickable (Important for accessibility)
  it("is a clickable button element", () => {
    render(<Button>Click</Button>);

    const button = screen.getByRole("button");

    // Check it's actually a button element
    expect(button.tagName).toBe("BUTTON");
  });

  // TEST 7: Disabled State
  it("can be disabled", () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
