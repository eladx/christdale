"use client";

const REQUIREMENTS = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "Contains an uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "Contains a lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "Contains a number", test: (pw: string) => /[0-9]/.test(pw) },
  {
    label: "Contains a special character",
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
];

function CheckIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {filled ? (
        <path d="M20 6 9 17l-5-5" />
      ) : (
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
      )}
    </svg>
  );
}

export function isPasswordValid(password: string): boolean {
  return REQUIREMENTS.every((r) => r.test(password));
}

export default function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1">
      {REQUIREMENTS.map((req) => {
        const met = req.test(password);
        return (
          <li
            key={req.label}
            className={`flex items-center gap-2 text-xs ${
              met ? "text-accentSoft" : "text-muted"
            }`}
          >
            <CheckIcon filled={met} />
            {req.label}
          </li>
        );
      })}
    </ul>
  );
}
