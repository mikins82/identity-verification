import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useCallbackRef } from "./useCallbackRef";

describe("useCallbackRef", () => {
  it("returns a stable function reference across rerenders", () => {
    const { result, rerender } = renderHook(
      ({ cb }) => useCallbackRef(cb),
      { initialProps: { cb: vi.fn() } },
    );

    const firstRef = result.current;
    rerender({ cb: vi.fn() });
    expect(result.current).toBe(firstRef);
  });

  it("always invokes the latest callback version", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useCallbackRef(cb),
      { initialProps: { cb: first } },
    );

    result.current();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();

    rerender({ cb: second });
    result.current();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("passes arguments through to the callback", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useCallbackRef(callback));

    (result.current as (...args: unknown[]) => unknown)("a", 42);
    expect(callback).toHaveBeenCalledWith("a", 42);
  });

  it("returns the callback's return value", () => {
    const callback = vi.fn(() => "hello");
    const { result } = renderHook(() => useCallbackRef(callback));

    expect(result.current()).toBe("hello");
  });

  it("handles callbacks that throw", () => {
    const callback = vi.fn(() => {
      throw new Error("boom");
    });
    const { result } = renderHook(() => useCallbackRef(callback));

    expect(() => result.current()).toThrow("boom");
  });

  it("updates ref synchronously after render", () => {
    const calls: string[] = [];
    const first = () => calls.push("first");
    const second = () => calls.push("second");

    const { result, rerender } = renderHook(
      ({ cb }) => useCallbackRef(cb),
      { initialProps: { cb: first } },
    );

    rerender({ cb: second });
    result.current();

    expect(calls).toEqual(["second"]);
  });
});
