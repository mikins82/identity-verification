import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("renders label text", () => {
    render(
      <FormField label="Email">
        <input type="email" />
      </FormField>,
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders children input", () => {
    render(
      <FormField label="Name" htmlFor="name-input">
        <input id="name-input" type="text" />
      </FormField>,
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("shows required asterisk when required is true", () => {
    render(
      <FormField label="Name" required>
        <input />
      </FormField>,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not show required asterisk when required is false", () => {
    render(
      <FormField label="Name">
        <input />
      </FormField>,
    );

    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("displays error message with alert role", () => {
    render(
      <FormField label="Email" error="Invalid email address">
        <input />
      </FormField>,
    );

    const errorEl = screen.getByRole("alert");
    expect(errorEl).toHaveTextContent("Invalid email address");
  });

  it("displays hint text when no error", () => {
    render(
      <FormField label="Phone" hint="Include country code">
        <input />
      </FormField>,
    );

    expect(screen.getByText("Include country code")).toBeInTheDocument();
  });

  it("hides hint when error is present", () => {
    render(
      <FormField label="Phone" hint="Include country code" error="Required">
        <input />
      </FormField>,
    );

    expect(screen.queryByText("Include country code")).not.toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("associates label with input via htmlFor", () => {
    render(
      <FormField label="Username" htmlFor="user-input">
        <input id="user-input" />
      </FormField>,
    );

    const label = screen.getByText("Username");
    expect(label).toHaveAttribute("for", "user-input");
  });

  it("applies custom className", () => {
    const { container } = render(
      <FormField label="Test" className="custom-class">
        <input />
      </FormField>,
    );

    expect(container.firstElementChild).toHaveClass("custom-class");
  });
});
