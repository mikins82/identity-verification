import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Camera,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useVerificationStore } from "@/store/verificationStore";

type VerificationStep = "selfie" | "phone" | "address";

const STEPS = [
  { key: "selfie" as const, label: "Selfie", icon: Camera },
  { key: "phone" as const, label: "Phone", icon: Phone },
  { key: "address" as const, label: "Address", icon: MapPin },
] as const;

interface AddressFields {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

const EMPTY_ADDRESS: AddressFields = {
  street: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
};

export function VerifyPage() {
  const allowed = useRouteGuard({ requireCart: true });
  const navigate = useNavigate();
  const setIdentityData = useVerificationStore((s) => s.setIdentityData);

  const [step, setStep] = useState<VerificationStep>("selfie");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [address, setAddress] = useState<AddressFields>(EMPTY_ADDRESS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentIndex = STEPS.findIndex((s) => s.key === step);

  const canAdvance = (): boolean => {
    switch (step) {
      case "selfie":
        return selfie !== null;
      case "phone":
        return phone.replace(/\D/g, "").length >= 7;
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
    if (step === "selfie") setStep("phone");
    else if (step === "phone") setStep("address");
  };

  const handleBack = () => {
    if (step === "phone") setStep("selfie");
    else if (step === "address") setStep("phone");
  };

  const handleSubmit = async () => {
    if (!selfie) return;
    setIsSubmitting(true);
    try {
      // Phase 3 replaces this block with: await getIdentityData(...)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const score =
        Math.random() > 0.3
          ? Math.floor(Math.random() * 51) + 50
          : Math.floor(Math.random() * 50);
      setIdentityData({
        selfieUrl: selfie,
        phone: `+1${phone.replace(/\D/g, "")}`,
        address,
        score,
        status: score >= 50 ? "verified" : "failed",
      });
      navigate("/verify/result");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!allowed) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Identity Verification
      </h1>

      <StepIndicator currentIndex={currentIndex} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{STEPS[currentIndex].label}</CardTitle>
          <CardDescription>
            Step {currentIndex + 1} of {STEPS.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "selfie" && (
            <SelfieStepPlaceholder selfie={selfie} onCapture={setSelfie} />
          )}
          {step === "phone" && (
            <PhoneStepPlaceholder
              phone={phone}
              countryCode={countryCode}
              onPhoneChange={setPhone}
              onCountryChange={setCountryCode}
            />
          )}
          {step === "address" && (
            <AddressStepPlaceholder address={address} onChange={setAddress} />
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

function SelfieStepPlaceholder({
  selfie,
  onCapture,
}: {
  selfie: string | null;
  onCapture: (url: string) => void;
}) {
  // Phase 3 replaces this with <SelfieCapture onCapture={onCapture} />
  const simulateCapture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(0, 0, 320, 240);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Simulated Selfie", 160, 125);
    }
    onCapture(canvas.toDataURL("image/jpeg", 0.8));
  };

  return (
    <div className="space-y-4">
      <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
        {selfie ? (
          <img
            src={selfie}
            alt="Captured selfie"
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <div className="text-center">
            <Camera className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              SelfieCapture component will be mounted here
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={simulateCapture}
          variant={selfie ? "outline" : "default"}
        >
          <Camera className="mr-2 h-4 w-4" />
          {selfie ? "Retake" : "Simulate Capture"}
        </Button>
      </div>
    </div>
  );
}

function PhoneStepPlaceholder({
  phone,
  countryCode,
  onPhoneChange,
  onCountryChange,
}: {
  phone: string;
  countryCode: string;
  onPhoneChange: (v: string) => void;
  onCountryChange: (v: string) => void;
}) {
  // Phase 3 replaces this with <PhoneInput onChange={...} />
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        PhoneInput component will be mounted here
      </p>
      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <div>
          <label
            htmlFor="country-code"
            className="mb-1.5 block text-sm font-medium"
          >
            Country
          </label>
          <select
            id="country-code"
            value={countryCode}
            onChange={(e) => onCountryChange(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="US">US (+1)</option>
            <option value="GB">GB (+44)</option>
            <option value="MX">MX (+52)</option>
            <option value="CA">CA (+1)</option>
            <option value="DE">DE (+49)</option>
          </select>
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="(415) 555-2671"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}

function AddressStepPlaceholder({
  address,
  onChange,
}: {
  address: AddressFields;
  onChange: (a: AddressFields) => void;
}) {
  // Phase 3 replaces this with <AddressForm onChange={...} />
  const update = (field: keyof AddressFields, value: string) => {
    onChange({ ...address, [field]: value });
  };

  const inputClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        AddressForm component will be mounted here
      </p>

      <div>
        <label htmlFor="street" className="mb-1.5 block text-sm font-medium">
          Street Address
        </label>
        <input
          id="street"
          value={address.street}
          onChange={(e) => update("street", e.target.value)}
          placeholder="123 Main St"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1.5 block text-sm font-medium">
            City
          </label>
          <input
            id="city"
            value={address.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="San Francisco"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="state" className="mb-1.5 block text-sm font-medium">
            State / Province
          </label>
          <input
            id="state"
            value={address.state}
            onChange={(e) => update("state", e.target.value)}
            placeholder="CA"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="country"
            className="mb-1.5 block text-sm font-medium"
          >
            Country
          </label>
          <input
            id="country"
            value={address.country}
            onChange={(e) => update("country", e.target.value)}
            placeholder="United States"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="postalCode"
            className="mb-1.5 block text-sm font-medium"
          >
            Postal Code
          </label>
          <input
            id="postalCode"
            value={address.postalCode}
            onChange={(e) => update("postalCode", e.target.value)}
            placeholder="94102"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
