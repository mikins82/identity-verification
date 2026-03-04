import { useState, useCallback } from "react";
import {
  Camera,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  SelfieCapture,
  PhoneInput,
  AddressForm,
  ThemeProvider,
  type Theme,
} from "@identity-verification/react";
import {
  getIdentityData,
  VerificationError,
  type Address,
  type IdentityData,
} from "@identity-verification/core";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type VerificationStep = "selfie" | "phone" | "address";

const STEPS = [
  { key: "selfie" as const, label: "Selfie", icon: Camera },
  { key: "phone" as const, label: "Phone", icon: Phone },
  { key: "address" as const, label: "Address", icon: MapPin },
] as const;

const EMPTY_ADDRESS: Address = {
  street: "",
  city: "",
  state: "",
  country: "US",
  postalCode: "",
};

const SKYRENT_THEME = {
  colors: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    success: "#16a34a",
    successLight: "#dcfce7",
  },
  borderRadius: "0.5rem",
} as Partial<Theme>;

export interface ManualVerificationProps {
  onComplete: (data: IdentityData) => void;
  onError?: (error: Error) => void;
}

export function ManualVerification({
  onComplete,
  onError,
}: ManualVerificationProps) {
  const [step, setStep] = useState<VerificationStep>("selfie");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentIndex = STEPS.findIndex((s) => s.key === step);

  const canAdvance = (): boolean => {
    switch (step) {
      case "selfie":
        return selfie !== null;
      case "phone":
        return phone.length >= 7;
      case "address":
        return (
          address.street.trim().length > 0 &&
          address.city.trim().length > 0 &&
          address.state.trim().length > 0 &&
          address.country.trim().length > 0 &&
          address.postalCode.trim().length > 0
        );
    }
  };

  const handleNext = () => {
    setSubmitError(null);
    if (step === "selfie") setStep("phone");
    else if (step === "phone") setStep("address");
  };

  const handleBack = () => {
    setSubmitError(null);
    if (step === "phone") setStep("selfie");
    else if (step === "address") setStep("phone");
  };

  const handlePhoneChange = useCallback(
    (phoneValue: string, country: string) => {
      setPhone(phoneValue);
      setCountryCode(country);
    },
    [],
  );

  const handleAddressChange = useCallback((addr: Address) => {
    setAddress(addr);
  }, []);

  const handleSubmit = async () => {
    if (!selfie) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await getIdentityData({
        selfie,
        phone,
        countryCode,
        address,
      });
      onComplete(result);
    } catch (err) {
      const message =
        err instanceof VerificationError
          ? err.message
          : "An unexpected error occurred";
      setSubmitError(message);
      onError?.(err as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <StepIndicator currentIndex={currentIndex} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{STEPS[currentIndex].label}</CardTitle>
          <CardDescription>
            Step {currentIndex + 1} of {STEPS.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeProvider theme={SKYRENT_THEME}>
            <div className={step !== "selfie" ? "hidden" : ""}>
              {selfie ? (
                <SelfiePreview
                  selfie={selfie}
                  onRetake={() => setSelfie(null)}
                />
              ) : (
                step === "selfie" && <SelfieCapture onCapture={setSelfie} />
              )}
            </div>
            <div
              className={step !== "phone" ? "hidden" : ""}
              aria-hidden={step !== "phone"}
            >
              <PhoneInput
                onChange={handlePhoneChange}
                defaultCountry={countryCode}
              />
            </div>
            <div
              className={step !== "address" ? "hidden" : ""}
              aria-hidden={step !== "address"}
            >
              <AddressForm
                onChange={handleAddressChange}
                defaultCountry={countryCode}
              />
            </div>
          </ThemeProvider>

          {submitError && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentIndex === 0 || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step === "address" ? (
          <Button
            onClick={handleSubmit}
            disabled={!canAdvance() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Submit Verification"
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canAdvance()}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SelfiePreview({
  selfie,
  onRetake,
}: {
  selfie: string;
  onRetake: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <img
          src={selfie}
          alt="Captured selfie"
          className="w-full object-cover"
        />
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-emerald-600" />
        <span className="text-sm text-muted-foreground">Photo captured</span>
      </div>
      <Button type="button" variant="outline" onClick={onRetake} size="sm">
        <Camera className="mr-2 h-4 w-4" />
        Retake Photo
      </Button>
    </div>
  );
}

function StepIndicator({ currentIndex }: { currentIndex: number }) {
  return (
    <nav aria-label="Verification steps" className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const completed = i < currentIndex;
        const active = i === currentIndex;
        const Icon = s.icon;

        return (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-8 sm:w-12 ${completed ? "bg-primary" : "bg-border"}`}
              />
            )}
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : completed
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
