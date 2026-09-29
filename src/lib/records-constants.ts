// DigiCB constants shared across collection definitions.
// Kept in a standalone file to prevent circular module evaluation issues.

export const FRAMEWORKS = [
  { value: "17021", label: "ISO/IEC 17021-1" },
  { value: "ps4992", label: "PS 4992 (Halal)" },
  { value: "17024", label: "ISO/IEC 17024" },
  { value: "17065", label: "ISO/IEC 17065" },
];

export const STANDARDS = [
  "ISO 9001:2015",
  "ISO 14001:2015",
  "ISO 45001:2018",
  "ISO/IEC 27001:2022",
  "ISO 22000:2018",
  "ISO 13485:2016",
  "ISO/IEC 17024 personnel scheme",
  "ISO/IEC 17065 product scheme",
  "PS 4992 / Halal",
];

export const BRANCH_OPTS = [
  { value: "br_ho", label: "Head Office — Dubai" },
  { value: "br_ruh", label: "Riyadh Branch" },
  { value: "br_khi", label: "Karachi Branch" },
];

export const REVIEWER_OPTS = [
  { value: "u_cm", label: "Amira Haddad (Cert Mgr)" },
  { value: "u_rev1", label: "Imran Sheikh (Reviewer)" },
  { value: "u_rev2", label: "Fatima Zahra (Reviewer)" },
];
