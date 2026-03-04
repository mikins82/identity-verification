import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AddressForm } from "./AddressForm";

describe("AddressForm", () => {
  it("renders all five address fields", () => {
    render(<AddressForm onChange={vi.fn()} defaultCountry="US" />);

    expect(screen.getByText("Street Address")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("State / Province")).toBeInTheDocument();
    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(screen.getByText("Postal Code")).toBeInTheDocument();
  });

  it("all fields are marked as required", () => {
    render(<AddressForm onChange={vi.fn()} defaultCountry="US" />);

    const stars = screen.getAllByText("*");
    expect(stars).toHaveLength(5);
  });

  it("calls onChange with updated address when street changes", () => {
    const onChange = vi.fn();
    render(<AddressForm onChange={onChange} defaultCountry="US" />);

    fireEvent.change(screen.getByPlaceholderText("123 Main St"), {
      target: { value: "456 Oak Ave" },
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ street: "456 Oak Ave" }),
    );
  });

  it("calls onChange with updated address when city changes", () => {
    const onChange = vi.fn();
    render(<AddressForm onChange={onChange} defaultCountry="US" />);

    fireEvent.change(screen.getByPlaceholderText("City"), {
      target: { value: "San Francisco" },
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ city: "San Francisco" }),
    );
  });

  it("shows validation error on blur for empty required field", () => {
    render(<AddressForm onChange={vi.fn()} defaultCountry="US" />);

    fireEvent.blur(screen.getByPlaceholderText("123 Main St"));

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not show error before blur", () => {
    render(<AddressForm onChange={vi.fn()} defaultCountry="US" />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onValidationChange on blur", () => {
    const onValidationChange = vi.fn();
    render(
      <AddressForm
        onChange={vi.fn()}
        onValidationChange={onValidationChange}
        defaultCountry="US"
      />,
    );

    fireEvent.blur(screen.getByPlaceholderText("123 Main St"));

    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({ valid: false }),
    );
  });

  it("shows postal code hint for US", () => {
    render(<AddressForm onChange={vi.fn()} defaultCountry="US" />);

    expect(screen.getByText("e.g., 94102")).toBeInTheDocument();
  });

  it("initializes with default country", () => {
    render(<AddressForm onChange={vi.fn()} defaultCountry="GB" />);

    expect(screen.getByText("United Kingdom")).toBeInTheDocument();
  });

  it("renders country dropdown that can be opened", () => {
    render(<AddressForm onChange={vi.fn()} defaultCountry="US" />);

    fireEvent.click(screen.getByRole("button", { name: "Country" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("changes country when a new country is selected", () => {
    const onChange = vi.fn();
    render(<AddressForm onChange={onChange} defaultCountry="US" />);

    fireEvent.click(screen.getByRole("button", { name: "Country" }));
    fireEvent.click(screen.getByText("Germany"));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ country: "DE" }),
    );
  });

  it("accepts initial values from value prop", () => {
    render(
      <AddressForm
        onChange={vi.fn()}
        defaultCountry="US"
        value={{
          street: "123 Main St",
          city: "Springfield",
          state: "IL",
          postalCode: "62701",
        }}
      />,
    );

    expect(screen.getByPlaceholderText("123 Main St")).toHaveValue("123 Main St");
    expect(screen.getByPlaceholderText("City")).toHaveValue("Springfield");
    expect(screen.getByPlaceholderText("State")).toHaveValue("IL");
    expect(screen.getByPlaceholderText("Postal code")).toHaveValue("62701");
  });

  it("applies custom className", () => {
    const { container } = render(
      <AddressForm onChange={vi.fn()} className="my-form" />,
    );

    expect(container.firstElementChild).toHaveClass("my-form");
  });
});
