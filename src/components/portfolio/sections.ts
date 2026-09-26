export const sections = [
  { id: "about", index: "01", label: "About", side: "left" },
  { id: "resume", index: "02", label: "Resume", side: "left" },
  { id: "work", index: "03", label: "Current work", side: "left" },
  { id: "favorites", index: "04", label: "Favorites", side: "right" },
  { id: "research", index: "05", label: "Research interest", side: "right" },
  { id: "writing", index: "06", label: "Writing", side: "right" },
  { id: "contact", index: "07", label: "Contact", side: "right" },
  { id: "note", index: "08", label: "Leave a note", side: "right" },
] as const;
export type SectionId = typeof sections[number]["id"];
export type Section = typeof sections[number];
