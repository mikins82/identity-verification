import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import styles from "./Dropdown.module.css";

export interface DropdownProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  renderOption: (option: T) => ReactNode;
  renderSelected: (option: T) => ReactNode;
  filterFn: (option: T, query: string) => boolean;
  keyFn: (option: T) => string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function Dropdown<T>({
  options,
  value,
  onChange,
  renderOption,
  renderSelected,
  filterFn,
  keyFn,
  placeholder = "Select...",
  className,
  disabled = false,
  label,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  useClickOutside(
    containerRef,
    () => {
      setIsOpen(false);
      setSearchQuery("");
    },
    isOpen,
  );

  const filtered = searchQuery ? options.filter((opt) => filterFn(opt, searchQuery)) : options;

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setActiveIndex(-1);
    setSearchQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [disabled]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
    setActiveIndex(-1);
  }, []);

  const select = useCallback(
    (option: T) => {
      onChange(option);
      close();
    },
    [onChange, close],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            open();
            return;
          }
          setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (isOpen && activeIndex >= 0 && activeIndex < filtered.length) {
            select(filtered[activeIndex]);
          } else if (!isOpen) {
            open();
          }
          break;
        case "Escape":
          e.preventDefault();
          close();
          break;
      }
    },
    [isOpen, activeIndex, filtered, open, close, select],
  );

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex] as HTMLElement | undefined;
      activeElement?.scrollIntoView?.({ block: "nearest" });
    }
  }, [activeIndex]);

  const listboxId = `${id}-listbox`;
  const activeId = activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className={`${styles.dropdown} ${className ?? ""}`}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => (isOpen ? close() : open())}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
      >
        {value ? (
          renderSelected(value)
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <span className={styles.chevron} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <input
            ref={inputRef}
            type="text"
            className={styles.search}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            role="searchbox"
            aria-label="Search options"
            aria-controls={listboxId}
            aria-activedescendant={activeId}
          />
          <ul ref={listRef} id={listboxId} role="listbox" className={styles.list} aria-label={label}>
            {filtered.length === 0 && <li className={styles.empty}>No results found</li>}
            {filtered.map((option, index) => (
              <li
                key={keyFn(option)}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={value !== null && keyFn(value) === keyFn(option)}
                className={`${styles.option} ${index === activeIndex ? styles.active : ""} ${value !== null && keyFn(value) === keyFn(option) ? styles.selected : ""}`}
                onClick={() => select(option)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {renderOption(option)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
