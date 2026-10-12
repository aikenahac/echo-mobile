import i18n from "i18next";

export type AuthField = "email" | "password" | "code" | "form";
export type AuthError = { field: AuthField; message: string };

type ClerkErr = { code?: string; message?: string; longMessage?: string; meta?: { paramName?: string } };

const CODES: Record<string, { field: AuthField; key: string }> = {
  form_password_incorrect: { field: "password", key: "wrongPassword" },
  form_identifier_not_found: { field: "email", key: "noAccount" },
  form_identifier_exists: { field: "email", key: "emailTaken" },
  form_param_format_invalid: { field: "email", key: "invalidEmail" },
  form_password_length_too_short: { field: "password", key: "passwordShort" },
  form_password_pwned: { field: "password", key: "passwordPwned" },
  form_code_incorrect: { field: "code", key: "wrongCode" },
  verification_expired: { field: "code", key: "codeExpired" },
  verification_failed: { field: "code", key: "wrongCode" },
  too_many_requests: { field: "form", key: "tooMany" },
};

const FIELD_BY_PARAM: Record<string, AuthField> = {
  identifier: "email",
  email_address: "email",
  emailAddress: "email",
  password: "password",
  code: "code",
};

/**
 * Turn a Clerk error into a message for the field it belongs to. Auth errors are always
 * shown inline under the field, never as a toast (HANDOFF.md).
 */
export function authError(err: unknown): AuthError {
  const first = (err as { errors?: Array<ClerkErr> })?.errors?.[0];
  const known = first?.code ? CODES[first.code] : undefined;
  if (known) return { field: known.field, message: i18n.t(`auth.errors.${known.key}`) };
  const field = (first?.meta?.paramName && FIELD_BY_PARAM[first.meta.paramName]) || "form";
  return { field, message: first?.longMessage ?? first?.message ?? i18n.t("auth.errors.generic") };
}

export const MIN_PASSWORD = 8;
