import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PhoneInput } from "./PhoneInput";

describe("PhoneInput", () => {
  it("renders with label and input", () => {
    render(<PhoneInput onChange={vi.fn()} />);

    expect(screen.getByText("Phone Number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Phone number")).toBeInTheDocument();
  });

  it("renders country dropdown with default country", () => {
    render(<PhoneInput onChange={vi.fn()} defaultCountry="US" />);

    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("calls onChange with digits and country code on input", () => {
    const onChange = vi.fn();
    render(<PhoneInput onChange={onChange} defaultCountry="US" />);

    fireEvent.change(screen.getByPlaceholderText("Phone number"), {
      target: { value: "415-555-2671" },
    });

    expect(onChange).toHaveBeenCalledWith("4155552671", "US");
  });

  it("strips non-digit non-formatting characters from input", () => {
    const onChange = vi.fn();
    render(<PhoneInput onChange={onChange} defaultCountry="US" />);

    fireEvent.change(screen.getByPlaceholderText("Phone number"), {
      target: { value: "(415) 555-abc" },
    });

    expect(onChange).toHaveBeenCalledWith("415555", "US");
  });

  it("shows validation error on blur for empty input", () => {
    render(<PhoneInput onChange={vi.fn()} defaultCountry="US" />);

    fireEvent.blur(screen.getByPlaceholderText("Phone number"));

    expect(screen.getByRole("alert")).toHaveTextContent("Phone number is required");
  });

  it("shows validation error on blur for invalid phone", () => {
    render(<PhoneInput onChange={vi.fn()} defaultCountry="US" value="415" />);

    fireEvent.blur(screen.getByPlaceholderText("Phone number"));

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not show error before blur", () => {
    render(<PhoneInput onChange={vi.fn()} defaultCountry="US" value="415" />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onValidationChange on blur", () => {
    const onValidationChange = vi.fn();
    render(
      <PhoneInput onChange={vi.fn()} onValidationChange={onValidationChange} defaultCountry="US" />,
    );

    fireEvent.blur(screen.getByPlaceholderText("Phone number"));

    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({ valid: false }),
    );
  });

  it("opens country dropdown and shows search", () => {
    render(<PhoneInput onChange={vi.fn()} defaultCountry="US" />);

    fireEvent.click(screen.getByRole("button", { name: "Country code" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("changes country and calls onChange with new country code", () => {
    const onChange = vi.fn();
    render(<PhoneInput onChange={onChange} defaultCountry="US" value="1234567890" />);

    fireEvent.click(screen.getByRole("button", { name: "Country code" }));
    fireEvent.click(screen.getByText("United Kingdom"));

    expect(onChange).toHaveBeenCalledWith("1234567890", "GB");
  });

  it("filters countries in dropdown search", () => {
    render(<PhoneInput onChange={vi.fn()} defaultCountry="US" />);

    fireEvent.click(screen.getByRole("button", { name: "Country code" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "mex" } });

    expect(screen.getByText("Mexico")).toBeInTheDocument();
    expect(screen.queryByText("United Kingdom")).not.toBeInTheDocument();
  });

  it("handles paste with dial code prefix and selects correct country", () => {
    const onChange = vi.fn();
    render(<PhoneInput onChange={onChange} defaultCountry="US" />);

    const input = screen.getByPlaceholderText("Phone number");
    const clipboardData = { getData: () => "+447911123456" };
    fireEvent.paste(input, { clipboardData });

    expect(onChange).toHaveBeenCalledWith("7911123456", "GB");
  });

  it("keeps current country on paste if dial code matches current", () => {
    const onChange = vi.fn();
    render(<PhoneInput onChange={onChange} defaultCountry="US" />);

    const input = screen.getByPlaceholderText("Phone number");
    const clipboardData = { getData: () => "+14155552671" };
    fireEvent.paste(input, { clipboardData });

    expect(onChange).toHaveBeenCalledWith("4155552671", "US");
  });

  it("uses controlled value when provided", () => {
    render(<PhoneInput onChange={vi.fn()} value="5551234567" defaultCountry="US" />);

    expect(screen.getByPlaceholderText("Phone number")).toHaveValue("5551234567");
  });

  it("marks input as required", () => {
    render(<PhoneInput onChange={vi.fn()} />);

    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
