import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Dropdown } from "./Dropdown";

interface Fruit {
  id: string;
  name: string;
}

const fruits: Fruit[] = [
  { id: "apple", name: "Apple" },
  { id: "banana", name: "Banana" },
  { id: "cherry", name: "Cherry" },
  { id: "dragonfruit", name: "Dragonfruit" },
];

function renderDropdown(props: Partial<React.ComponentProps<typeof Dropdown<Fruit>>> = {}) {
  const defaultProps = {
    options: fruits,
    value: null,
    onChange: vi.fn(),
    renderOption: (f: Fruit) => <span>{f.name}</span>,
    renderSelected: (f: Fruit) => <span>{f.name}</span>,
    filterFn: (f: Fruit, q: string) => f.name.toLowerCase().includes(q.toLowerCase()),
    keyFn: (f: Fruit) => f.id,
    label: "Select a fruit",
    ...props,
  };

  return { ...render(<Dropdown {...defaultProps} />), props: defaultProps };
}

describe("Dropdown", () => {
  it("renders trigger with placeholder when no value", () => {
    renderDropdown({ placeholder: "Pick a fruit" });
    expect(screen.getByText("Pick a fruit")).toBeInTheDocument();
  });

  it("renders trigger with selected value", () => {
    renderDropdown({ value: fruits[1] });
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("opens dropdown panel on trigger click", () => {
    renderDropdown();
    const trigger = screen.getByRole("button", { name: "Select a fruit" });
    fireEvent.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("closes dropdown on second trigger click", () => {
    renderDropdown();
    const trigger = screen.getByRole("button", { name: "Select a fruit" });
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("calls onChange when an option is clicked", () => {
    const onChange = vi.fn();
    renderDropdown({ onChange });

    fireEvent.click(screen.getByRole("button", { name: "Select a fruit" }));
    fireEvent.click(screen.getByText("Cherry"));

    expect(onChange).toHaveBeenCalledWith(fruits[2]);
  });

  it("closes dropdown after selection", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Select a fruit" }));
    fireEvent.click(screen.getByText("Apple"));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters options based on search query", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Select a fruit" }));
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "an" } });

    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.queryByText("Cherry")).not.toBeInTheDocument();
  });

  it("shows 'No results found' when filter matches nothing", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Select a fruit" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "xyz" } });

    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("supports keyboard navigation with ArrowDown", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Select a fruit" }));
    const searchInput = screen.getByRole("searchbox");

    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveClass("active");

    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    expect(options[1]).toHaveClass("active");
  });

  it("supports keyboard selection with Enter", () => {
    const onChange = vi.fn();
    renderDropdown({ onChange });

    fireEvent.click(screen.getByRole("button", { name: "Select a fruit" }));
    const searchInput = screen.getByRole("searchbox");

    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith(fruits[1]);
  });

  it("closes on Escape key", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Select a fruit" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not open when disabled", () => {
    renderDropdown({ disabled: true });

    const trigger = screen.getByRole("button", { name: "Select a fruit" });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("marks the selected option with aria-selected", () => {
    renderDropdown({ value: fruits[2] });

    fireEvent.click(screen.getByRole("button", { name: "Select a fruit" }));
    const options = screen.getAllByRole("option");
    expect(options[2]).toHaveAttribute("aria-selected", "true");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
  });

  it("sets aria-expanded correctly", () => {
    renderDropdown();
    const trigger = screen.getByRole("button", { name: "Select a fruit" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
