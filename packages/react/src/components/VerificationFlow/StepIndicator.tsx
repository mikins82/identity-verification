import styles from "./StepIndicator.module.css";
import type { VerificationStep } from "./useVerificationReducer";

interface StepDef {
  key: VerificationStep;
  label: string;
  number: number;
}

const STEPS: StepDef[] = [
  { key: "selfie", label: "Selfie", number: 1 },
  { key: "phone", label: "Phone", number: 2 },
  { key: "address", label: "Address", number: 3 },
];

export interface StepIndicatorProps {
  currentStep: VerificationStep | "verifying" | "complete" | "failed";
  className?: string;
}

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  const effectiveIndex = currentIndex >= 0 ? currentIndex : STEPS.length;

  return (
    <nav aria-label="Verification progress" className={`${styles.container} ${className ?? ""}`}>
      <ol className={styles.steps}>
        {STEPS.map((step, i) => {
          const completed = i < effectiveIndex;
          const active = i === currentIndex;

          return (
            <li key={step.key} className={styles.stepItem}>
              <div className={styles.stepCircle}>
                <div
                  className={`${styles.badge} ${active ? styles.badgeActive : ""} ${completed ? styles.badgeCompleted : ""}`}
                  aria-current={active ? "step" : undefined}
                >
                  {completed ? (
                    <svg
                      className={styles.checkIcon}
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.5 8.5L6.5 11.5L12.5 4.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span className={styles.number}>{step.number}</span>
                  )}
                </div>
                <span
                  className={`${styles.label} ${active ? styles.labelActive : ""} ${completed ? styles.labelCompleted : ""}`}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
