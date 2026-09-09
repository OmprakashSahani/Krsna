import { describe, expect, it } from "vitest";
import { isValidNoteEmail } from "./contact";

describe("isValidNoteEmail", () => {
  it.each([
    ["empty email", "", true],
    ["normal email", "visitor@example.com", true],
    ["uppercase plus address", "Visitor+Notes@EXAMPLE.COM", true],
    ["missing @", "visitor.example.com", false],
    ["missing domain suffix", "visitor@example", false],
    ["embedded whitespace", "visit or@example.com", false],
    ["surrounding whitespace", " visitor@example.com ", false],
    ["multiple @ signs", "visitor@@example.com", false],
    ["leading local-part dot", ".visitor@example.com", false],
    ["trailing local-part dot", "visitor.@example.com", false],
    ["consecutive local-part dots", "visit..or@example.com", false],
    ["leading domain hyphen", "visitor@-example.com", false],
    ["trailing domain hyphen", "visitor@example-.com", false],
  ])("validates %s", (_description, email, valid) => {
    expect(isValidNoteEmail(email)).toBe(valid);
  });

  it.each([64, 65])("enforces the local-part limit at %i characters", (length) => {
    const email = `${"a".repeat(length)}@example.com`;
    expect(isValidNoteEmail(email)).toBe(length === 64);
  });

  it.each([
    ["first", 0],
    ["middle", 1],
    ["last", 2],
  ])("enforces the length limit for the %s domain label", (_position, index) => {
    for (const length of [63, 64]) {
      const labels = ["mail", "example", "com"];
      labels[index] = "a".repeat(length);
      expect(isValidNoteEmail(`visitor@${labels.join(".")}`)).toBe(length === 63);
    }
  });

  it.each([254, 255])("enforces the length limit at %i characters", (length) => {
    // Keep the local part and every domain label valid at both boundaries.
    const email = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(length - 193)}`;
    expect(email).toHaveLength(length);
    expect(isValidNoteEmail(email)).toBe(length === 254);
  });
});
