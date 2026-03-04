import { render, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useRef } from "react";
import { useClickOutside } from "./useClickOutside";

function TestHarness({
  handler,
  active,
}: {
  handler: () => void;
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, handler, active);
  return (
    <div>
      <div ref={ref} data-testid="inside">
        <span data-testid="nested">Nested child</span>
      </div>
      <div data-testid="outside">Outside</div>
    </div>
  );
}

describe("useClickOutside", () => {
  it("calls handler on mousedown outside the ref element", () => {
    const handler = vi.fn();
    render(<TestHarness handler={handler} />);

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call handler on mousedown inside the ref element", () => {
    const handler = vi.fn();
    render(<TestHarness handler={handler} />);

    fireEvent.mouseDown(screen.getByTestId("inside"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not call handler on mousedown on a nested child", () => {
    const handler = vi.fn();
    render(<TestHarness handler={handler} />);

    fireEvent.mouseDown(screen.getByTestId("nested"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("calls handler on touchstart outside", () => {
    const handler = vi.fn();
    render(<TestHarness handler={handler} />);

    fireEvent.touchStart(screen.getByTestId("outside"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire when active is false", () => {
    const handler = vi.fn();
    render(<TestHarness handler={handler} active={false} />);

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("fires when active is explicitly true", () => {
    const handler = vi.fn();
    render(<TestHarness handler={handler} active={true} />);

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("removes listeners on unmount", () => {
    const handler = vi.fn();
    const { unmount } = render(<TestHarness handler={handler} />);

    unmount();
    fireEvent.mouseDown(document.body);
    expect(handler).not.toHaveBeenCalled();
  });

  it("removes listeners when active toggles to false", () => {
    const handler = vi.fn();
    const { rerender } = render(<TestHarness handler={handler} active={true} />);

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(handler).toHaveBeenCalledTimes(1);

    rerender(<TestHarness handler={handler} active={false} />);
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
