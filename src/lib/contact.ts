export const EMAIL_ERROR = "Enter a valid email address or leave it blank.";

// Call with a trimmed value; an empty email keeps the note anonymous.
export function isValidNoteEmail(email: string) {
  if (!email) return true;
  const [local, domain] = email.split("@");
  return email.length <= 254
    && local.length <= 64
    && !local.startsWith(".") && !local.endsWith(".") && !local.includes("..")
    && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email)
    && domain.split(".").every((label) => label.length <= 63);
}
