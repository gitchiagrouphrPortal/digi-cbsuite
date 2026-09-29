// DigiCB Risk Management — aggregator for all framework risk seeds (server-only).
// Combines detailed, clause-linked risk records for all four accreditation frameworks.
import type { StoredRecord } from "./records-schema";
import { seedRisks17021 } from "./records-risks-seed-17021.server";
import { seedRisksPS4992 } from "./records-risks-seed-ps4992.server";
import { seedRisks17024 } from "./records-risks-seed-17024.server";
import { seedRisks17065 } from "./records-risks-seed-17065.server";

export function seedAllFrameworkRisks(): StoredRecord[] {
  return [...seedRisks17021(), ...seedRisksPS4992(), ...seedRisks17024(), ...seedRisks17065()];
}
